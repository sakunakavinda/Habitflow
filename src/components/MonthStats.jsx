import React from 'react';
import { Sparkles, Flame, Trophy } from 'lucide-react';
import { HabitIcon } from '../utils/habitIcons';

export function MonthStats({ totals, streaks, habits = [] }) {
  const {
    daysInMonth,
    totalMonthDays = daysInMonth,
    daysElapsed,
    habitCounts = {},
    habitRates = {},
    habitDaysElapsed = {},
    perfectDaysCount = 0,
    doubleWinCount = 0,
    smokeFreeCount = 0,
    workoutCount = 0,
    smokeFreeRate = 0,
    workoutRate = 0
  } = totals;

  const { habitStreaks = {}, smokeFreeStreak = 0, workoutStreak = 0 } = streaks;

  // If dynamic habits are available, render dynamic cards
  if (habits && habits.length > 0) {
    const perfectRate = totalMonthDays > 0 ? Math.round((perfectDaysCount / totalMonthDays) * 100) : 0;

    // Find highest active streak among habits
    let bestStreak = 0;
    let bestStreakHabitName = '';
    habits.forEach((h) => {
      const s = habitStreaks[h.id] || 0;
      if (s > bestStreak) {
        bestStreak = s;
        bestStreakHabitName = h.name;
      }
    });

    return (
      <div className="stats-grid">
        {/* Dynamic Habit Stat Cards */}
        {habits.map((habit) => {
          const count = habitCounts[habit.id] || 0;
          const rate = habitRates[habit.id] || 0;
          const streak = habitStreaks[habit.id] || 0;

          return (
            <div
              key={habit.id}
              className="glass-card stat-card"
              style={{
                borderLeft: `3px solid ${habit.color || '#3b82f6'}`
              }}
            >
              <div className="stat-top">
                <span className="stat-label">{habit.name}</span>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: `${habit.color}20`,
                    color: habit.color
                  }}
                >
                  <HabitIcon name={habit.icon} color={habit.color} size={18} />
                </div>
              </div>

              <div className="stat-number-row">
                <span className="stat-number" style={{ color: habit.color }}>
                  {count}
                </span>
                <span className="stat-subtext">/ {habitDaysElapsed[habit.id] ?? totalMonthDays} days</span>
              </div>

              <div className="stat-progress-bar">
                <div
                  className="stat-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round((count / ((habitDaysElapsed[habit.id] || totalMonthDays) || 1)) * 100))}%`,
                    backgroundColor: habit.color || 'var(--accent-emerald)'
                  }}
                />
              </div>

              <div className="stat-bottom-row">
                <span className="stat-subtext">{rate}% consistency</span>
                {streak > 0 && (
                  <span className="stat-streak-badge" style={{ color: habit.color }}>
                    🔥 {streak}d
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Perfect Days Card */}
        <div className="glass-card stat-card double-win">
          <div className="stat-top">
            <span className="stat-label">All Habits Completed</span>
            <div className="stat-icon">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="stat-number-row">
            <span className="stat-number">{perfectDaysCount}</span>
            <span className="stat-subtext">perfect days</span>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{ width: `${Math.min(100, perfectRate)}%` }}
            />
          </div>
          <span className="stat-subtext">100% of habits checked</span>
        </div>

        {/* Top Active Streak Card */}
        <div className="glass-card stat-card streak">
          <div className="stat-top">
            <span className="stat-label">Top Streak</span>
            <div className="stat-icon">
              <Flame size={18} />
            </div>
          </div>
          <div className="stat-number-row">
            <span className="stat-number">{bestStreak}</span>
            <span className="stat-subtext">days consecutive</span>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{ width: `${Math.min(100, bestStreak * 10)}%` }}
            />
          </div>
          <span className="stat-subtext">
            {bestStreakHabitName ? `Leader: ${bestStreakHabitName}` : 'Keep the momentum going!'}
          </span>
        </div>
      </div>
    );
  }

  // Fallback if no habits exist (e.g. user deleted all habits)
  return (
    <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
      <div className="glass-card stat-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <span className="stat-label" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          No Active Habits
        </span>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tap <strong>⚙️ Manage Habits</strong> to create a new habit or customize your daily routine.
        </p>
      </div>
    </div>
  );
}
