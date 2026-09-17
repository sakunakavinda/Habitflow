import React from 'react';
import { X, Smartphone, Sparkles, Dumbbell, Share2, PlusSquare, Flame, Check } from 'lucide-react';

export function WidgetsModal({ onClose, onTriggerShortcut, currentStreak, onOpenAddToHomeGuide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content widget-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-date-display">
            <span className="modal-day-name">PWA Quick Actions & Badges</span>
            <span className="modal-date-full" style={{ fontSize: '1.25rem' }}>
              Mobile Home Screen Widgets
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

        {/* Live App Badge Preview */}
        <div className="widget-badge-card">
          <div className="widget-icon-preview">
            <img src="/pwa-icon.svg" alt="HabitWave" width={48} height={48} />
            {currentStreak > 0 && (
              <span className="app-icon-counter-badge" title="Live streak count on your home screen icon!">
                {currentStreak}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
              Live App Icon Badging
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Displays your active <strong style={{ color: '#fbbf24' }}>{currentStreak}-day streak</strong> directly on your mobile home screen icon!
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Home Screen Long-Press Shortcuts
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            When added to your home screen, press and hold the app icon to instantly access quick actions:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="shortcut-item" onClick={() => onTriggerShortcut('workout')}>
              <div className="shortcut-left">
                <span className="badge-tag workout" style={{ width: 26, height: 26 }}>
                  <Dumbbell size={14} />
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                    Log Workout
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Mark today's workout completed
                  </div>
                </div>
              </div>
              <button type="button" className="btn" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                Test
              </button>
            </div>

            <div className="shortcut-item" onClick={() => onTriggerShortcut('all')}>
              <div className="shortcut-left">
                <span className="badge-tag" style={{ width: 26, height: 26, background: 'var(--gold-gradient)', color: '#000' }}>
                  <Sparkles size={14} />
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                    Log All Habits
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Mark all daily habits completed
                  </div>
                </div>
              </div>
              <button type="button" className="btn" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                Test
              </button>
            </div>
          </div>
        </div>

        {/* How to add to home screen */}
        <div className="how-to-install-box">
          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#ffffff', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Smartphone size={15} color="#60a5fa" />
            <span>How to Enable on Your Phone:</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>
              📱 <strong>iPhone (Safari):</strong> Tap <Share2 size={13} style={{ verticalAlign: 'middle' }} /> <strong>Share</strong> ➔ <PlusSquare size={13} style={{ verticalAlign: 'middle' }} /> <strong>Add to Home Screen</strong>.
            </div>
            <div>
              🤖 <strong>Android (Chrome):</strong> Tap <strong>⋮ Menu</strong> ➔ <strong>Install App</strong> (or Add to Home Screen).
            </div>
          </div>
          {onOpenAddToHomeGuide && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '0.65rem', padding: '0.45rem', fontSize: '0.78rem', justifyContent: 'center', gap: '6px' }}
              onClick={onOpenAddToHomeGuide}
            >
              <Smartphone size={14} color="#10b981" />
              <span>View Step-by-Step Visual Guide 📸</span>
            </button>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-full" onClick={onClose}>
            <Check size={16} />
            <span>Got it!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
