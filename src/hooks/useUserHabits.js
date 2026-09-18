import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { getTodayKey, dateToKey } from '../utils/calendarUtils';

const LOCAL_HABITS_KEY = 'habitwave_local_habits_v5';
const LOCAL_LOGS_KEY = 'habitwave_local_logs_v5';

export const DEFAULT_HABITS = [];

function generateInitialLocalLogs() {
  return {};
}

export function useUserHabits() {
  const { user, isConfigured, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState(() => {
    try {
      const lastUid = localStorage.getItem('habitwave_last_known_uid');
      if (lastUid) {
        const cached = localStorage.getItem(`habitwave_cached_habits_${lastUid}`);
        if (cached) return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Error reading cached habits:', e);
    }
    return [];
  });

  const [logs, setLogs] = useState(() => {
    try {
      const lastUid = localStorage.getItem('habitwave_last_known_uid');
      if (lastUid) {
        const cached = localStorage.getItem(`habitwave_cached_logs_${lastUid}`);
        if (cached) return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Error reading cached logs:', e);
    }
    return {};
  });

  const [loading, setLoading] = useState(true);

  // Firestore Subscriptions Cleanup ref
  const logUnsubscribers = useRef([]);

  // --- FIRESTORE REALTIME SYNC (When Authenticated) ---
  useEffect(() => {
    // If auth state is still resolving, do NOT touch habits or fall back to guest demo data!
    if (authLoading) {
      return;
    }

    if (!isConfigured || !user || !db) {
      // Confirmed Guest Mode: Load Local Storage Guest Data
      try {
        const storedHabits = localStorage.getItem(LOCAL_HABITS_KEY);
        const storedLogs = localStorage.getItem(LOCAL_LOGS_KEY);

        const loadedHabits = storedHabits ? JSON.parse(storedHabits) : [];
        const loadedLogs = storedLogs ? JSON.parse(storedLogs) : {};

        setHabits(loadedHabits);
        setLogs(loadedLogs);
      } catch (err) {
        console.error('Error loading local habits data:', err);
        setHabits([]);
        setLogs({});
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    // 1. Listen to user's habits subcollection: /users/{userId}/habits
    const habitsColRef = collection(db, 'users', user.uid, 'habits');
    const habitsUnsub = onSnapshot(habitsColRef, (snapshot) => {
      const fetchedHabits = [];
      snapshot.forEach((docSnap) => {
        fetchedHabits.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      setHabits(fetchedHabits);
      try {
        localStorage.setItem(`habitwave_cached_habits_${user.uid}`, JSON.stringify(fetchedHabits));
      } catch {}
      setLoading(false);
    }, (err) => {
      console.error('Error listening to habits:', err);
      setLoading(false);
    });

    return () => {
      habitsUnsub();
    };
  }, [user, isConfigured, authLoading]);

  // 2. Listen to logs subcollections for all habits: /users/{userId}/habits/{habitId}/logs
  useEffect(() => {
    // Clear any previous logs listeners
    logUnsubscribers.current.forEach((unsub) => unsub());
    logUnsubscribers.current = [];

    if (!isConfigured || !user || !db || habits.length === 0) {
      return;
    }

    const currentLogsAcc = {};

    habits.forEach((habit) => {
      const logsColRef = collection(db, 'users', user.uid, 'habits', habit.id, 'logs');
      const unsub = onSnapshot(logsColRef, (snapshot) => {
        setLogs((prev) => {
          const next = { ...prev };

          // Clear this habit's entries first or update with snapshot
          // Gather dates where this habit was completed
          const activeDatesForHabit = new Set();
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.completed) {
              activeDatesForHabit.add(docSnap.id);
            }
          });

          // Sync into next
          // 1. Mark existing keys
          Object.keys(next).forEach((dateKey) => {
            if (next[dateKey] && next[dateKey][habit.id] && !activeDatesForHabit.has(dateKey)) {
              next[dateKey] = { ...next[dateKey] };
              delete next[dateKey][habit.id];
              // Support legacy smokeFree / workout keys
              if (habit.id === 'smoke-free' || habit.name.toLowerCase().includes('smoke')) {
                delete next[dateKey].smokeFree;
              }
              if (habit.id === 'workout' || habit.name.toLowerCase().includes('workout')) {
                delete next[dateKey].workout;
              }
            }
          });

          // 2. Set active dates
          activeDatesForHabit.forEach((dateKey) => {
            next[dateKey] = {
              ...(next[dateKey] || {}),
              [habit.id]: true
            };
            if (habit.id === 'smoke-free' || habit.name.toLowerCase().includes('smoke')) {
              next[dateKey].smokeFree = true;
            }
            if (habit.id === 'workout' || habit.name.toLowerCase().includes('workout')) {
              next[dateKey].workout = true;
            }
          });

          return next;
        });
      }, (err) => {
        console.error(`Error listening to logs for habit ${habit.id}:`, err);
      });

      logUnsubscribers.current.push(unsub);
    });

    return () => {
      logUnsubscribers.current.forEach((unsub) => unsub());
      logUnsubscribers.current = [];
    };
  }, [user, isConfigured, habits]);

  // Persist LocalStorage changes
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      try {
        if (habits && habits.length > 0) {
          localStorage.setItem(`habitwave_cached_habits_${user.uid}`, JSON.stringify(habits));
        }
        if (logs && Object.keys(logs).length > 0) {
          localStorage.setItem(`habitwave_cached_logs_${user.uid}`, JSON.stringify(logs));
        }
      } catch (err) {
        console.error('Failed to sync to user cache:', err);
      }
    } else {
      try {
        localStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits));
        localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs));
      } catch (err) {
        console.error('Failed to sync to local storage:', err);
      }
    }
  }, [habits, logs, user, isConfigured, authLoading]);

  // --- ACTIONS ---

  // Toggle habit on a specific dateKey
  const toggleHabitForDay = useCallback(async (habitId, dateKey) => {
    const todayKey = getTodayKey();
    // Strictly restrict logging for future dates
    if (dateKey > todayKey) {
      console.warn('Restricted: Cannot log habits for future dates.');
      return;
    }

    const isCurrentlyDone = !!(logs[dateKey] && logs[dateKey][habitId]);

    // Optimistic / Local update
    setLogs((prev) => {
      const dayRecord = { ...(prev[dateKey] || {}) };
      if (isCurrentlyDone) {
        delete dayRecord[habitId];
        if (habitId === 'smoke-free') delete dayRecord.smokeFree;
        if (habitId === 'workout') delete dayRecord.workout;
      } else {
        dayRecord[habitId] = true;
        if (habitId === 'smoke-free') dayRecord.smokeFree = true;
        if (habitId === 'workout') dayRecord.workout = true;
      }

      if (Object.keys(dayRecord).length === 0) {
        const copy = { ...prev };
        delete copy[dateKey];
        return copy;
      }

      return {
        ...prev,
        [dateKey]: dayRecord
      };
    });

    // If Authenticated, write to Firestore subcollection: /users/{userId}/habits/{habitId}/logs/{dateKey}
    if (isConfigured && user && db) {
      try {
        const logDocRef = doc(db, 'users', user.uid, 'habits', habitId, 'logs', dateKey);
        if (isCurrentlyDone) {
          await deleteDoc(logDocRef);
        } else {
          await setDoc(logDocRef, {
            completed: true,
            loggedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Error toggling habit in Firestore:', err);
      }
    }
  }, [logs, isConfigured, user]);

  // Toggle All habits for a dateKey
  const toggleAllForDay = useCallback(async (dateKey) => {
    const todayKey = getTodayKey();
    // Strictly restrict logging for future dates
    if (dateKey > todayKey) {
      console.warn('Restricted: Cannot log habits for future dates.');
      return;
    }

    const allDone = habits.length > 0 && habits.every((h) => logs[dateKey] && logs[dateKey][h.id]);

    for (const habit of habits) {
      const isDone = !!(logs[dateKey] && logs[dateKey][habit.id]);
      if (allDone && isDone) {
        // Untoggle
        await toggleHabitForDay(habit.id, dateKey);
      } else if (!allDone && !isDone) {
        // Toggle on
        await toggleHabitForDay(habit.id, dateKey);
      }
    }
  }, [habits, logs, toggleHabitForDay]);

  // Clear all habits on a dateKey
  const clearDay = useCallback(async (dateKey) => {
    const dayHabits = logs[dateKey] || {};
    for (const habitId of Object.keys(dayHabits)) {
      if (dayHabits[habitId]) {
        await toggleHabitForDay(habitId, dateKey);
      }
    }
  }, [logs, toggleHabitForDay]);

  // Add a new habit
  const addHabit = useCallback(async ({ name, frequency = 'daily', color = '#3b82f6', icon = 'sparkles', startDate = null }) => {
    if (!name.trim()) return null;

    const effectiveStartDate = startDate || getTodayKey();

    if (isConfigured && user && db) {
      try {
        const habitsColRef = collection(db, 'users', user.uid, 'habits');
        const docRef = await addDoc(habitsColRef, {
          name: name.trim(),
          frequency,
          color,
          icon,
          startDate: effectiveStartDate,
          createdAt: serverTimestamp()
        });
        return docRef.id;
      } catch (err) {
        console.error('Error adding habit in Firestore:', err);
        throw err;
      }
    } else {
      // Local mode
      const newId = 'habit-' + Date.now();
      const newHabit = {
        id: newId,
        name: name.trim(),
        frequency,
        color,
        icon,
        startDate: effectiveStartDate,
        createdAt: new Date().toISOString()
      };
      setHabits((prev) => [...prev, newHabit]);
      return newId;
    }
  }, [isConfigured, user]);

  // Update habit
  const updateHabit = useCallback(async (habitId, updates) => {
    if (isConfigured && user && db) {
      try {
        const habitDocRef = doc(db, 'users', user.uid, 'habits', habitId);
        await updateDoc(habitDocRef, updates);
      } catch (err) {
        console.error('Error updating habit in Firestore:', err);
        throw err;
      }
    } else {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h))
      );
    }
  }, [isConfigured, user]);

  // Delete habit
  const deleteHabit = useCallback(async (habitId) => {
    // Immediately clean up logs for deleted habit across both modes
    setLogs((prev) => {
      const next = {};
      Object.entries(prev).forEach(([dKey, dRecord]) => {
        const updatedRecord = { ...dRecord };
        delete updatedRecord[habitId];
        if (habitId === 'workout') delete updatedRecord.workout;
        if (habitId === 'smoke-free') delete updatedRecord.smokeFree;
        if (Object.keys(updatedRecord).length > 0) {
          next[dKey] = updatedRecord;
        }
      });
      return next;
    });

    if (isConfigured && user && db) {
      try {
        // Mark as seeded so when habit count drops to 0, onSnapshot does not recreate starter habit
        localStorage.setItem(`habitwave_seeded_habits_${user.uid}`, 'true');
        const habitDocRef = doc(db, 'users', user.uid, 'habits', habitId);
        await deleteDoc(habitDocRef);
      } catch (err) {
        console.error('Error deleting habit in Firestore:', err);
        throw err;
      }
    } else {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    }
  }, [isConfigured, user]);

  // Restore sample demo data (useful in Guest Mode)
  const restoreSampleData = useCallback(() => {
    const sampleHabits = DEFAULT_HABITS;
    const sampleLogs = generateInitialLocalLogs();
    setHabits(sampleHabits);
    setLogs(sampleLogs);
    try {
      localStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(sampleHabits));
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(sampleLogs));
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    habits,
    logs,
    loading,
    toggleHabitForDay,
    toggleAllForDay,
    clearDay,
    addHabit,
    updateHabit,
    deleteHabit,
    restoreSampleData
  };
}
