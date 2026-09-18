import React from 'react';
import { MousePointer, Sparkles } from 'lucide-react';
import { HabitIcon } from '../utils/habitIcons';

export function QuickModeBar({ activeMode, setActiveMode, habits = [] }) {
  let modes = [
    { id: 'modal', label: 'Detail View', iconName: null, isDefaultModal: true }
  ];

  if (habits && habits.length > 0) {
    habits.forEach((h) => {
      modes.push({
        id: h.id,
        label: h.name,
        iconName: h.icon,
        color: h.color
      });
    });
    if (habits.length > 1) {
      modes.push({
        id: 'all',
        label: 'All Habits',
        iconName: 'sparkles',
        isAll: true
      });
    }
  }

  // Active mode hint text
  let activeHint = 'Open day detail dialog';
  const activeHabit = habits.find((h) => h.id === activeMode);
  if (activeMode === 'all' || activeMode === 'both') {
    activeHint = 'Toggle all habits on tap';
  } else if (activeHabit) {
    activeHint = `1-Tap to toggle ${activeHabit.name}`;
  }

  const activeColor = activeHabit ? activeHabit.color : '#3b82f6';

  return (
    <div id="tap-actions-section" className="glass-card quick-mode-bar">
      {/* Header Row */}
      <div className="quick-mode-header">
        <span className="quick-mode-label">Tap Action:</span>
        <span
          className="quick-mode-hint"
          style={{
            color: activeHabit ? activeHabit.color : 'var(--text-secondary)',
            borderColor: activeHabit ? `${activeHabit.color}66` : 'var(--border-subtle)',
            background: activeHabit ? `${activeHabit.color}15` : 'rgba(255, 255, 255, 0.04)'
          }}
        >
          {activeHint}
        </span>
      </div>

      {/* Capsule Track Container */}
      <div className="mode-selector-track">
        <div className="mode-selector">
          {modes.map((mode) => {
            const isActive = activeMode === mode.id;

            let btnStyle = {};
            if (isActive) {
              const themeColor = mode.color || '#3b82f6';
              btnStyle = {
                background: themeColor,
                color: '#000000',
                boxShadow: `0 2px 14px ${themeColor}66`
              };
            } else if (mode.color) {
              btnStyle = {
                color: mode.color
              };
            }

            const iconColor = isActive
              ? '#000000'
              : mode.color || 'var(--text-secondary)';

            return (
              <button
                key={mode.id}
                type="button"
                className={`mode-btn ${isActive ? 'active' : ''}`}
                style={btnStyle}
                onClick={() => setActiveMode(mode.id)}
                title={
                  mode.isDefaultModal
                    ? 'Click day to open detail modal'
                    : `1-Click to toggle ${mode.label} on calendar days`
                }
              >
                {mode.isDefaultModal ? (
                  <MousePointer size={15} color={isActive ? '#000000' : 'var(--text-secondary)'} className="mode-icon" />
                ) : (
                  <HabitIcon
                    name={mode.iconName}
                    color={iconColor}
                    size={15}
                    className="mode-icon"
                  />
                )}
                <span className="mode-text">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
