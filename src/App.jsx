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
import OnboardingModal from './components/OnboardingModal';
import DigitalClock from './components/DigitalClock';
import { AVAILABLE_AVATARS, getAvatarUrl } from './utils/avatarUtils';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeMode, setActiveMode] = useState('modal'); // 'modal' | 'all' | {habitId}
  const [showWidgetsModal, setShowWidgetsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showAddToHomeModal, setShowAddToHomeModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const calendarRef = useRef(null);

  const { user, userData, loading: authLoading, markAddToHomeSeen, markOnboardingComplete } = useAuth();
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

  const isAppReady = !authLoading && !habitsLoading;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate earliest effective start date across all active habits
  const effectiveStartDate = useMemo(() => {
    const habitStartDates = habits.map((h) => h.startDate).filter(Boolean);
    if (habitStartDates.length > 0) {
      return habitStartDates.reduce((min, d) => (d < min ? d : min));
    }
    return null;
  }, [habits]);

  // Calculated totals for active month scoped to effective start date
  const totals = useMemo(() => {
    return calculateMonthTotals(logs, year, month, habits, effectiveStartDate);
  }, [logs, year, month, habits, effectiveStartDate]);

  // Streaks up to today scoped to effective start date
  const streaks = useMemo(() => {
    return calculateStreaks(logs, habits, effectiveStartDate);
  }, [logs, habits, effectiveStartDate]);

  // Onboarding sequence for registered users:
  // — New users (hasSeenOnboarding !== true): show the full onboarding wizard
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

  // Proactively preload guide images into browser memory for instant display
  useEffect(() => {
    const guideImages = [
      '/guides/home-screen.webp',
      '/guides/step-1.webp',
      '/guides/step-2.webp',
      '/guides/step-3.webp'
    ];
    guideImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Lock background scrolling whenever any modal is open
  const isAnyModalOpen = Boolean(
    selectedDay ||
    showWidgetsModal ||
    showAuthModal ||
    showHabitsModal ||
    showAddToHomeModal ||
    showOnboardingModal
  );

  useEffect(() => {
    const syncModalLock = () => {
      const hasModal = Boolean(document.querySelector('.modal-overlay'));
      if (hasModal || isAnyModalOpen) {
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      }
    };

    syncModalLock();

    const observer = new MutationObserver(() => {
      syncModalLock();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [isAnyModalOpen]);

  const handleOnboardingComplete = async () => {
    setShowOnboardingModal(false);

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

  // State updates called when calendar animation or swipe completes
  const handlePrevMonthDateUpdate = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonthDateUpdate = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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

  const handleTriggerShortcut = (shortcutType) => {
    const todayKey = getTodayKey();
    if (shortcutType === 'workout') {
      const workoutHabit = habits.find((h) =>
        h.name.toLowerCase().includes('workout') || h.icon === 'dumbbell'
      ) || habits[0];

      if (workoutHabit) {
        toggleHabitForDay(workoutHabit.id, todayKey);
        setActionToast(`💪 Logged "${workoutHabit.name}" for today!`);
      }
    } else if (shortcutType === 'all') {
      toggleAllForDay(todayKey);
      setActionToast('✨ Logged all daily habits for today!');
    }
    setShowWidgetsModal(false);
    setTimeout(() => setActionToast(null), 3000);
  };

  const displayName = userData?.name || user?.displayName || user?.email?.split('@')[0];

  return (
    <>
      {isLoading && (
        <LoadingScreen
          isReady={isAppReady}
          onFinished={() => setIsLoading(false)}
        />
      )}
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
                {user ? `${displayName}'s Daily Habits` : authLoading ? '' : 'Multi-Habit Calendar Tracker'}
              </p>
            </div>
          </div>

          <div className="header-right-group">
            <div className={`header-actions ${user ? 'has-user' : !authLoading ? 'is-guest' : 'is-loading'}`}>
              {/* User Profile / Auth Button */}
              {authLoading ? (
                <button
                  type="button"
                  className="btn btn-sm btn-user"
                  disabled
                  style={{ opacity: 0.6, cursor: 'default' }}
                >
                  <span className="btn-label">...</span>
                </button>
              ) : user ? (
                <button
                  type="button"
                  className="btn btn-sm btn-user logged-in"
                  onClick={() => setShowAuthModal(true)}
                  title={user ? `Signed in as ${user.email}` : 'Sign in or create account'}
                >
                  <span className="user-avatar-tiny">
                    {getAvatarUrl(userData?.avatar) ? (
                      <img
                        src={getAvatarUrl(userData?.avatar)}
                        alt={displayName || 'User Avatar'}
                        className="user-avatar-tiny-img"
                      />
                    ) : (
                      (displayName || 'U').trim().charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="btn-label">{displayName || 'Profile'}</span>
                  <span className="online-indicator" title="Cloud Synced" />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-user"
                  onClick={() => setShowAuthModal(true)}
                  title="Sign in or create account"
                >
                  <LogIn size={13} />
                  <span className="btn-label">Sign In</span>
                </button>
              )}

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
              {!authLoading && !user && (
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

        {/* Demo Mode Notice Banner for unauthenticated visitors only */}
        {!authLoading && !user && (
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
            onAddHabit={addHabit}
            onUpdateHabit={updateHabit}
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
