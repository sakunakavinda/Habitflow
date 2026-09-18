import React, { useState, useEffect } from 'react';
import { CalendarHeart, Sparkles } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "Building habits that last...",
  "Every workout completed is a victory.",
  "Consistency beats intensity.",
  "Small wins create monumental changes.",
  "Your journey, one day at a time."
];

export function LoadingScreen({ onFinished, minDuration = 600, isReady = true }) {
  const [progress, setProgress] = useState(15);
  const [isExiting, setIsExiting] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  useEffect(() => {
    // Dynamic progress bar progression
    const p1 = setTimeout(() => setProgress(45), 140);
    const p2 = setTimeout(() => setProgress(75), 320);
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(minTimer);
    };
  }, [minDuration]);

  // Complete and exit once minimum duration has elapsed and app is ready
  useEffect(() => {
    if (minTimeElapsed && isReady && !isExiting) {
      setProgress(100);
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        const finishTimer = setTimeout(() => {
          if (onFinished) onFinished();
        }, 400); // Matches CSS dissolve animation
        return () => clearTimeout(finishTimer);
      }, 120);
      return () => clearTimeout(exitTimer);
    } else if (minTimeElapsed && !isReady) {
      // If minDuration passed but data is still resolving, hold smoothly at 90%
      setProgress(90);
    }
  }, [minTimeElapsed, isReady, isExiting, onFinished]);

  return (
    <div className={`loading-screen ${isExiting ? 'exit' : ''}`} aria-label="Loading HabitWave">
      <div className="loading-content">
        {/* Glowing Brand Icon Badge with Pulse */}
        <div className="loading-icon-wrapper">
          <div className="loading-icon-aura" />
          <div className="loading-brand-icon">
            <CalendarHeart size={38} />
          </div>
        </div>

        {/* Brand Name & Subtitle */}
        <div className="loading-text-group">
          <h1 className="loading-brand-title">HabitWave</h1>
          <p className="loading-brand-subtitle">Your Personal Habits Tracker</p>
        </div>

        {/* Animated Progress Track */}
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Motivational Tip */}
        <div className="loading-quote">
          <Sparkles size={13} className="loading-quote-icon" />
          <span>{MOTIVATIONAL_QUOTES[quoteIndex]}</span>
        </div>
      </div>

      {/* Bottom Creator Footer */}
      <div className="loading-footer">
        <span>created by dubLive technologies</span>
      </div>
    </div>
  );
}
