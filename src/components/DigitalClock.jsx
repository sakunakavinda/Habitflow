import React, { useState, useEffect } from 'react';

export default function DigitalClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Strict 24-hour mode formatting
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const dayOfWeek = time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthStr = time.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dateNum = String(time.getDate()).padStart(2, '0');

  return (
    <div
      className="digital-clock-widget"
      role="timer"
      aria-label={`Current 24-hour time ${hours}:${minutes}:${seconds}`}
    >
      <div className="digital-clock-bezel">
        {/* Glow ambient layer */}
        <div className="digital-clock-glow" />

        {/* 24-Hour Time display */}
        <div className="digital-clock-digits">
          <span className="digital-part">{hours}</span>
          <span className="digital-colon">:</span>
          <span className="digital-part">{minutes}</span>
          <span className="digital-colon digital-colon--sec">:</span>
          <span className="digital-part digital-part--sec">{seconds}</span>
        </div>

        {/* Date subtitle */}
        <div className="digital-clock-sub">
          <span className="digital-date-text">{dayOfWeek}, {monthStr} {dateNum}</span>
          <span className="digital-format-tag">24H</span>
        </div>
      </div>
    </div>
  );
}
