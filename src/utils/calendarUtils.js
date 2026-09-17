/**
 * Calendar and date utility functions
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function formatDateKey(year, month, day) {
  const y = String(year);
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateToKey(date) {
  return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayKey() {
  return dateToKey(new Date());
}

/**
 * Returns a 42-day (or 35-day) matrix for a given year & month (0-indexed month)
 * Week starts on Monday (0 = Mon, 6 = Sun)
 */
export function getMonthGrid(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Convert JS getDay() (0=Sun, 1=Mon, ..., 6=Sat) to Monday-based (0=Mon, ..., 6=Sun)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const todayKey = getTodayKey();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  // Previous month padding days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const key = dateToKey(prevDate);
    days.push({
      date: prevDate,
      dateKey: key,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: key === todayKey,
      isFuture: prevDate > today,
      isPrevMonth: true
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const curDate = new Date(year, month, dayNum);
    const key = formatDateKey(year, month, dayNum);
    days.push({
      date: curDate,
      dateKey: key,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: key === todayKey,
      isFuture: curDate > today,
      isPrevMonth: false
    });
  }

  // Fixed 42-cell matrix (6 rows x 7 days) ensures every month has identical height
  // and eliminates any vertical jumping or flickering during swiping between months.
  const totalSlots = 42;
  const needToAdd = totalSlots - days.length;

  for (let i = 1; i <= needToAdd; i++) {
    const nextDate = new Date(year, month + 1, i);
    const key = dateToKey(nextDate);
    days.push({
      date: nextDate,
      dateKey: key,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: key === todayKey,
      isFuture: nextDate > today,
      isNextMonth: true
    });
  }

  return days;
}

/**
 * Calculates monthly totals for all habits (and legacy smoke-free / workout compatibility)
 */
export function calculateMonthTotals(habitData, year, month, habits = []) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const habitCounts = {};
  habits.forEach((h) => {
    habitCounts[h.id] = 0;
  });

  let smokeFreeCount = 0;
  let workoutCount = 0;
  let doubleWinCount = 0;
  let perfectDaysCount = 0;

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const isFutureMonth = new Date(year, month, 1) > now;
  const daysElapsed = isFutureMonth
    ? 0
    : isCurrentMonth
    ? now.getDate()
    : daysInMonth;

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${prefix}${String(day).padStart(2, '0')}`;
    const record = habitData[key];
    if (record) {
      // Dynamic habit counts
      let completedHabitsThisDay = 0;
      habits.forEach((h) => {
        if (record[h.id]) {
          habitCounts[h.id] = (habitCounts[h.id] || 0) + 1;
          completedHabitsThisDay++;
        }
      });

      if (habits.length > 0 && completedHabitsThisDay === habits.length) {
        perfectDaysCount++;
      }

      // Legacy fallback
      const isSF = !!(record.smokeFree || record['smoke-free']);
      const isWO = !!record.workout;
      if (isSF) smokeFreeCount++;
      if (isWO) workoutCount++;
      if (isSF && isWO) doubleWinCount++;
    }
  }

  const habitRates = {};
  habits.forEach((h) => {
    habitRates[h.id] = daysElapsed > 0 ? Math.round(((habitCounts[h.id] || 0) / daysElapsed) * 100) : 0;
  });

  const smokeFreeRate = daysElapsed > 0 ? Math.round((smokeFreeCount / daysElapsed) * 100) : 0;
  const workoutRate = daysElapsed > 0 ? Math.round((workoutCount / daysElapsed) * 100) : 0;

  return {
    smokeFreeCount,
    workoutCount,
    doubleWinCount,
    perfectDaysCount,
    habitCounts,
    habitRates,
    daysInMonth,
    daysElapsed,
    smokeFreeRate,
    workoutRate
  };
}

/**
 * Calculate current consecutive streaks for dynamic habits as well as legacy keys
 */
export function calculateStreaks(habitData, habits = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getStreak(habitKey) {
    let streak = 0;
    const checkDate = new Date(today);

    // If today is marked, start count from today.
    // If today is not yet marked, check if yesterday was marked (streak still alive today!).
    const todayStr = dateToKey(checkDate);
    const todayMarked = habitData[todayStr] && (habitData[todayStr][habitKey] || (habitKey === 'smokeFree' && habitData[todayStr]['smoke-free']));

    if (!todayMarked) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = dateToKey(checkDate);
      if (habitData[key] && (habitData[key][habitKey] || (habitKey === 'smokeFree' && habitData[key]['smoke-free']))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  const habitStreaks = {};
  habits.forEach((h) => {
    habitStreaks[h.id] = getStreak(h.id);
  });

  return {
    smokeFreeStreak: getStreak('smokeFree'),
    workoutStreak: getStreak('workout'),
    habitStreaks
  };
}
