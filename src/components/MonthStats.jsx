import React from 'react';
import { CigaretteOff, Dumbbell, Sparkles, Flame } from 'lucide-react';

export function MonthStats({ totals, streaks }) {
  const {
    smokeFreeCount,
    workoutCount,
    doubleWinCount,
    daysInMonth,
    smokeFreeRate,
    workoutRate
  } = totals;

  const doubleWinRate = daysInMonth > 0 ? Math.round((doubleWinCount / daysInMonth) * 100) : 0;

  return (
    <div className="stats-grid">
      {/* Smoke Free Card */}
      <div className="glass-card stat-card smoke-free">
        <div className="stat-top">
          <span className="stat-label">Smoke Free</span>
          <div className="stat-icon">
            <CigaretteOff size={18} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-number">{smokeFreeCount}</span>
          <span className="stat-subtext">/ {daysInMonth} days</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{ width: `${Math.min(100, Math.round((smokeFreeCount / daysInMonth) * 100))}%` }}
          />
        </div>
        <span className="stat-subtext">{smokeFreeRate}% of elapsed month</span>
      </div>

      {/* Workout Card */}
      <div className="glass-card stat-card workout">
        <div className="stat-top">
          <span className="stat-label">Worked Out</span>
          <div className="stat-icon">
            <Dumbbell size={18} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-number">{workoutCount}</span>
          <span className="stat-subtext">/ {daysInMonth} days</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{ width: `${Math.min(100, Math.round((workoutCount / daysInMonth) * 100))}%` }}
          />
        </div>
        <span className="stat-subtext">{workoutRate}% consistency</span>
      </div>

      {/* Double Win Card */}
      <div className="glass-card stat-card double-win">
        <div className="stat-top">
          <span className="stat-label">Double Wins</span>
          <div className="stat-icon">
            <Sparkles size={18} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-number">{doubleWinCount}</span>
          <span className="stat-subtext">perfect days</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{ width: `${Math.min(100, doubleWinRate)}%` }}
          />
        </div>
        <span className="stat-subtext">Both habits completed</span>
      </div>

      {/* Streaks Card */}
      <div className="glass-card stat-card streak">
        <div className="stat-top">
          <span className="stat-label">Current Streak</span>
          <div className="stat-icon">
            <Flame size={18} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-number">{streaks.smokeFreeStreak}</span>
          <span className="stat-subtext">d smoke-free</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{ width: `${Math.min(100, streaks.smokeFreeStreak * 10)}%` }}
          />
        </div>
        <span className="stat-subtext">💪 {streaks.workoutStreak} day workout streak</span>
      </div>
    </div>
  );
}
