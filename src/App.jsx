import React, { useState, useMemo, useRef } from 'react';
import { CalendarHeart, RotateCcw, Sparkles } from 'lucide-react';
import { useHabitData } from './hooks/useHabitData';
import { calculateMonthTotals, calculateStreaks } from './utils/calendarUtils';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthStats } from './components/MonthStats';
import { QuickModeBar } from './components/QuickModeBar';
import { CalendarGrid } from './components/CalendarGrid';
import { DayModal } from './components/DayModal';

export default function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeMode, setActiveMode] = useState('modal'); // 'modal' | 'smokeFree' | 'workout' | 'both'
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
    <div className="app-container">
      {/* App Top Bar */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <CalendarHeart size={24} />
          </div>
          <div>
            <h1 className="brand-title">HabitFlow</h1>
            <p className="brand-subtitle">Smoke-Free & Workout Day Tracker</p>
          </div>
        </div>

        <div className="header-actions">
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
    </div>
  );
}
