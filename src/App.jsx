import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CalendarHeart,
  RotateCcw,
  Sparkles,
  Smartphone,
  Check,
  SlidersHorizontal,
  LogIn,
  User
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useUserHabits } from './hooks/useUserHabits';
import { calculateMonthTotals, calculateStreaks, getTodayKey } from './utils/calendarUtils';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthStats } from './components/MonthStats';
import { QuickModeBar } from './components/QuickModeBar';
import { CalendarGrid } from './components/CalendarGrid';
import { DayModal } from './components/DayModal';
import { WidgetsModal } from './components/WidgetsModal';
import { AuthModal } from './components/AuthModal';
import { ManageHabitsModal } from './components/ManageHabitsModal';
import { LoadingScreen } from './components/LoadingScreen';
import AddToHomeModal from './components/AddToHomeModal';
import StartDateModal from './components/StartDateModal';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeMode, setActiveMode] = useState('modal'); // 'modal' | 'all' | {habitId}
  const [showWidgetsModal, setShowWidgetsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showAddToHomeModal, setShowAddToHomeModal] = useState(false);
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const calendarRef = useRef(null);

  const { user, userData, markAddToHomeSeen, setJourneyStartDate } = useAuth();
  const {
    habits,
    logs,
    loading: habitsLoading,
    toggleHabitForDay,
    toggleAllForDay,
    clearDay,
    addHabit,
    updateHabit,
    deleteHabit,
    restoreSampleData
  } = useUserHabits();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculated totals for active month scoped to user's journey startDate
  const totals = useMemo(() => {
    return calculateMonthTotals(logs, year, month, habits, userData?.startDate);
  }, [logs, year, month, habits, userData?.startDate]);

  // Streaks up to today scoped to user's journey startDate
  const streaks = useMemo(() => {
    return calculateStreaks(logs, habits, userData?.startDate);
  }, [logs, habits, userData?.startDate]);

  // Handle Home Screen Quick Actions from URL (?action=smoke-free, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action) {
      const todayKey = getTodayKey();
      if (action === 'smoke-free') {
        toggleHabitForDay('smoke-free', todayKey);
        setActionToast('🚭 Logged Smoke-Free for Today via Quick Action!');
      } else if (action === 'workout') {
        toggleHabitForDay('workout', todayKey);
        setActionToast('💪 Logged Workout for Today via Quick Action!');
      } else if (action === 'both' || action === 'all') {
        toggleAllForDay(todayKey);
        setActionToast('✨ Logged All Habits for Today via Quick Action!');
      }
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => setActionToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toggleHabitForDay, toggleAllForDay]);

  // Update App Icon Badge with live streak count on supported mobile browsers
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      // Use maximum streak among active habits or legacy smoke-free streak
      let maxStreak = streaks.smokeFreeStreak || 0;
      if (streaks.habitStreaks) {
        Object.values(streaks.habitStreaks).forEach((s) => {
          if (s > maxStreak) maxStreak = s;
        });
      }

      if (maxStreak > 0) {
        navigator.setAppBadge(maxStreak).catch(() => {});
      } else if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, [streaks]);

  // Trigger shortcuts directly from the modal
  const handleTriggerShortcut = (actionType) => {
    const todayKey = getTodayKey();
    if (actionType === 'smoke-free') {
      toggleHabitForDay('smoke-free', todayKey);
      setActionToast('🚭 Logged Smoke-Free for Today!');
    } else if (actionType === 'workout') {
      toggleHabitForDay('workout', todayKey);
      setActionToast('💪 Logged Workout for Today!');
    } else if (actionType === 'both' || actionType === 'all') {
      toggleAllForDay(todayKey);
      setActionToast('✨ Logged All Habits for Today!');
    }
    setShowWidgetsModal(false);
    setTimeout(() => setActionToast(null), 4000);
  };

  // State updates called when calendar animation or swipe completes
  const handlePrevMonthDateUpdate = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonthDateUpdate = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Automatically manage onboarding sequence for registered users:
  // Step 1: Set Journey Start Date (if not yet configured)
  // Step 2: Show Add to Home Screen guide (if on browser/mobile outside standalone)
  useEffect(() => {
    if (user && userData) {
      // Step 1: If user does not have a start date yet, open StartDateModal
      if (!userData.startDate) {
        const timer = setTimeout(() => {
          setShowStartDateModal(true);
        }, 700);
        return () => clearTimeout(timer);
      }

      // Step 2: Once start date is configured, check if AddToHome guide should be shown
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      const localSeen = localStorage.getItem(`habitwave_seen_pwa_guide_${user.uid}`);

      if (!isStandalone && !localSeen && (userData.hasSeenAddToHome === false || userData.isNewRegistration)) {
        const timer = setTimeout(() => {
          setShowAddToHomeModal(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user, userData]);

  const handleSaveStartDate = async (startDateStr) => {
    setShowStartDateModal(false);
    if (setJourneyStartDate) {
      await setJourneyStartDate(startDateStr);
    }
    setActionToast(`🎉 Journey start date set to ${startDateStr}!`);
    setTimeout(() => setActionToast(null), 3500);

    // After setting start date, prompt AddToHome if user has not seen it and is not in standalone mode
    if (user) {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      const localSeen = localStorage.getItem(`habitwave_seen_pwa_guide_${user.uid}`);

      if (!isStandalone && !localSeen && (userData?.hasSeenAddToHome === false || userData?.isNewRegistration)) {
        setTimeout(() => {
          setShowAddToHomeModal(true);
        }, 600);
      }
    }
  };

  const handleDismissAddToHome = () => {
    setShowAddToHomeModal(false);
    if (markAddToHomeSeen) {
      markAddToHomeSeen();
    }
  };

  // Triggered when user clicks header Chevron buttons
  const handlePrevMonthClick = () => {
    if (calendarRef.current?.slidePrev) {
      calendarRef.current.slidePrev();
    } else {
      handlePrevMonthDateUpdate();
    }
  };

  const handleNextMonthClick = () => {
    if (calendarRef.current?.slideNext) {
      calendarRef.current.slideNext();
    } else {
      handleNextMonthDateUpdate();
    }
  };

  const handleToday = () => {
    const today = new Date();
    if (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth()
    ) {
      return;
    }
    if (today > currentDate) {
      handleNextMonthClick();
    } else {
      handlePrevMonthClick();
    }
  };

  const displayName = userData?.name || user?.displayName || user?.email?.split('@')[0];

  return (
    <>
      {isLoading && <LoadingScreen onFinished={() => setIsLoading(false)} />}
      <div className="app-container">
        {/* App Top Bar */}
        <header className="app-header">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <CalendarHeart size={24} />
            </div>
            <div>
              <h1 className="brand-title">HabitWave</h1>
              <p className="brand-subtitle">
                {user ? `${displayName}'s Daily Habits` : 'Multi-Habit Calendar Tracker'}
              </p>
            </div>
          </div>

          <div className={`header-actions ${user ? 'has-user' : 'is-guest'}`}>
            {/* User Profile / Auth Button */}
            <button
              type="button"
              className={`btn btn-sm btn-user ${user ? 'logged-in' : ''}`}
              onClick={() => setShowAuthModal(true)}
              title={user ? `Signed in as ${user.email}` : 'Sign in or create account'}
            >
              {user ? (
                <>
                  <span className="user-avatar-tiny">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="btn-label">{displayName || 'Profile'}</span>
                  <span className="online-indicator" title="Cloud Synced" />
                </>
              ) : (
                <>
                  <LogIn size={13} />
                  <span className="btn-label">Sign In</span>
                </>
              )}
            </button>

            {/* Manage Custom Habits Button */}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowHabitsModal(true)}
              title="Add, edit, or customize habits and colors"
            >
              <SlidersHorizontal size={13} />
              <span className="btn-label">Habits</span>
            </button>

            {/* Widgets Button */}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowWidgetsModal(true)}
              title="Mobile Widgets, Shortcuts, and Install Guide"
            >
              <Smartphone size={13} />
              <span className="btn-label">Widgets</span>
            </button>

            {/* Reset Demo button for Guest mode */}
            {!user && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={restoreSampleData}
                title="Reset to sample demo data"
              >
                <RotateCcw size={13} />
                <span className="btn-label">Reset</span>
              </button>
            )}
          </div>
        </header>

        {/* Demo Mode Notice Banner for unauthenticated visitors */}
        {!user && (
          <div className="demo-mode-notice" role="status">
            <div className="demo-notice-text">
              <span className="demo-notice-badge">Demo</span>
              <span>Preview counts only. Records reset on refresh.</span>
            </div>
            <button
              type="button"
              className="demo-notice-btn"
              onClick={() => setShowAuthModal(true)}
            >
              Sign in to save →
            </button>
          </div>
        )}

        {/* Action Toast for Shortcuts */}
        {actionToast && (
          <div className="action-toast" role="alert">
            <span>{actionToast}</span>
          </div>
        )}

        {/* Monthly Statistics & Totals */}
        <section aria-label="Monthly Totals">
          <MonthStats totals={totals} streaks={streaks} habits={habits} />
        </section>

        {/* Calendar Header: Month & Navigation */}
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonthClick}
          onNextMonth={handleNextMonthClick}
          onToday={handleToday}
        />

        {/* Quick Tap Mode Selector */}
        <QuickModeBar
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          habits={habits}
        />

        {/* Swipable Calendar Grid */}
        <main>
          <CalendarGrid
            ref={calendarRef}
            currentDate={currentDate}
            habitData={logs}
            habits={habits}
            startDate={userData?.startDate}
            onPrevMonth={handlePrevMonthDateUpdate}
            onNextMonth={handleNextMonthDateUpdate}
            onSelectDay={(day) => setSelectedDay(day)}
            activeMode={activeMode}
            onToggleHabit={toggleHabitForDay}
            onToggleAll={toggleAllForDay}
            onFutureAttempt={() => {
              setActionToast('⏳ Upcoming date: Habits cannot be logged ahead of time.');
              setTimeout(() => setActionToast(null), 3000);
            }}
            onPastStartAttempt={() => {
              setActionToast(`🚫 Prior to Start Date: Tracking begins on ${userData?.startDate || 'start date'}.`);
              setTimeout(() => setActionToast(null), 3000);
            }}
          />
        </main>

        {/* Bottom Motivational Tip */}
        <div className="banner-quote">
          <Sparkles size={18} color="#fbbf24" />
          <span>
            <span className="quote-highlight">Pro-tip:</span> Tap any day to log your habits, or use &quot;Habits&quot; at the top to add your own custom goals with unique colors and icons.
          </span>
        </div>

        {/* Selected Day Detail Modal */}
        {selectedDay && (
          <DayModal
            selectedDay={selectedDay}
            habits={habits}
            logs={logs}
            onClose={() => setSelectedDay(null)}
            onToggleHabit={toggleHabitForDay}
            onToggleAll={toggleAllForDay}
            onClearDay={clearDay}
          />
        )}

        {/* Manage Habits Modal */}
        {showHabitsModal && (
          <ManageHabitsModal
            habits={habits}
            onAddHabit={addHabit}
            onDeleteHabit={deleteHabit}
            onClose={() => setShowHabitsModal(false)}
          />
        )}

        {/* Auth / Profile Modal */}
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}

        {/* Mobile Widgets & PWA Shortcuts Modal */}
        {showWidgetsModal && (
          <WidgetsModal
            onClose={() => setShowWidgetsModal(false)}
            onTriggerShortcut={handleTriggerShortcut}
            currentStreak={streaks.smokeFreeStreak}
            onOpenAddToHomeGuide={() => {
              setShowWidgetsModal(false);
              setShowAddToHomeModal(true);
            }}
          />
        )}

        {/* Journey Start Date Onboarding Modal */}
        <StartDateModal
          isOpen={showStartDateModal}
          initialDate={userData?.startDate}
          onSave={handleSaveStartDate}
        />

        {/* Add to Home Screen Onboarding Guide Modal */}
        <AddToHomeModal
          isOpen={showAddToHomeModal}
          onClose={handleDismissAddToHome}
          onComplete={handleDismissAddToHome}
        />
      </div>
    </>
  );
}
