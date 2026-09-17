import React, { useEffect } from 'react';
import { X, Sparkles, Trash2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MONTH_NAMES } from '../utils/calendarUtils';
import { HabitIcon } from '../utils/habitIcons';

export function DayModal({
  selectedDay,
  habits = [],
  logs = {},
  onClose,
  onToggleHabit,
  onToggleAll,
  onClearDay
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedDay) return null;

  const date = selectedDay.date;
  const dateKey = selectedDay.dateKey;
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = MONTH_NAMES[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();

  const dayLogs = logs[dateKey] || {};

  const allHabitsCompleted =
    habits.length > 0 && habits.every((h) => !!dayLogs[h.id]);
  const hasAnyHabitsCompleted =
    habits.some((h) => !!dayLogs[h.id]);

  const isFuture = !!selectedDay.isFuture;
  const isBeforeStart = !!selectedDay.isBeforeStart;
  const isLocked = isFuture || isBeforeStart;

  const handleToggleAll = () => {
    if (isLocked) return;
    onToggleAll(dateKey);
    if (!allHabitsCompleted) {
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.65 },
          colors: habits.map((h) => h.color || '#3b82f6')
        });
      } catch (err) {
        // Fallback silently if confetti encounters issue
      }
    }
  };

  const handleSingleToggle = (habitId) => {
    if (isLocked) return;
    onToggleHabit(habitId, dateKey);
    // Check if toggling this will make all complete
    const willBeComplete = !dayLogs[habitId];
    const otherHabitsAllComplete = habits
      .filter((h) => h.id !== habitId)
      .every((h) => !!dayLogs[h.id]);

    if (willBeComplete && otherHabitsAllComplete && habits.length > 1) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.65 },
          colors: habits.map((h) => h.color || '#10b981')
        });
      } catch (e) {}
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-date-display">
            <span className="modal-day-name">{dayName}</span>
            <span className="modal-date-full">
              {monthName} {dayNum}, {year}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Future Day Restriction Banner */}
        {isFuture && (
          <div className="future-day-banner">
            <span className="future-banner-dot" />
            <span>Upcoming date: Habits can only be logged on or after this day.</span>
          </div>
        )}

        {/* Before Journey Start Date Banner */}
        {isBeforeStart && (
          <div className="future-day-banner" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' }}>
            <span className="future-banner-dot" style={{ background: '#ef4444' }} />
            <span>Prior to Start Date: Habits cannot be logged for dates before your journey began.</span>
          </div>
        )}

        {/* Dynamic Habit Action Toggles */}
        <div className="modal-actions-list">
          {habits.map((habit) => {
            const isCompleted = !!dayLogs[habit.id];
            return (
              <div
                key={habit.id}
                className={`habit-toggle-card ${isCompleted ? 'active' : ''} ${isLocked ? 'disabled' : ''}`}
                style={
                  isCompleted && !isLocked
                    ? {
                        borderColor: habit.color,
                        boxShadow: `0 0 16px ${habit.color}25`
                      }
                    : {}
                }
                onClick={() => !isLocked && handleSingleToggle(habit.id)}
                role="button"
                tabIndex={isLocked ? -1 : 0}
              >
                <div className="habit-toggle-left">
                  <div
                    className="habit-card-icon"
                    style={{
                      backgroundColor: isCompleted ? habit.color : 'rgba(255, 255, 255, 0.05)',
                      color: isCompleted ? '#ffffff' : habit.color || 'var(--text-secondary)'
                    }}
                  >
                    <HabitIcon name={habit.icon} color={isCompleted ? '#fff' : habit.color} size={20} />
                  </div>
                  <div>
                    <div className="habit-card-title">{habit.name}</div>
                    <div className="habit-card-desc">
                      {isFuture
                        ? 'Upcoming date (locked)'
                        : isCompleted
                        ? 'Completed for this day!'
                        : `Tap to mark ${habit.name.toLowerCase()} completed`}
                    </div>
                  </div>
                </div>

                <div
                  className="switch-pill"
                  style={isCompleted ? { backgroundColor: habit.color } : {}}
                />
              </div>
            );
          })}

          {habits.length === 0 && (
            <p className="empty-habits-note">No habits defined. Add habits using the Manage Habits button.</p>
          )}
        </div>

        {/* Quick Multi-Action & Clear (Hidden for future and before-start dates) */}
        {!isLocked && (
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
            {habits.length > 0 && (
              <button
                type="button"
                className={`btn btn-full ${allHabitsCompleted ? '' : 'btn-primary'}`}
                onClick={handleToggleAll}
                style={
                  allHabitsCompleted
                    ? { background: 'rgba(255, 255, 255, 0.08)' }
                    : { background: 'var(--gold-gradient)', color: '#032117' }
                }
              >
                <Sparkles size={16} />
                <span>{allHabitsCompleted ? 'Unmark All' : 'Achieved All Today!'}</span>
              </button>
            )}

            {hasAnyHabitsCompleted && (
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => onClearDay(dateKey)}
                title="Clear marks for this day"
                aria-label="Clear Day"
              >
                <Trash2 size={18} color="#f87171" />
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-full" onClick={onClose}>
            <Check size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
