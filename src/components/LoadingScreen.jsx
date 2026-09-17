import React, { useState, useEffect } from 'react';
import { CalendarHeart, Sparkles } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "Building habits that last...",
  "Every smoke-free day is a victory.",
  "Consistency beats intensity.",
  "Small wins create monumental changes.",
  "Your journey, one day at a time."
];

export function LoadingScreen({ onFinished, minDuration = 800 }) {
  const [progress, setProgress] = useState(15);
  const [isExiting, setIsExiting] = useState(false);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  useEffect(() => {
    // Dynamic progress bar progression
    const p1 = setTimeout(() => setProgress(45), 160);
    const p2 = setTimeout(() => setProgress(80), 400);
    const p3 = setTimeout(() => setProgress(100), minDuration - 150);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onFinished) onFinished();
      }, 400); // Matches CSS dissolve animation
    }, minDuration);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(exitTimer);
    };
  }, [minDuration, onFinished]);

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
