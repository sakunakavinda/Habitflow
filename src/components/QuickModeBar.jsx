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
    modes.push({
      id: 'all',
      label: 'All Habits',
      iconName: 'sparkles',
      isAll: true
    });
  } else {
    modes = [
      { id: 'modal', label: 'Detail View', iconName: null, isDefaultModal: true },
      { id: 'smokeFree', label: 'Smoke Free', iconName: 'cigarette-off', color: '#10b981' },
      { id: 'workout', label: 'Workout', iconName: 'dumbbell', color: '#f59e0b' },
      { id: 'both', label: 'Both Habits', iconName: 'sparkles', isAll: true }
    ];
  }

  // Active mode hint text
  let activeHint = 'Open day detail dialog';
  if (activeMode === 'all' || activeMode === 'both') {
    activeHint = 'Toggle all habits on tap';
  } else if (activeMode !== 'modal') {
    const matchedHabit = habits.find((h) => h.id === activeMode);
    activeHint = matchedHabit
      ? `1-Tap to toggle ${matchedHabit.name}`
      : `Toggle ${activeMode} on tap`;
  }

  return (
    <div className="glass-card quick-mode-bar">
      <div className="quick-mode-header">
        <span className="quick-mode-label">Tap Action:</span>
        <span className="quick-mode-hint">{activeHint}</span>
      </div>
      <div className="mode-selector">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-btn ${isActive ? 'active' : ''}`}
              style={
                isActive && mode.color
                  ? {
                      borderColor: mode.color,
                      boxShadow: `0 0 12px ${mode.color}40`,
                      background: `linear-gradient(135deg, ${mode.color}25, rgba(255, 255, 255, 0.05))`
                    }
                  : {}
              }
              onClick={() => setActiveMode(mode.id)}
              title={
                mode.isDefaultModal
                  ? 'Click day to open detail modal'
                  : `1-Click to toggle ${mode.label} on calendar days`
              }
            >
              {mode.isDefaultModal ? (
                <MousePointer size={14} className="mode-icon" />
              ) : (
                <HabitIcon
                  name={mode.iconName}
                  color={isActive && mode.color ? mode.color : undefined}
                  size={14}
                  className="mode-icon"
                />
              )}
              <span className="mode-text">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
