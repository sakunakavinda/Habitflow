import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarHeart, RotateCcw, Sparkles, Smartphone, Check } from 'lucide-react';
import { useHabitData } from './hooks/useHabitData';
import { calculateMonthTotals, calculateStreaks, getTodayKey } from './utils/calendarUtils';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthStats } from './components/MonthStats';
import { QuickModeBar } from './components/QuickModeBar';
import { CalendarGrid } from './components/CalendarGrid';
import { DayModal } from './components/DayModal';
import { WidgetsModal } from './components/WidgetsModal';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeMode, setActiveMode] = useState('modal'); // 'modal' | 'smokeFree' | 'workout' | 'both'
  const [showWidgetsModal, setShowWidgetsModal] = useState(false);
  const [actionToast, setActionToast] = useState(null);
  const calendarRef = useRef(null);

  const {
    habitData,
    toggleSmokeFree,
    toggleWorkout,
    toggleBoth,
    clearDay,
    restoreSampleData
  } = useHabitData();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculated totals for active month
  const totals = useMemo(() => {
    return calculateMonthTotals(habitData, year, month);
  }, [habitData, year, month]);

  // Streaks up to today
  const streaks = useMemo(() => {
    return calculateStreaks(habitData);
  }, [habitData]);

  // Handle Home Screen Quick Actions from URL (?action=smoke-free, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action) {
      const todayKey = getTodayKey();
      if (action === 'smoke-free') {
        toggleSmokeFree(todayKey);
        setActionToast('🚭 Logged Smoke-Free for Today via Quick Action!');
      } else if (action === 'workout') {
        toggleWorkout(todayKey);
        setActionToast('💪 Logged Workout for Today via Quick Action!');
      } else if (action === 'both') {
        toggleBoth(todayKey);
        setActionToast('✨ Logged Both Habits for Today via Quick Action!');
      }
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => setActionToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toggleSmokeFree, toggleWorkout, toggleBoth]);

  // Update App Icon Badge with live streak count on supported mobile browsers
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (streaks.smokeFreeStreak > 0) {
        navigator.setAppBadge(streaks.smokeFreeStreak).catch(() => {});
      } else if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, [streaks.smokeFreeStreak]);

  // Trigger shortcuts directly from the modal
  const handleTriggerShortcut = (actionType) => {
    const todayKey = getTodayKey();
    if (actionType === 'smoke-free') {
      toggleSmokeFree(todayKey);
      setActionToast('🚭 Logged Smoke-Free for Today!');
    } else if (actionType === 'workout') {
      toggleWorkout(todayKey);
      setActionToast('💪 Logged Workout for Today!');
    } else if (actionType === 'both') {
      toggleBoth(todayKey);
      setActionToast('✨ Logged Both Habits for Today!');
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
            <p className="brand-subtitle">Smoke-Free & Workout Day Tracker</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn"
            onClick={() => setShowWidgetsModal(true)}
            title="Mobile Widgets, Shortcuts, and Install Guide"
          >
            <Smartphone size={15} />
            <span>Widgets</span>
          </button>

          <button
            type="button"
            className="btn"
            onClick={restoreSampleData}
            title="Populate demo data to see features"
          >
            <RotateCcw size={15} />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Action Toast for Shortcuts */}
      {actionToast && (
        <div className="action-toast" role="alert">
          <span>{actionToast}</span>
        </div>
      )}

      {/* Monthly Statistics & Totals */}
      <section aria-label="Monthly Totals">
        <MonthStats totals={totals} streaks={streaks} />
      </section>

      {/* Calendar Header: Month & Navigation */}
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonthClick}
        onNextMonth={handleNextMonthClick}
        onToday={handleToday}
      />

      {/* Quick Tap Mode Selector */}
      <QuickModeBar activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* Swipable Calendar Grid */}
      <main>
        <CalendarGrid
          ref={calendarRef}
          currentDate={currentDate}
          habitData={habitData}
          onPrevMonth={handlePrevMonthDateUpdate}
          onNextMonth={handleNextMonthDateUpdate}
          onSelectDay={(day) => setSelectedDay(day)}
          activeMode={activeMode}
          onToggleSmokeFree={toggleSmokeFree}
          onToggleWorkout={toggleWorkout}
          onToggleBoth={toggleBoth}
        />
      </main>

      {/* Bottom Motivational Tip */}
      <div className="banner-quote">
        <Sparkles size={18} color="#fbbf24" />
        <span>
          <span className="quote-highlight">Pro-tip:</span> Swipe left or right on the calendar to switch months. Click any day to toggle smoke-free and workout badges.
        </span>
      </div>

      {/* Selected Day Detail Modal */}
      {selectedDay && (
        <DayModal
          selectedDay={selectedDay}
          habitData={habitData}
          onClose={() => setSelectedDay(null)}
          onToggleSmokeFree={toggleSmokeFree}
          onToggleWorkout={toggleWorkout}
          onToggleBoth={toggleBoth}
          onClearDay={clearDay}
        />
      )}

      {/* Mobile Widgets & PWA Shortcuts Modal */}
      {showWidgetsModal && (
        <WidgetsModal
          onClose={() => setShowWidgetsModal(false)}
          onTriggerShortcut={handleTriggerShortcut}
          currentStreak={streaks.smokeFreeStreak}
        />
      )}
    </div>
    </>
  );
}
