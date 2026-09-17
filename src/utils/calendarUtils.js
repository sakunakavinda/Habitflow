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

  // Next month padding days to complete 35 or 42 grid slots
  const remainingSlots = (7 - (days.length % 7)) % 7;
  // Ensure we at least show a clean consistent grid (35 or 42 cells)
  const totalSlots = (days.length + remainingSlots) <= 35 ? 35 : 42;
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
 * Calculates monthly totals for smoke-free and workout days
 */
export function calculateMonthTotals(habitData, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let smokeFreeCount = 0;
  let workoutCount = 0;
  let doubleWinCount = 0;

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
      const isSF = !!record.smokeFree;
      const isWO = !!record.workout;

      if (isSF) smokeFreeCount++;
      if (isWO) workoutCount++;
      if (isSF && isWO) doubleWinCount++;
    }
  }

  const smokeFreeRate = daysElapsed > 0 ? Math.round((smokeFreeCount / daysElapsed) * 100) : 0;
  const workoutRate = daysElapsed > 0 ? Math.round((workoutCount / daysElapsed) * 100) : 0;

  return {
    smokeFreeCount,
    workoutCount,
    doubleWinCount,
    daysInMonth,
    daysElapsed,
    smokeFreeRate,
    workoutRate
  };
}

/**
 * Calculate current consecutive streak up to today or yesterday
 */
export function calculateStreaks(habitData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getStreak(habitKey) {
    let streak = 0;
    const checkDate = new Date(today);

    // If today is marked, start count from today.
    // If today is not yet marked, check if yesterday was marked (streak still alive today!).
    const todayStr = dateToKey(checkDate);
    const todayMarked = habitData[todayStr] && habitData[todayStr][habitKey];

    if (!todayMarked) {
      // Step back to yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = dateToKey(checkDate);
      if (habitData[key] && habitData[key][habitKey]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  return {
    smokeFreeStreak: getStreak('smokeFree'),
    workoutStreak: getStreak('workout')
  };
}
