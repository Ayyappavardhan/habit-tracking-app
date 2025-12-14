/**
 * Analytics Utility Functions
 * Calculations for streaks, completion rates, and activity data
 */

import { Habit } from '@/types/habit';
import { formatLocalDate, getTodayLocal } from './dateUtils';

export type PeriodType = 'week' | 'month' | 'year';

/**
 * Check if a habit is scheduled for a specific date
 */
export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
    // For now, all habits are considered "daily" or based on frequency
    // In a more complex app, we'd check specific days of week
    if (habit.frequency === 'daily') return true;

    // For weekly/monthly, we might need more complex logic
    // But for this MVP, we'll assume they are "due" every day until completed?
    // OR simplified: Weekly habits are only "due" if we want to be strict.
    // Let's stick to: Daily habits are due every day.
    // Weekly habits are due if they haven't been done 'goal' times this week?
    // For simplicity in this version, we'll treat all habits as daily-trackable
    // but this might need refinement for non-daily habits.
    return true;
}

/**
 * Calculate current streak (consecutive days ending today or yesterday)
 */
export function calculateCurrentStreak(datesToCheck: string[], totalScheduledMap?: Record<string, number>): number {
    const today = getTodayLocal();
    const sortedDates = datesToCheck.sort().reverse();

    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const todayDate = new Date(today + 'T12:00:00');
    let checkDate = new Date(todayDate);

    // Check if today is completed
    const todayStr = formatLocalDate(checkDate);
    const isTodayDone = datesToCheck.includes(todayStr);

    if (!isTodayDone) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dateStr = formatLocalDate(checkDate);
        if (datesToCheck.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Calculate best (longest) streak ever
 */
export function calculateBestStreak(datesToCheck: string[]): number {
    if (datesToCheck.length === 0) return 0;

    const sortedDates = datesToCheck.sort();
    let bestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
        const currentDate = new Date(dateStr + 'T12:00:00');

        if (prevDate) {
            const diffDays = Math.round(
                (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
                currentStreak++;
            } else {
                bestStreak = Math.max(bestStreak, currentStreak);
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }

        prevDate = currentDate;
    }

    return Math.max(bestStreak, currentStreak);
}

/**
 * Get date range for a period
 * @param weekStartDay - 0 for Sunday, 1 for Monday
 */
export function getDateRangeForPeriod(
    period: PeriodType,
    referenceDate: Date = new Date(),
    weekStartDay: 0 | 1 = 0
): {
    startDate: Date;
    endDate: Date;
} {
    const endDate = new Date(referenceDate);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(referenceDate);
    startDate.setHours(0, 0, 0, 0);

    switch (period) {
        case 'week':
            // Start from beginning of current week based on weekStartDay setting
            const dayOfWeek = startDate.getDay();
            // Calculate days to subtract to get to weekStartDay
            const daysToSubtract = (dayOfWeek - weekStartDay + 7) % 7;
            startDate.setDate(startDate.getDate() - daysToSubtract);
            break;
        case 'month':
            startDate.setDate(1);
            break;
        case 'year':
            startDate.setMonth(0, 1);
            break;
    }

    return { startDate, endDate };
}

/**
 * Calculate completion rate for a given period
 * Formula: (Total Completed Instances / Total Scheduled Instances) * 100
 */
/**
 * Calculate completion rate for a given period
 * Formula: Average of (Habit_Actual / Habit_Possible) for each habit
 * 
 * Supports optional custom date range to be reused by comparison functions.
 */
export function calculateCompletionRate(
    habits: Habit[],
    period: PeriodType,
    selectedHabitId?: string,
    customStartDate?: Date,
    customEndDate?: Date
): number {
    if (habits.length === 0) return 0;

    const { startDate, endDate } = customStartDate && customEndDate
        ? { startDate: customStartDate, endDate: customEndDate }
        : getDateRangeForPeriod(period);

    const today = getTodayLocal();

    const targetHabits = selectedHabitId
        ? habits.filter(h => h.id === selectedHabitId)
        : habits;

    if (targetHabits.length === 0) return 0;

    let totalHabitRates = 0;
    let habitsWithScheduledEvents = 0;

    const start = startDate.getTime();
    // Cap the end date at today if checking current period, primarily to avoid future days skewing daily habits?
    // Actually, for "Possible", we usually want the whole period for "Weekly" or "Monthly" goals?
    // But typically apps don't penalize you for days that haven't happened yet.
    // So we cap 'end' at 'today' for the calculation of days.
    const end = Math.min(endDate.getTime(), new Date(today + 'T23:59:59').getTime());

    // If the entire period is in the future relative to today, then rate is 0 (or N/A).
    if (end < start) return 0;

    const daysInPeriod = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);

    for (const habit of targetHabits) {
        let habitActual = 0;
        let habitPossible = 0;

        // 1. Calculate Actual Completions for this habit
        Object.keys(habit.completedDates).forEach(date => {
            if (date >= formatLocalDate(startDate) && date <= formatLocalDate(endDate) && date <= today) {
                habitActual++;
            }
        });

        // 2. Calculate Possible Completions for this habit
        if (habit.frequency === 'weekly') {
            // Expected = (weeks * daysPerWeek)
            // Using precise day ratio: (daysInPeriod / 7) * daysPerWeek
            habitPossible = Math.round((daysInPeriod / 7) * (habit.daysPerWeek || 1));
            // Ensure at least 1 possible if period > 0 days, otherwise 0/0 division risk?
            // If period is < 1 week, possible might round to 0. Let's enforce min 1 if daysInPeriod >= 1?
            if (habitPossible === 0 && daysInPeriod >= 1) habitPossible = 1;
        } else {
            // Daily
            habitPossible = daysInPeriod;
        }

        if (habitPossible > 0) {
            // Cap at 100% just in case (e.g. extra completions?)
            const rate = Math.min(1.0, habitActual / habitPossible);
            totalHabitRates += rate;
            habitsWithScheduledEvents++;
        }
    }

    return habitsWithScheduledEvents > 0
        ? Math.round((totalHabitRates / habitsWithScheduledEvents) * 100)
        : 0;
}

/**
 * Compare completion rate with previous period
 */
export function getPreviousPeriodComparison(
    habits: Habit[],
    period: PeriodType,
    selectedHabitId?: string
): { current: number; previous: number; trend: 'up' | 'down' | 'same' } {
    const currentRate = calculateCompletionRate(habits, period, selectedHabitId);

    // Calculate previous period
    const now = new Date();
    const previousDate = new Date(now);

    switch (period) {
        case 'week':
            previousDate.setDate(previousDate.getDate() - 7);
            break;
        case 'month':
            // Robust month subtraction handling
            const currentMonth = previousDate.getMonth();
            previousDate.setMonth(currentMonth - 1);
            // Verify we didn't skip a month (e.g. Mar 31 -> Feb 28/29)
            if (previousDate.getMonth() !== ((currentMonth - 1 + 12) % 12)) {
                previousDate.setDate(0); // Set to last day of previous month
            }
            break;
        case 'year':
            previousDate.setFullYear(previousDate.getFullYear() - 1);
            break;
    }

    const { startDate, endDate } = getDateRangeForPeriod(period, previousDate);

    // Pass the calculated previous period dates to the MAIN calculation function
    // This reuses the EXACT same logic (Average of Rates) for the previous period.
    const previousRate = calculateCompletionRate(habits, period, selectedHabitId, startDate, endDate);

    return {
        current: currentRate,
        previous: previousRate,
        trend: currentRate > previousRate ? 'up' : currentRate < previousRate ? 'down' : 'same',
    };
}

/**
 * Get weekly activity data for bar chart
 * @param weekStartDay - 0 for Sunday, 1 for Monday
 */
export function getWeeklyActivityData(
    habits: Habit[],
    selectedHabitId?: string,
    weekStartDay: 0 | 1 = 0
): { day: string; value: number; isToday: boolean }[] {
    const today = getTodayLocal();
    const targetHabits = selectedHabitId
        ? habits.filter(h => h.id === selectedHabitId)
        : habits;

    // Day names ordered starting from weekStartDay
    const allDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNames = weekStartDay === 1
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : allDayNames;

    if (targetHabits.length === 0) {
        return dayNames.map(day => ({
            day,
            value: 0,
            isToday: false,
        }));
    }

    const result: { day: string; value: number; isToday: boolean }[] = [];

    const now = new Date();
    const currentDayOfWeek = now.getDay();
    // Calculate days to subtract to get to the start of week
    const daysToSubtract = (currentDayOfWeek - weekStartDay + 7) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = formatLocalDate(date);
        const dayIndex = date.getDay();

        let completedCount = 0;
        let scheduledCount = 0;

        for (const habit of targetHabits) {
            scheduledCount++;
            if (habit.completedDates[dateStr]) {
                completedCount++;
            }
        }

        const completionRate = scheduledCount > 0
            ? Math.round((completedCount / scheduledCount) * 100)
            : 0;

        result.push({
            day: allDayNames[dayIndex],
            value: completionRate,
            isToday: dateStr === today,
        });
    }

    return result;
}

/**
 * Get aggregated streak data across all habits or specific habit
 */
export function getStreakData(
    habits: Habit[],
    selectedHabitId?: string
): { current: number; best: number } {
    const targetHabits = selectedHabitId
        ? habits.filter(h => h.id === selectedHabitId)
        : habits;

    if (targetHabits.length === 0) {
        return { current: 0, best: 0 };
    }

    // 1. Single Habit Selected
    if (selectedHabitId) {
        const habit = targetHabits[0];
        const dates = Object.keys(habit.completedDates);
        return {
            current: calculateCurrentStreak(dates),
            best: calculateBestStreak(dates),
        };
    }

    // 2. All Habits Selected (Aggregate)
    // STRICT MODE: A day is only "complete" if ALL scheduled habits were done.
    // This is a "Perfect Day" streak.

    // First, identify all dates where at least one habit has activity
    const allActivityDates = new Set<string>();
    targetHabits.forEach(h => {
        Object.keys(h.completedDates).forEach(d => allActivityDates.add(d));
    });

    // Find earliest start date (optional optimization, but good for bounding)
    // Actually we just need to iterate through days where we have data?
    // Or we scan backwards from today for current streak.

    // For "best streak", we might need to check a range. 
    // Let's simplify: Build a set of "Perfect Dates"
    const perfectDates: string[] = [];

    // We need to check every day that could possibly be a perfect day.
    // Efficient way: Iterate through relevant date range or just check allActivityDates
    // But perfect streak could be broken by a day with NO activity, which wouldn't be in allActivityDates
    // So we depend on the "dates" list provided to the calculator.

    // Let's analyze dates from the earliest recorded completion to today
    const sortedActivityDates = Array.from(allActivityDates).sort();
    if (sortedActivityDates.length === 0) return { current: 0, best: 0 };

    const earliestDate = new Date(sortedActivityDates[0]);
    const today = new Date(getTodayLocal() + 'T12:00:00');

    const currentDate = new Date(earliestDate);
    while (currentDate <= today) {
        const dateStr = formatLocalDate(currentDate);

        let allDone = true;
        for (const habit of targetHabits) {
            // Assuming daily habits for MVP. If logic changes, check isHabitScheduledForDate
            if (!habit.completedDates[dateStr]) {
                allDone = false;
                break;
            }
        }

        if (allDone) {
            perfectDates.push(dateStr);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
        current: calculateCurrentStreak(perfectDates),
        best: calculateBestStreak(perfectDates),
    };
}

/**
 * Get total stats for all habits
 */
export function getTotalStats(habits: Habit[]): {
    totalHabits: number;
    totalCompletions: number;
    perfectDays: number;
    avgDailyCompletion: number;
} {
    if (habits.length === 0) {
        return { totalHabits: 0, totalCompletions: 0, perfectDays: 0, avgDailyCompletion: 0 };
    }

    const allDates = new Set<string>();
    let totalCompletions = 0;

    habits.forEach(habit => {
        Object.keys(habit.completedDates).forEach(date => {
            allDates.add(date);
            totalCompletions++;
        });
    });

    // Calculate perfect days (all habits completed)
    let perfectDays = 0;
    allDates.forEach(date => {
        const allDone = habits.every(habit => habit.completedDates[date]);
        if (allDone) perfectDays++;
    });

    // Average daily completion
    const daysTracked = allDates.size || 1;
    const avgDailyCompletion = Math.round((totalCompletions / daysTracked / habits.length) * 100);

    return {
        totalHabits: habits.length,
        totalCompletions,
        perfectDays,
        avgDailyCompletion,
    };
}

/**
 * Get best days analysis (which days of week are most productive)
 */
export function getBestDaysAnalysis(habits: Habit[]): {
    day: string;
    shortDay: string;
    completionRate: number;
    isWeekend: boolean;
}[] {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayStats: { completed: number; total: number }[] = Array(7).fill(null).map(() => ({ completed: 0, total: 0 }));

    if (habits.length === 0) {
        return dayNames.map((day, i) => ({
            day,
            shortDay: shortDays[i],
            completionRate: 0,
            isWeekend: i === 0 || i === 6,
        }));
    }

    // Analyze last 8 weeks of data
    const today = new Date();
    for (let i = 0; i < 56; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatLocalDate(date);
        const dayOfWeek = date.getDay();

        habits.forEach(habit => {
            dayStats[dayOfWeek].total++;
            if (habit.completedDates[dateStr]) {
                dayStats[dayOfWeek].completed++;
            }
        });
    }

    return dayNames.map((day, i) => ({
        day,
        shortDay: shortDays[i],
        completionRate: dayStats[i].total > 0
            ? Math.round((dayStats[i].completed / dayStats[i].total) * 100)
            : 0,
        isWeekend: i === 0 || i === 6,
    }));
}

/**
 * Get habit performance data (per-habit breakdown)
 */
export function getHabitPerformanceData(
    habits: Habit[],
    period: PeriodType
): {
    habit: Habit;
    completionRate: number;
    completedCount: number;
    possibleCount: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
}[] {
    const { startDate, endDate } = getDateRangeForPeriod(period);
    const today = getTodayLocal();
    const end = Math.min(endDate.getTime(), new Date(today + 'T23:59:59').getTime());
    const start = startDate.getTime();

    if (end < start) return [];

    const daysInPeriod = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);

    return habits.map(habit => {
        let completedCount = 0;
        let possibleCount = 0;

        Object.keys(habit.completedDates).forEach(date => {
            if (date >= formatLocalDate(startDate) && date <= formatLocalDate(endDate) && date <= today) {
                completedCount++;
            }
        });

        if (habit.frequency === 'weekly') {
            possibleCount = Math.max(1, Math.round((daysInPeriod / 7) * (habit.daysPerWeek || 1)));
        } else {
            possibleCount = daysInPeriod;
        }

        const completionRate = possibleCount > 0
            ? Math.round((completedCount / possibleCount) * 100)
            : 0;

        let status: 'excellent' | 'good' | 'fair' | 'poor';
        if (completionRate >= 80) status = 'excellent';
        else if (completionRate >= 60) status = 'good';
        else if (completionRate >= 40) status = 'fair';
        else status = 'poor';

        return {
            habit,
            completionRate: Math.min(100, completionRate),
            completedCount,
            possibleCount,
            status,
        };
    }).sort((a, b) => b.completionRate - a.completionRate);
}

/**
 * Get monthly heatmap data (last 35 days for calendar grid)
 */
export function getMonthlyHeatmapData(habits: Habit[]): {
    date: string;
    dayOfMonth: number;
    completionRate: number;
    weekIndex: number;
    dayIndex: number;
}[] {
    const result: {
        date: string;
        dayOfMonth: number;
        completionRate: number;
        weekIndex: number;
        dayIndex: number;
    }[] = [];

    if (habits.length === 0) return result;

    const today = new Date();

    // Get last 35 days (5 weeks)
    for (let i = 34; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatLocalDate(date);

        let completed = 0;
        habits.forEach(habit => {
            if (habit.completedDates[dateStr]) completed++;
        });

        const completionRate = Math.round((completed / habits.length) * 100);

        result.push({
            date: dateStr,
            dayOfMonth: date.getDate(),
            completionRate,
            weekIndex: Math.floor((34 - i) / 7),
            dayIndex: (34 - i) % 7,
        });
    }

    return result;
}

/**
 * Get daily precision (how closely user sticks to habits)
 */
export function getDailyPrecision(habits: Habit[], period: PeriodType): number {
    if (habits.length === 0) return 0;

    const { startDate, endDate } = getDateRangeForPeriod(period);
    const today = getTodayLocal();

    let perfectDays = 0;
    let totalDays = 0;

    const currentDate = new Date(startDate);
    const todayDate = new Date(today + 'T12:00:00');

    while (currentDate <= todayDate && currentDate <= endDate) {
        const dateStr = formatLocalDate(currentDate);
        totalDays++;

        const allDone = habits.every(habit => habit.completedDates[dateStr]);
        if (allDone) perfectDays++;

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalDays > 0 ? Math.round((perfectDays / totalDays) * 100) : 0;
}

/**
 * Generate dynamic insights based on user data
 */
export function generateInsights(habits: Habit[]): {
    icon: string;
    title: string;
    description: string;
    type: 'success' | 'tip' | 'warning' | 'info';
}[] {
    const insights: {
        icon: string;
        title: string;
        description: string;
        type: 'success' | 'tip' | 'warning' | 'info';
    }[] = [];

    if (habits.length === 0) {
        insights.push({
            icon: '🎯',
            title: 'Get Started',
            description: 'Add your first habit to begin tracking your progress!',
            type: 'info',
        });
        return insights;
    }

    const totalStats = getTotalStats(habits);
    const bestDays = getBestDaysAnalysis(habits);
    const streakData = getStreakData(habits);

    // Best day insight
    const sortedDays = [...bestDays].sort((a, b) => b.completionRate - a.completionRate);
    const bestDay = sortedDays[0];
    if (bestDay && bestDay.completionRate > 0) {
        insights.push({
            icon: '📅',
            title: `${bestDay.day}s are your best!`,
            description: `You complete ${bestDay.completionRate}% of habits on ${bestDay.day}s`,
            type: 'success',
        });
    }

    // Weekend vs Weekday comparison
    const weekdayAvg = bestDays.filter(d => !d.isWeekend).reduce((sum, d) => sum + d.completionRate, 0) / 5;
    const weekendAvg = bestDays.filter(d => d.isWeekend).reduce((sum, d) => sum + d.completionRate, 0) / 2;

    if (weekendAvg > weekdayAvg + 10) {
        insights.push({
            icon: '🌴',
            title: 'Weekend Warrior',
            description: `You're ${Math.round(weekendAvg - weekdayAvg)}% more consistent on weekends!`,
            type: 'tip',
        });
    } else if (weekdayAvg > weekendAvg + 10) {
        insights.push({
            icon: '💼',
            title: 'Weekday Champion',
            description: `You're ${Math.round(weekdayAvg - weekendAvg)}% more consistent on weekdays!`,
            type: 'tip',
        });
    }

    // Streak insight
    if (streakData.current >= 7) {
        insights.push({
            icon: '🔥',
            title: 'Amazing Streak!',
            description: `You've been consistent for ${streakData.current} days straight!`,
            type: 'success',
        });
    } else if (streakData.current >= 3) {
        insights.push({
            icon: '🌟',
            title: 'Building Momentum',
            description: `${streakData.current} day streak! Keep going to beat your best of ${streakData.best}!`,
            type: 'info',
        });
    } else if (streakData.best > 0) {
        insights.push({
            icon: '💪',
            title: 'Keep Pushing',
            description: `Your best streak was ${streakData.best} days. You can beat it!`,
            type: 'tip',
        });
    }

    // Perfect days insight
    if (totalStats.perfectDays >= 5) {
        insights.push({
            icon: '⭐',
            title: 'Perfect Day Master',
            description: `You've had ${totalStats.perfectDays} perfect days with all habits done!`,
            type: 'success',
        });
    }

    // Low performing habit tip
    const habitPerf = getHabitPerformanceData(habits, 'week');
    const lowPerformer = habitPerf.find(h => h.status === 'poor' || h.status === 'fair');
    if (lowPerformer && lowPerformer.completionRate < 50) {
        insights.push({
            icon: '🎯',
            title: `Focus on ${lowPerformer.habit.name}`,
            description: `Only ${lowPerformer.completionRate}% this week. Try setting a reminder!`,
            type: 'warning',
        });
    }

    return insights.slice(0, 4); // Return max 4 insights
}
