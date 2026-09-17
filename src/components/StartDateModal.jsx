import React, { useState } from 'react';
import { Calendar, CalendarHeart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { getTodayKey, formatDateKey } from '../utils/calendarUtils';

export default function StartDateModal({ isOpen, onSave, initialDate }) {
  const todayKey = getTodayKey();
  const [selectedDate, setSelectedDate] = useState(() => initialDate || todayKey);

  if (!isOpen) return null;

  // Preset date helpers
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  const firstOfMonthKey = formatDateKey(now.getFullYear(), now.getMonth(), 1);

  const presets = [
    { label: 'Today', key: todayKey },
    { label: 'Yesterday', key: yesterdayKey },
    { label: 'Start of this Month', key: firstOfMonthKey }
  ];

  const handleConfirm = (e) => {
    e.preventDefault();
    if (selectedDate && onSave) {
      onSave(selectedDate);
    }
  };

  // Format readable display
  const [y, m, d] = selectedDate.split('-').map(Number);
  const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="modal-overlay" style={{ zIndex: 100000 }}>
      <div 
        className="modal-content start-date-modal glass-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Badge */}
        <div className="sdm-header">
          <div className="sdm-icon-badge">
            <CalendarHeart size={26} color="#10b981" />
          </div>
          <h2 className="sdm-title">Welcome to HabitWave!</h2>
          <p className="sdm-subtitle">
            Set your journey start date to begin tracking your habits with accuracy.
          </p>
        </div>

        {/* Informational Callout */}
        <div className="sdm-callout">
          <div className="sdm-callout-icon">
            <Sparkles size={16} color="#f59e0b" />
          </div>
          <div className="sdm-callout-text">
            All streaks, consistency percentages, and calendar records will be calculated starting from this date onward.
          </div>
        </div>

        <form onSubmit={handleConfirm} className="sdm-form">
          {/* Quick Presets */}
          <div className="sdm-presets-label">Quick Select:</div>
          <div className="sdm-presets-grid">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`sdm-preset-btn ${selectedDate === preset.key ? 'active' : ''}`}
                onClick={() => setSelectedDate(preset.key)}
              >
                {selectedDate === preset.key && <CheckCircle2 size={13} style={{ marginRight: 4 }} />}
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Input */}
          <div className="sdm-input-group">
            <label htmlFor="journey-start-date" className="sdm-input-label">
              <Calendar size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              Or choose a custom start date:
            </label>
            <div className="sdm-date-input-wrapper">
              <input
                id="journey-start-date"
                type="date"
                className="sdm-date-input"
                value={selectedDate}
                max={todayKey}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                required
              />
            </div>
          </div>

          {/* Date Confirmation Preview */}
          <div className="sdm-preview-box">
            <span className="sdm-preview-label">Tracking starts:</span>
            <span className="sdm-preview-value">{displayDate}</span>
          </div>

          {/* Submit Action */}
          <button type="submit" className="btn btn-full sdm-submit-btn">
            <span>Set Start Date & Continue</span>
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
