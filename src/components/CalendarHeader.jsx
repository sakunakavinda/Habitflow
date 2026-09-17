import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoveHorizontal } from 'lucide-react';
import { MONTH_NAMES } from '../utils/calendarUtils';

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday
}) {
  const monthIndex = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = MONTH_NAMES[monthIndex];

  // Check if currently viewing current month
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === monthIndex;

  return (
    <div className="glass-card calendar-header">
      <div className="month-title-wrap">
        <h2 className="current-month-text">{monthName}</h2>
        <span className="current-year-text">{year}</span>
      </div>

      <div className="month-nav-controls">
        <div className="swipe-hint" title="Swipe left or right anywhere on the calendar">
          <MoveHorizontal size={14} />
          <span>Swipeable</span>
        </div>

        {!isCurrentMonth && (
          <button
            type="button"
            className="btn"
            onClick={onToday}
            aria-label="Go to Today"
          >
            <CalendarIcon size={16} />
            <span>Today</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-icon"
          onClick={onPrevMonth}
          aria-label="Previous Month"
          title="Previous Month (or swipe right)"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          className="btn btn-icon"
          onClick={onNextMonth}
          aria-label="Next Month"
          title="Next Month (or swipe left)"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
