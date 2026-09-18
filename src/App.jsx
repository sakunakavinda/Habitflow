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
import OnboardingModal from './components/OnboardingModal';
import DigitalClock from './components/DigitalClock';

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
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const calendarRef = useRef(null);

  const { user, userData, markAddToHomeSeen, setJourneyStartDate, markOnboardingComplete } = useAuth();
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

  // Calculate earliest effective start date across user profile and all active habits
  const effectiveStartDate = useMemo(() => {
    const habitStartDates = habits.map((h) => h.startDate).filter(Boolean);
    if (habitStartDates.length > 0) {
      return habitStartDates.reduce((min, d) => (d < min ? d : min));
    }
    return userData?.startDate || null;
  }, [userData?.startDate, habits]);

  // Calculated totals for active month scoped to effective start date
  const totals = useMemo(() => {
    return calculateMonthTotals(logs, year, month, habits, effectiveStartDate);
  }, [logs, year, month, habits, effectiveStartDate]);

  // Streaks up to today scoped to effective start date
  const streaks = useMemo(() => {
    return calculateStreaks(logs, habits, effectiveStartDate);
  }, [logs, habits, effectiveStartDate]);

  // Handlers for adding/updating habits that also sync user's journey start date if earlier
  const handleAddHabit = async (newHabitData) => {
    const newId = await addHabit(newHabitData);
    if (newHabitData.startDate && setJourneyStartDate) {
      if (!userData?.startDate || newHabitData.startDate < userData.startDate) {
        await setJourneyStartDate(newHabitData.startDate);
      }
    }
    return newId;
  };

  const handleUpdateHabit = async (habitId, updates) => {
    await updateHabit(habitId, updates);
    if (updates.startDate && setJourneyStartDate) {
      if (!userData?.startDate || updates.startDate < userData.startDate) {
        await setJourneyStartDate(updates.startDate);
      }
    }
  };

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

  // Lock body scroll when any modal is open to prevent background scrolling
  useEffect(() => {
    const anyModalOpen =
      !!selectedDay ||
      showWidgetsModal ||
      showAuthModal ||
      showHabitsModal ||
      showAddToHomeModal ||
      showStartDateModal ||
      showOnboardingModal;

    if (anyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const top = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (top) {
        window.scrollTo(0, parseInt(top || '0') * -1);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [selectedDay, showWidgetsModal, showAuthModal, showHabitsModal, showAddToHomeModal, showStartDateModal, showOnboardingModal]);

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

  // Onboarding sequence for registered users:
  // — New users (hasSeenOnboarding !== true): show the full onboarding wizard
  // — Returning users who skipped start date: fall back to StartDateModal
  // — Users already onboarded: skip everything
  useEffect(() => {
    if (!user || !userData) return;

    // New user — show full onboarding wizard
    const localOnboardingDone = localStorage.getItem(`habitwave_onboarding_done_${user.uid}`);
    if (!localOnboardingDone && userData.hasSeenOnboarding !== true) {
      const timer = setTimeout(() => {
        setShowOnboardingModal(true);
      }, 600);
      return () => clearTimeout(timer);
    }

    // Returning user who completed onboarding but somehow missed start date
    if (!userData.startDate) {
      const timer = setTimeout(() => {
        setShowStartDateModal(true);
      }, 700);
      return () => clearTimeout(timer);
    }

    // Check if AddToHome guide should be shown (for users who completed onboarding)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    const localSeen = localStorage.getItem(`habitwave_seen_pwa_guide_${user.uid}`);

    if (!isStandalone && !localSeen && userData.hasSeenAddToHome !== true) {
      const timer = setTimeout(() => {
        setShowAddToHomeModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, userData]);

  useEffect(() => {
    window.__openOnboarding = () => setShowOnboardingModal(true);
    return () => { delete window.__openOnboarding; };
  }, []);

  const handleSaveStartDate = async (startDateStr) => {
    setShowStartDateModal(false);
    if (setJourneyStartDate) {
      await setJourneyStartDate(startDateStr);
    }
    setActionToast(`🎉 Journey start date set to ${startDateStr}!`);
    setTimeout(() => setActionToast(null), 3000);

    // Prompt Add to Home Screen guide immediately after setting start date (unless already in standalone app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (!isStandalone) {
      setTimeout(() => {
        setShowAddToHomeModal(true);
      }, 500);
    }
  };

  const handleOnboardingComplete = async (startDateStr) => {
    setShowOnboardingModal(false);

    // Save start date
    if (startDateStr && setJourneyStartDate) {
      await setJourneyStartDate(startDateStr);
    }

    // Mark onboarding done in Firestore + localStorage
    if (markOnboardingComplete) {
      await markOnboardingComplete();
    }

    // Also mark PWA guide seen so it doesn't trigger separately
    if (markAddToHomeSeen) {
      await markAddToHomeSeen();
    }

    setActionToast('🎉 All set! Your journey starts today.');
    setTimeout(() => setActionToast(null), 3500);
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

          <div className="header-right-group">
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

            {/* Digital Clock in top-right */}
            <DigitalClock />
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

        {/* Responsive Desktop & Mobile Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Main Column: Calendar Controls & Swipable Grid */}
          <div className="dashboard-main">
            {/* Calendar Header: Month & Navigation */}
            <div className="order-item-header">
              <CalendarHeader
                currentDate={currentDate}
                onPrevMonth={handlePrevMonthClick}
                onNextMonth={handleNextMonthClick}
                onToday={handleToday}
              />
            </div>

            {/* Quick Tap Mode Selector */}
            <div className="order-item-mode">
              <QuickModeBar
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                habits={habits}
              />
            </div>

            {/* Swipable Calendar Grid */}
            <main id="calendar-grid-section" className="order-item-grid">
              <CalendarGrid
                ref={calendarRef}
                currentDate={currentDate}
                habitData={logs}
                habits={habits}
                startDate={effectiveStartDate}
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
                  setActionToast("🚫 Can't log before start");
                  setTimeout(() => setActionToast(null), 2500);
                }}
              />
            </main>
          </div>

          {/* Sidebar Column: Monthly Stats & Motivational Tip */}
          <aside className="dashboard-sidebar">
            <div className="order-item-stats">
              <section aria-label="Monthly Totals">
                <MonthStats totals={totals} streaks={streaks} habits={habits} />
              </section>
            </div>

            {/* Motivational Tip */}
            <div className="order-item-quote">
              <div className="banner-quote">
                <Sparkles size={18} color="#fbbf24" />
                <span>
                  <span className="quote-highlight">Pro-tip:</span> Tap any day to log your habits, or use &quot;Habits&quot; at the top to add your own custom goals with unique colors and icons.
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* Selected Day Detail Modal */}
        {selectedDay && (
          <DayModal
            selectedDay={selectedDay}
            habits={habits}
            logs={logs}
            globalStartDate={effectiveStartDate}
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
            onAddHabit={handleAddHabit}
            onUpdateHabit={handleUpdateHabit}
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

        {/* New User Onboarding Wizard (shown once on first login) */}
        <OnboardingModal
          isOpen={showOnboardingModal}
          userName={userData?.name || user?.displayName}
          onComplete={handleOnboardingComplete}
        />

        {/* Journey Start Date Modal (fallback for returning users without start date) */}
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
