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
export function getMonthGrid(year, month, startDate = null) {
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
      isBeforeStart: !!(startDate && key < startDate),
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
      isBeforeStart: !!(startDate && key < startDate),
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
      isBeforeStart: !!(startDate && key < startDate),
      isNextMonth: true
    });
  }

  return days;
}

/**
 * Calculates monthly totals for all habits, each scoped by its own habit.startDate
 * (falls back to the global journey startDate if habit.startDate is not set).
 */
export function calculateMonthTotals(habitData, year, month, habits = [], globalStartDate = null) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const habitCounts = {};
  const habitDaysElapsed = {}; // Per-habit elapsed days within this month
  habits.forEach((h) => {
    habitCounts[h.id] = 0;
    habitDaysElapsed[h.id] = 0;
  });

  let smokeFreeCount = 0;
  let workoutCount = 0;
  let doubleWinCount = 0;
  let perfectDaysCount = 0;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Compute global daysElapsed (for backwards-compat legacy fields)
  let daysElapsed = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${prefix}${String(day).padStart(2, '0')}`;
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    const isFutureDay = dayDate > now;
    const isBeforeGlobal = globalStartDate ? key < globalStartDate : false;
    if (!isFutureDay && !isBeforeGlobal) {
      daysElapsed++;
    }
  }

  // Compute per-habit daysElapsed
  habits.forEach((habit) => {
    const effectiveStart = habit.startDate || globalStartDate || null;
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${prefix}${String(day).padStart(2, '0')}`;
      const dayDate = new Date(year, month, day);
      dayDate.setHours(0, 0, 0, 0);
      const isFutureDay = dayDate > now;
      const isBeforeHabit = effectiveStart ? key < effectiveStart : false;
      if (!isFutureDay && !isBeforeHabit) {
        count++;
      }
    }
    habitDaysElapsed[habit.id] = count;
  });

  // Tally habit completions per day, scoped to each habit's own startDate
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${prefix}${String(day).padStart(2, '00'.slice(0, 2 - String(day).length))}`;
    const paddedKey = `${prefix}${String(day).padStart(2, '0')}`;

    const record = habitData[paddedKey];

    // Legacy tallies use global startDate
    const isBeforeGlobal = globalStartDate ? paddedKey < globalStartDate : false;
    if (!isBeforeGlobal && record) {
      const isSF = !!(record.smokeFree || record['smoke-free']);
      const isWO = !!record.workout;
      if (isSF) smokeFreeCount++;
      if (isWO) workoutCount++;
      if (isSF && isWO) doubleWinCount++;
    }

    // Per-habit counts
    let activeHabitsThisDay = 0;
    let completedActiveHabitsThisDay = 0;
    habits.forEach((h) => {
      const effectiveStart = h.startDate || globalStartDate || null;
      const isBeforeHabit = effectiveStart ? paddedKey < effectiveStart : false;
      if (!isBeforeHabit) {
        activeHabitsThisDay++;
        if (record && record[h.id]) {
          habitCounts[h.id] = (habitCounts[h.id] || 0) + 1;
          completedActiveHabitsThisDay++;
        }
      }
    });

    // Perfect day = all habits that were active on this day are completed
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    if (
      activeHabitsThisDay > 0 &&
      completedActiveHabitsThisDay === activeHabitsThisDay &&
      dayDate <= now
    ) {
      perfectDaysCount++;
    }
  }

  // Calculate total trackable days in this month based on global journey startDate (for MonthStats "/ N days" header)
  let totalMonthDays = daysInMonth;
  if (globalStartDate) {
    const [sYear, sMonth, sDay] = globalStartDate.split('-').map(Number);
    const startMonthIdx = sMonth - 1;
    if (year === sYear && month === startMonthIdx) {
      totalMonthDays = Math.max(0, daysInMonth - sDay + 1);
    } else if (year < sYear || (year === sYear && month < startMonthIdx)) {
      totalMonthDays = 0;
    } else {
      totalMonthDays = daysInMonth;
    }
  }

  const habitRates = {};
  habits.forEach((h) => {
    const elapsed = habitDaysElapsed[h.id] || 0;
    habitRates[h.id] = elapsed > 0 ? Math.round(((habitCounts[h.id] || 0) / elapsed) * 100) : 0;
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
    habitDaysElapsed,
    daysInMonth,
    totalMonthDays,
    daysElapsed,
    smokeFreeRate,
    workoutRate
  };
}

/**
 * Calculate current consecutive streaks for dynamic habits,
 * each scoped by the habit's own startDate (falls back to global startDate).
 */
export function calculateStreaks(habitData, habits = [], globalStartDate = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getStreak(habitKey, habitStartDate) {
    const effectiveStart = habitStartDate || globalStartDate || null;
    let streak = 0;
    const checkDate = new Date(today);

    const todayStr = dateToKey(checkDate);
    const todayMarked =
      habitData[todayStr] &&
      (habitData[todayStr][habitKey] ||
        (habitKey === 'smokeFree' && habitData[todayStr]['smoke-free']));

    if (!todayMarked) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = dateToKey(checkDate);

      // Stop streak check if reaching earlier than this habit's start date
      if (effectiveStart && key < effectiveStart) {
        break;
      }

      if (
        habitData[key] &&
        (habitData[key][habitKey] ||
          (habitKey === 'smokeFree' && habitData[key]['smoke-free']))
      ) {
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
    habitStreaks[h.id] = getStreak(h.id, h.startDate || null);
  });

  return {
    smokeFreeStreak: getStreak('smokeFree', globalStartDate),
    workoutStreak: getStreak('workout', globalStartDate),
    habitStreaks
  };
}

