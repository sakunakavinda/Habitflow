import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect
} from 'react';
import { WEEK_DAYS, MONTH_NAMES, getMonthGrid } from '../utils/calendarUtils';

export const CalendarGrid = forwardRef(function CalendarGrid(
  {
    currentDate,
    habitData,
    habits = [],
    onPrevMonth,
    onNextMonth,
    onSelectDay,
    activeMode,
    onToggleHabit,
    onToggleAll,
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

  // Carousel track state
  // Panel 0 = Prev month (0%), Panel 1 = Current month (-33.333333%), Panel 2 = Next month (-66.666667%)
  const [targetPanelIndex, setTargetPanelIndex] = useState(1);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Gesture tracking refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentDiffX = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const hasMovedRef = useRef(false);

  const trackRef = useRef(null);
  const wheelCylinderRef = useRef(null);
  const animTimerRef = useRef(null);

  // Complete slide transition and reset track seamlessly
  const completeSlide = useCallback(
    (destPanel) => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
        animTimerRef.current = null;
      }

      // Turn off CSS transition so that React's batched commit snaps to panel 1 with zero animation
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
      }
      if (wheelCylinderRef.current) {
        wheelCylinderRef.current.style.transition = 'none';
      }

      // Batch state updates so new month and panel index 1 commit in the exact same DOM update
      setDragOffsetPx(0);
      setIsDragging(false);
      setIsAnimating(false);
      setTargetPanelIndex(1);

      if (destPanel === 2) {
        onNextMonth();
      } else if (destPanel === 0) {
        onPrevMonth();
      }
    },
    [onNextMonth, onPrevMonth]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Programmatic Next (Chevrons / Keyboard)
  const slideNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsDragging(false);
    setDragOffsetPx(0);
    setTargetPanelIndex(2);

    animTimerRef.current = setTimeout(() => {
      completeSlide(2);
    }, 280);
  }, [isAnimating, completeSlide]);

  // Programmatic Prev (Chevrons / Keyboard)
  const slidePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsDragging(false);
    setDragOffsetPx(0);
    setTargetPanelIndex(0);

    animTimerRef.current = setTimeout(() => {
      completeSlide(0);
    }, 280);
  }, [isAnimating, completeSlide]);

  useImperativeHandle(
    ref,
    () => ({
      slideNext,
      slidePrev
    }),
    [slideNext, slidePrev]
  );

  // Touch Event Handlers
  const handleTouchStart = (e) => {
    if (isAnimating) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    currentDiffX.current = 0;
    isHorizontalSwipe.current = false;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isAnimating) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    if (!isHorizontalSwipe.current) {
      // Determine swipe intent
      if (Math.abs(diffX) > 6 && Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalSwipe.current = true;
        hasMovedRef.current = true;
      } else if (Math.abs(diffY) > 8) {
        // Vertical scroll, stop drag
        setIsDragging(false);
        return;
      }
    }

    if (isHorizontalSwipe.current) {
      hasMovedRef.current = true;
      currentDiffX.current = diffX;
      setDragOffsetPx(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const diff = currentDiffX.current;
    const threshold = 40; // px to trigger month slide

    if (diff < -threshold) {
      // Swiped Left -> Next Month
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(2);
      animTimerRef.current = setTimeout(() => {
        completeSlide(2);
      }, 280);
    } else if (diff > threshold) {
      // Swiped Right -> Prev Month
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(0);
      animTimerRef.current = setTimeout(() => {
        completeSlide(0);
      }, 280);
    } else {
      // Snap back to current
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(1);
      animTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 280);
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    if (e.button !== 0 || isAnimating) return;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    currentDiffX.current = 0;
    isHorizontalSwipe.current = false;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isAnimating) return;
    const diffX = e.clientX - touchStartX.current;
    const diffY = e.clientY - touchStartY.current;

    if (Math.abs(diffX) > 5) {
      hasMovedRef.current = true;
      currentDiffX.current = diffX;
      setDragOffsetPx(diffX);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || isAnimating) return;
    setIsDragging(false);

    const diff = currentDiffX.current;
    const threshold = 40;

    if (diff < -threshold) {
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(2);
      animTimerRef.current = setTimeout(() => {
        completeSlide(2);
      }, 280);
    } else if (diff > threshold) {
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(0);
      animTimerRef.current = setTimeout(() => {
        completeSlide(0);
      }, 280);
    } else {
      setIsAnimating(true);
      setDragOffsetPx(0);
      setTargetPanelIndex(1);
      animTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 280);
    }
  };

  const handleCellClick = (day) => {
    if (hasMovedRef.current) return;

    if (activeMode === 'modal') {
      onSelectDay(day);
    } else if (activeMode === 'both' || activeMode === 'all') {
      if (onToggleAll) {
        onToggleAll(day.dateKey);
      } else if (onToggleBoth) {
        onToggleBoth(day.dateKey);
      }
    } else if (activeMode === 'smokeFree') {
      onToggleSmokeFree ? onToggleSmokeFree(day.dateKey) : onToggleHabit?.('smoke-free', day.dateKey);
    } else if (activeMode === 'workout') {
      onToggleWorkout ? onToggleWorkout(day.dateKey) : onToggleHabit?.('workout', day.dateKey);
    } else if (onToggleHabit) {
      onToggleHabit(activeMode, day.dateKey);
    } else {
      onSelectDay(day);
    }
  };

  // Base transform percentage: Panel 0 = 0%, Panel 1 = -33.333333%, Panel 2 = -66.666667%
  const basePercent = -targetPanelIndex * (100 / 3);
  const trackStyle = {
    transform: isDragging
      ? `translate3d(calc(${basePercent}% + ${dragOffsetPx}px), 0, 0)`
      : `translate3d(${basePercent}%, 0, 0)`,
    transition: isAnimating
      ? 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'none'
  };

  // 3D Rolling Cylinder Wheel Angle calculation
  let wheelAngle = 0;
  if (isDragging) {
    wheelAngle = Math.max(-90, Math.min(90, (dragOffsetPx / 150) * 90));
  } else if (isAnimating) {
    if (targetPanelIndex === 2) wheelAngle = -90;
    else if (targetPanelIndex === 0) wheelAngle = 90;
    else wheelAngle = 0;
  }

  const wheelCylinderStyle = {
    transform: `rotateY(${wheelAngle}deg)`,
    transition: isAnimating
      ? 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'none'
  };

  // Selective face opacity prevents previous/next months from peeking or flickering at rest
  const prevOpacity = wheelAngle > 0 ? 1 : 0;
  const nextOpacity = wheelAngle < 0 ? 1 : 0;
  const currentOpacity = 1;

  const renderDaysPanel = (panelDays, panelIdx, isCurrent) => {
    return (
      <div className="calendar-panel">
        <div className="days-grid">
          {panelDays.map((day) => {
            const record = habitData[day.dateKey] || {};
            const completedHabits =
              habits.length > 0 ? habits.filter((h) => !!record[h.id]) : [];
            const isSF = !!(record.smokeFree || record['smoke-free']);
            const isWO = !!record.workout;
            const hasAllDone =
              habits.length > 0
                ? completedHabits.length === habits.length && habits.length > 0
                : isSF && isWO;

            const tooltipTitle =
              habits.length > 0
                ? `${day.dateKey}${completedHabits.map((h) => ` • ${h.name}`).join('')}`
                : `${day.dateKey}${isSF ? ' • Smoke-Free' : ''}${isWO ? ' • Worked Out' : ''}`;

            return (
              <div
                key={`p${panelIdx}-${day.dateKey}`}
                onClick={() => isCurrent && handleCellClick(day)}
                className={`day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${
                  day.isToday ? 'today' : ''
                } ${day.isFuture ? 'is-future' : ''} ${hasAllDone ? 'has-both' : ''}`}
                title={tooltipTitle}
              >
                <div className="day-header-row">
                  <span className="day-number">{day.dayNumber}</span>
                  {day.isToday && <span className="today-dot" title="Today" />}
                </div>

                <div className="day-lines-row">
                  {habits.length > 0 ? (
                    completedHabits.map((h) => (
                      <span
                        key={h.id}
                        className="habit-line"
                        style={{ backgroundColor: h.color || '#3b82f6' }}
                        title={h.name}
                      />
                    ))
                  ) : (
                    <>
                      {isSF && (
                        <span className="habit-line smoke" title="Smoke-Free" />
                      )}
                      {isWO && (
                        <span className="habit-line workout" title="Worked Out" />
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
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
          >
            {renderDaysPanel(prevDays, 0, false)}
            {renderDaysPanel(currentDays, 1, true)}
            {renderDaysPanel(nextDays, 2, false)}
          </div>
        </div>

        {/* Rolling Wheel Month Display - Confined strictly to badge width */}
        <div className="wheel-month-container">
          <div className="wheel-cylinder-viewport">
            <div
              ref={wheelCylinderRef}
              className="wheel-cylinder"
              style={wheelCylinderStyle}
            >
              <div className="wheel-face prev" style={{ opacity: prevOpacity }}>
                <span className="panel-month-text">{MONTH_NAMES[prevMonthDate.getMonth()]}</span>
              </div>
              <div className="wheel-face current" style={{ opacity: currentOpacity }}>
                <span className="panel-month-text">{MONTH_NAMES[currentDate.getMonth()]}</span>
              </div>
              <div className="wheel-face next" style={{ opacity: nextOpacity }}>
                <span className="panel-month-text">{MONTH_NAMES[nextMonthDate.getMonth()]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Legend */}
        <div className="calendar-legend">
          {habits.length > 0 ? (
            <>
              {habits.map((habit) => (
                <div key={habit.id} className="legend-item">
                  <span
                    className="legend-line"
                    style={{ backgroundColor: habit.color || '#3b82f6' }}
                  />
                  <span>{habit.name}</span>
                </div>
              ))}
              <div className="legend-item">
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  {habits.slice(0, 3).map((h) => (
                    <span
                      key={h.id}
                      className="legend-line"
                      style={{ width: 8, backgroundColor: h.color || '#3b82f6' }}
                    />
                  ))}
                </div>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>All Done</span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
          <div className="legend-item">
            <span className="today-dot" style={{ position: 'static' }} />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
});
