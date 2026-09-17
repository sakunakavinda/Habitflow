import { useState, useEffect, useCallback } from 'react';
import { getTodayKey, dateToKey } from '../utils/calendarUtils';

const STORAGE_KEY = 'habit_calendar_data_v2';

// Generates helpful initial sample data around current date so calendar looks active on first launch
function generateInitialData() {
  const data = {};
  const today = new Date();
  
  // Fill last 14 days with some realistic habits
  for (let i = 14; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateToKey(d);
    
    // Most days smoke-free, workouts 3-4 times a week
    const isSmokeFree = i !== 8 && i !== 12; // 2 slip days
    const isWorkout = (i % 2 === 0) || i === 3; // alternate days
    
    if (isSmokeFree || isWorkout) {
      data[key] = {
        smokeFree: isSmokeFree,
        workout: isWorkout,
        updatedAt: d.toISOString()
      };
    }
  }

  // Also set today as smoke-free by default for a positive start!
  const todayKey = getTodayKey();
  data[todayKey] = {
    smokeFree: true,
    workout: false,
    updatedAt: new Date().toISOString()
  };

  return data;
}

export function useHabitData() {
  const [habitData, setHabitData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      const initial = generateInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error('Failed to load habit data from localStorage', e);
      return generateInitialData();
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habitData));
    } catch (e) {
      console.error('Failed to save habit data to localStorage', e);
    }
  }, [habitData]);

  const toggleSmokeFree = useCallback((dateKey) => {
    setHabitData((prev) => {
      const current = prev[dateKey] || { smokeFree: false, workout: false };
      const nextSmokeFree = !current.smokeFree;
      
      // If neither is true, we can remove the key or keep it clean
      if (!nextSmokeFree && !current.workout) {
        const copy = { ...prev };
        delete copy[dateKey];
        return copy;
      }

      return {
        ...prev,
        [dateKey]: {
          ...current,
          smokeFree: nextSmokeFree,
          updatedAt: new Date().toISOString()
        }
      };
    });
  }, []);

  const toggleWorkout = useCallback((dateKey) => {
    setHabitData((prev) => {
      const current = prev[dateKey] || { smokeFree: false, workout: false };
      const nextWorkout = !current.workout;

      if (!current.smokeFree && !nextWorkout) {
        const copy = { ...prev };
        delete copy[dateKey];
        return copy;
      }

      return {
        ...prev,
        [dateKey]: {
          ...current,
          workout: nextWorkout,
          updatedAt: new Date().toISOString()
        }
      };
    });
  }, []);

  const toggleBoth = useCallback((dateKey) => {
    setHabitData((prev) => {
      const current = prev[dateKey] || { smokeFree: false, workout: false };
      const bothDone = current.smokeFree && current.workout;
      
      if (bothDone) {
        // Clear both
        const copy = { ...prev };
        delete copy[dateKey];
        return copy;
      }

      // Turn both on
      return {
        ...prev,
        [dateKey]: {
          ...current,
          smokeFree: true,
          workout: true,
          updatedAt: new Date().toISOString()
        }
      };
    });
  }, []);

  const clearDay = useCallback((dateKey) => {
    setHabitData((prev) => {
      const copy = { ...prev };
      delete copy[dateKey];
      return copy;
    });
  }, []);

  const resetAllData = useCallback(() => {
    setHabitData({});
  }, []);

  const restoreSampleData = useCallback(() => {
    const sample = generateInitialData();
    setHabitData(sample);
  }, []);

  return {
    habitData,
    toggleSmokeFree,
    toggleWorkout,
    toggleBoth,
    clearDay,
    resetAllData,
    restoreSampleData
  };
}
