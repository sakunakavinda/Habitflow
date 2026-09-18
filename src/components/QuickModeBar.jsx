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

  return (
    <div id="tap-actions-section" className="glass-card quick-mode-bar">
      <div className="quick-mode-header">
        <div className="quick-mode-title-wrap">
          <span className="quick-mode-label">Tap Action:</span>
          <span
            className="quick-mode-hint"
            style={
              activeHabit
                ? {
                    color: activeHabit.color,
                    borderColor: `${activeHabit.color}44`,
                    background: `${activeHabit.color}15`
                  }
                : {}
            }
          >
            {activeHint}
          </span>
        </div>
      </div>
      <div className="mode-selector">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;

          // Build button styles
          let btnStyle = {};
          if (mode.color) {
            if (isActive) {
              // Solid filled pill in habit color
              btnStyle = {
                background: mode.color,
                color: '#0a0a0a',
                boxShadow: `0 2px 14px ${mode.color}55`,
                border: `1.5px solid ${mode.color}`
              };
            } else {
              // Subtle tint — colored icon/text at rest
              btnStyle = {
                color: mode.color
              };
            }
          }

          // Icon color: contrast white on active (dark bg), habit color when inactive
          const iconColor = mode.color
            ? isActive
              ? '#0a0a0a'
              : mode.color
            : undefined;

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
                <MousePointer size={14} className="mode-icon" />
              ) : (
                <HabitIcon
                  name={mode.iconName}
                  color={iconColor}
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
