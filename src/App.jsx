import React, { useState, useMemo } from 'react';
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
  const [slideDirection, setSlideDirection] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeMode, setActiveMode] = useState('modal'); // 'modal' | 'smokeFree' | 'workout' | 'both'

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

  // Month navigation with animation
  const handlePrevMonth = () => {
    setSlideDirection('right');
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setTimeout(() => setSlideDirection(null), 280);
  };

  const handleNextMonth = () => {
    setSlideDirection('left');
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setTimeout(() => setSlideDirection(null), 280);
  };

  const handleToday = () => {
    const today = new Date();
    const isFuture = today > currentDate;
    setSlideDirection(isFuture ? 'left' : 'right');
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setTimeout(() => setSlideDirection(null), 280);
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
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Quick Tap Mode Selector */}
      <QuickModeBar activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* Swipable Calendar Grid */}
      <main>
        <CalendarGrid
          currentDate={currentDate}
          habitData={habitData}
          slideDirection={slideDirection}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
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
