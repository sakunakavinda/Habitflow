import React, { useRef, useState } from 'react';
import { CigaretteOff, Dumbbell, Sparkles } from 'lucide-react';
import { WEEK_DAYS, getMonthGrid } from '../utils/calendarUtils';

export function CalendarGrid({
  currentDate,
  habitData,
  slideDirection,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  activeMode,
  onToggleSmokeFree,
  onToggleWorkout,
  onToggleBoth
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthGrid(year, month);

  // Swipe & Drag Gestures tracking
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    hasMovedRef.current = false;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - endX;
    const diffY = touchStartYRef.current - endY;

    // Must be predominantly horizontal and over 45px
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX > 0) {
        onNextMonth(); // Swiped left -> next month
      } else {
        onPrevMonth(); // Swiped right -> prev month
      }
    }
  };

  // Mouse Drag support for desktop
  const handleMouseDown = (e) => {
    // Only track primary left mouse button
    if (e.button !== 0) return;
    touchStartXRef.current = e.clientX;
    touchStartYRef.current = e.clientY;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const diffX = Math.abs(e.clientX - touchStartXRef.current);
    const diffY = Math.abs(e.clientY - touchStartYRef.current);
    if (diffX > 10 || diffY > 10) {
      hasMovedRef.current = true;
    }
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const endX = e.clientX;
    const endY = e.clientY;
    const diffX = touchStartXRef.current - endX;
    const diffY = touchStartYRef.current - endY;

    if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX > 0) {
        onNextMonth();
      } else {
        onPrevMonth();
      }
    }
  };

  const handleCellClick = (day) => {
    // If the user just completed a long drag swipe, do not trigger cell click
    if (hasMovedRef.current) return;

    if (activeMode === 'smokeFree') {
      onToggleSmokeFree(day.dateKey);
    } else if (activeMode === 'workout') {
      onToggleWorkout(day.dateKey);
    } else if (activeMode === 'both') {
      onToggleBoth(day.dateKey);
    } else {
      onSelectDay(day);
    }
  };

  return (
    <div
      className="glass-card calendar-viewport"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className={`calendar-surface ${slideDirection ? `sliding-${slideDirection}` : ''}`}>
        {/* Weekday headers */}
        <div className="weekdays-grid">
          {WEEK_DAYS.map((dayName, idx) => (
            <div
              key={dayName}
              className={`weekday-label ${idx >= 5 ? 'weekend' : ''}`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days matrix */}
        <div className="days-grid">
          {days.map((day) => {
            const record = habitData[day.dateKey] || {};
            const isSmokeFree = !!record.smokeFree;
            const isWorkout = !!record.workout;
            const hasBoth = isSmokeFree && isWorkout;

            return (
              <div
                key={day.dateKey}
                onClick={() => handleCellClick(day)}
                className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${
                  day.isToday ? 'today' : ''
                } ${day.isFuture ? 'is-future' : ''} ${hasBoth ? 'has-both' : ''}`}
                title={`${day.dateKey}${isSmokeFree ? ' • Smoke-Free' : ''}${
                  isWorkout ? ' • Worked Out' : ''
                }`}
              >
                <div className="day-header-row">
                  <span className="day-number">{day.dayNumber}</span>
                  {day.isToday && <span className="today-dot" title="Today" />}
                </div>

                <div className="day-badges-row">
                  {isSmokeFree && (
                    <span className="badge-tag smoke" title="Smoke Free">
                      <CigaretteOff size={13} />
                    </span>
                  )}
                  {isWorkout && (
                    <span className="badge-tag workout" title="Worked Out">
                      <Dumbbell size={13} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="badge-tag smoke" style={{ width: 18, height: 18 }}>
              <CigaretteOff size={11} />
            </span>
            <span>Smoke-Free</span>
          </div>
          <div className="legend-item">
            <span className="badge-tag workout" style={{ width: 18, height: 18 }}>
              <Dumbbell size={11} />
            </span>
            <span>Worked Out</span>
          </div>
          <div className="legend-item">
            <Sparkles size={14} color="#f59e0b" />
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Double Win</span>
          </div>
          <div className="legend-item">
            <span className="today-dot" style={{ position: 'static' }} />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
