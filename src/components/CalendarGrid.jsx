import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback
} from 'react';
import { CigaretteOff, Dumbbell, Sparkles } from 'lucide-react';
import { WEEK_DAYS, MONTH_NAMES, getMonthGrid } from '../utils/calendarUtils';

export const CalendarGrid = forwardRef(function CalendarGrid(
  {
    currentDate,
    habitData,
    onPrevMonth,
    onNextMonth,
    onSelectDay,
    activeMode,
    onToggleSmokeFree,
    onToggleWorkout,
    onToggleBoth
  },
  ref
) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonthDate = new Date(year, month - 1, 1);
  const nextMonthDate = new Date(year, month + 1, 1);

  const prevDays = getMonthGrid(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
  const currentDays = getMonthGrid(year, month);
  const nextDays = getMonthGrid(nextMonthDate.getFullYear(), nextMonthDate.getMonth());

  // Carousel track state:
  // Default offset is -33.3333% (showing panel 1, current month)
  // When sliding to next, animates to -66.6666%
  // When sliding to prev, animates to 0%
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [targetPanelIndex, setTargetPanelIndex] = useState(1); // 0 = prev, 1 = current, 2 = next
  const [isAnimating, setIsAnimating] = useState(false);

  // Gesture refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentDiffX = useRef(0);
  const hasMovedRef = useRef(false);
  const trackRef = useRef(null);

  const animTimeoutRef = useRef(null);

  // Helper to cleanly settle and snap back to panel 1 with zero reverse transition
  const resetAfterAnimation = useCallback((destPanel) => {
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }

    // First disable transition on the DOM element directly so no backwards animation can occur
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = 'translate3d(-33.333333%, 0, 0)';
      void trackRef.current.offsetHeight; // force DOM reflow
    }

    // Update parent month state
    if (destPanel === 2) {
      onNextMonth();
    } else if (destPanel === 0) {
      onPrevMonth();
    }

    // Reset React state
    setTargetPanelIndex(1);
    setDragOffsetPx(0);
    setIsAnimating(false);
  }, [onNextMonth, onPrevMonth]);

  // Smooth slide to next month (swipe left or next button)
  const slideNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsDragging(false);
    setDragOffsetPx(0);
    setTargetPanelIndex(2); // animate forward to panel 2

    animTimeoutRef.current = setTimeout(() => {
      resetAfterAnimation(2);
    }, 320);
  }, [isAnimating, resetAfterAnimation]);

  // Smooth slide to prev month (swipe right or prev button)
  const slidePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsDragging(false);
    setDragOffsetPx(0);
    setTargetPanelIndex(0); // animate backward to panel 0

    animTimeoutRef.current = setTimeout(() => {
      resetAfterAnimation(0);
    }, 320);
  }, [isAnimating, resetAfterAnimation]);

  // Expose slideNext and slidePrev to parent
  useImperativeHandle(ref, () => ({
    slideNext,
    slidePrev
  }), [slideNext, slidePrev]);

  // Touch handlers
  const handleTouchStart = (e) => {
    if (isAnimating) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    currentDiffX.current = 0;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isAnimating) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // Detect if movement is primarily horizontal
    if (Math.abs(diffX) > 8 || hasMovedRef.current) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        hasMovedRef.current = true;
        currentDiffX.current = diffX;
        setDragOffsetPx(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const threshold = 45; // px threshold to trigger month change
    if (currentDiffX.current < -threshold) {
      // Swiped left -> Go to Next month
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(2);
      animTimeoutRef.current = setTimeout(() => {
        resetAfterAnimation(2);
      }, 320);
    } else if (currentDiffX.current > threshold) {
      // Swiped right -> Go to Prev month
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(0);
      animTimeoutRef.current = setTimeout(() => {
        resetAfterAnimation(0);
      }, 320);
    } else {
      // Snap smoothly back to center
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(1);
      animTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 320);
    }
  };

  // Desktop Mouse Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0 || isAnimating) return;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    currentDiffX.current = 0;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isAnimating) return;
    const diffX = e.clientX - touchStartX.current;
    const diffY = e.clientY - touchStartY.current;

    if (Math.abs(diffX) > 8 || hasMovedRef.current) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        hasMovedRef.current = true;
        currentDiffX.current = diffX;
        setDragOffsetPx(diffX);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const threshold = 45;
    if (currentDiffX.current < -threshold) {
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(2);
      animTimeoutRef.current = setTimeout(() => {
        resetAfterAnimation(2);
      }, 320);
    } else if (currentDiffX.current > threshold) {
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(0);
      animTimeoutRef.current = setTimeout(() => {
        resetAfterAnimation(0);
      }, 320);
    } else {
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(1);
      animTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 320);
    }
  };

  // Called when CSS transition completes
  const handleTransitionEnd = (e) => {
    if (e.target !== trackRef.current) return;
    if (!isAnimating) return;

    if (targetPanelIndex === 1) {
      setIsAnimating(false);
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current);
        animTimeoutRef.current = null;
      }
      return;
    }

    resetAfterAnimation(targetPanelIndex);
  };

  const handleCellClick = (day) => {
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

  // Calculate transform for the 3-panel track
  // Base offset for panel 0 is 0%, panel 1 is -33.333333%, panel 2 is -66.666666%
  const basePercent = -targetPanelIndex * (100 / 3);
  const trackStyle = {
    transform: isDragging
      ? `translate3d(calc(${basePercent}% + ${dragOffsetPx}px), 0, 0)`
      : `translate3d(${basePercent}%, 0, 0)`,
    transition: isAnimating
      ? 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none'
  };

  const renderDaysPanel = (panelDays, isCurrent, panelDate) => {
    const pMonthName = MONTH_NAMES[panelDate.getMonth()];
    const pYear = panelDate.getFullYear();

    return (
      <div className="calendar-panel">
        <div className="days-grid">
          {panelDays.map((day) => {
            const record = habitData[day.dateKey] || {};
            const isSmokeFree = !!record.smokeFree;
            const isWorkout = !!record.workout;
            const hasBoth = isSmokeFree && isWorkout;

            return (
              <div
                key={day.dateKey}
                onClick={() => isCurrent && handleCellClick(day)}
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

                <div className="day-lines-row">
                  {isSmokeFree && (
                    <span className="habit-line smoke" title="Smoke-Free" />
                  )}
                  {isWorkout && (
                    <span className="habit-line workout" title="Worked Out" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Month & Year Display below the dates with synchronized swiping */}
        <div className="panel-month-footer">
          <div className="panel-month-badge">
            <span className="panel-month-text">{pMonthName}</span>
            <span className="panel-year-text">{pYear}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="glass-card calendar-viewport"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="calendar-inner-wrapper">
        {/* Fixed Weekday headers */}
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

        {/* 3-Panel Sliding Track for buttery smooth swipe */}
        <div className="calendar-track-container">
          <div
            ref={trackRef}
            className="calendar-track"
            style={trackStyle}
            onTransitionEnd={handleTransitionEnd}
          >
            {renderDaysPanel(prevDays, false, prevMonthDate)}
            {renderDaysPanel(currentDays, true, currentDate)}
            {renderDaysPanel(nextDays, false, nextMonthDate)}
          </div>
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-line smoke" />
            <span>Smoke-Free</span>
          </div>
          <div className="legend-item">
            <span className="legend-line workout" />
            <span>Worked Out</span>
          </div>
          <div className="legend-item">
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <span className="legend-line smoke" style={{ width: 10 }} />
              <span className="legend-line workout" style={{ width: 10 }} />
            </div>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>Both Done</span>
          </div>
          <div className="legend-item">
            <span className="today-dot" style={{ position: 'static' }} />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
});
