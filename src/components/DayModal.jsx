import React, { useEffect } from 'react';
import { X, CigaretteOff, Dumbbell, Sparkles, Trash2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MONTH_NAMES } from '../utils/calendarUtils';

export function DayModal({
  selectedDay,
  habitData,
  onClose,
  onToggleSmokeFree,
  onToggleWorkout,
  onToggleBoth,
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

  const record = habitData[dateKey] || {};
  const isSmokeFree = !!record.smokeFree;
  const isWorkout = !!record.workout;
  const hasBoth = isSmokeFree && isWorkout;

  const handleBothClick = () => {
    onToggleBoth(dateKey);
    if (!hasBoth) {
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899']
        });
      } catch (err) {
        // Fallback silently if confetti encounters issue
      }
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

        {/* Action Toggles */}
        <div className="modal-actions-list">
          {/* Smoke-Free Toggle Card */}
          <div
            className={`habit-toggle-card smoke ${isSmokeFree ? 'active' : ''}`}
            onClick={() => onToggleSmokeFree(dateKey)}
            role="button"
            tabIndex={0}
          >
            <div className="habit-toggle-left">
              <div className="habit-card-icon">
                <CigaretteOff size={22} />
              </div>
              <div>
                <div className="habit-card-title">Smoke-Free Day</div>
                <div className="habit-card-desc">
                  {isSmokeFree
                    ? '🎉 Clean lungs & smoke-free!'
                    : 'Tap to mark this day smoke-free'}
                </div>
              </div>
            </div>
            <div className="switch-pill" />
          </div>

          {/* Workout Toggle Card */}
          <div
            className={`habit-toggle-card workout ${isWorkout ? 'active' : ''}`}
            onClick={() => onToggleWorkout(dateKey)}
            role="button"
            tabIndex={0}
          >
            <div className="habit-toggle-left">
              <div className="habit-card-icon">
                <Dumbbell size={22} />
              </div>
              <div>
                <div className="habit-card-title">Worked Out</div>
                <div className="habit-card-desc">
                  {isWorkout
                    ? '💪 Workout completed & logged!'
                    : 'Tap to mark physical workout done'}
                </div>
              </div>
            </div>
            <div className="switch-pill" />
          </div>
        </div>

        {/* Quick Dual Action & Clear */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            className={`btn btn-full ${hasBoth ? '' : 'btn-primary'}`}
            onClick={handleBothClick}
            style={
              hasBoth
                ? { background: 'rgba(255, 255, 255, 0.08)' }
                : { background: 'var(--gold-gradient)', color: '#032117' }
            }
          >
            <Sparkles size={16} />
            <span>{hasBoth ? 'Unmark Both' : 'Achieved Both Today!'}</span>
          </button>

          {(isSmokeFree || isWorkout) && (
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
