import React from 'react';
import { MousePointer, CigaretteOff, Dumbbell, Sparkles } from 'lucide-react';

export function QuickModeBar({ activeMode, setActiveMode }) {
  const modes = [
    { id: 'modal', label: 'Detail View', icon: MousePointer, class: 'inspect' },
    { id: 'smokeFree', label: 'Smoke Free', icon: CigaretteOff, class: 'smoke' },
    { id: 'workout', label: 'Workout', icon: Dumbbell, class: 'workout' },
    { id: 'both', label: 'Both Habits', icon: Sparkles, class: 'both' }
  ];

  return (
    <div className="glass-card quick-mode-bar">
      <div className="quick-mode-header">
        <span className="quick-mode-label">Tap Action:</span>
        <span className="quick-mode-hint">
          {activeMode === 'modal' && 'Open day detail dialog'}
          {activeMode === 'smokeFree' && 'Toggle 🚭 on tap'}
          {activeMode === 'workout' && 'Toggle 💪 on tap'}
          {activeMode === 'both' && 'Toggle both on tap'}
        </span>
      </div>
      <div className="mode-selector">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-btn ${isActive ? `active ${mode.class}` : ''}`}
              onClick={() => setActiveMode(mode.id)}
              title={
                mode.id === 'modal'
                  ? 'Click day to open detail modal'
                  : `1-Click to toggle ${mode.label} on calendar days`
              }
            >
              <Icon size={14} className="mode-icon" />
              <span className="mode-text">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
