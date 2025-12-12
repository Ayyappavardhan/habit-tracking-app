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
 */
export function getDateRangeForPeriod(period: PeriodType, referenceDate: Date = new Date()): {
    startDate: Date;
    endDate: Date;
} {
    const endDate = new Date(referenceDate);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(referenceDate);
    startDate.setHours(0, 0, 0, 0);

    switch (period) {
        case 'week':
            // Start from beginning of current week (Sunday)
            const dayOfWeek = startDate.getDay();
            startDate.setDate(startDate.getDate() - dayOfWeek);
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
 */
export function getWeeklyActivityData(
    habits: Habit[],
    selectedHabitId?: string
): { day: string; value: number; isToday: boolean }[] {
    const today = getTodayLocal();
    const targetHabits = selectedHabitId
        ? habits.filter(h => h.id === selectedHabitId)
        : habits;

    if (targetHabits.length === 0) {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
            day,
            value: 0,
            isToday: false,
        }));
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: { day: string; value: number; isToday: boolean }[] = [];

    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = formatLocalDate(date);

        let completedCount = 0;
        let scheduledCount = 0; // Count how many habits were scheduled for this day

        for (const habit of targetHabits) {
            scheduledCount++; // Assuming daily for MVP
            if (habit.completedDates[dateStr]) {
                completedCount++;
            }
        }

        // Percentage for this specific day = (Completed / Scheduled) * 100
        const completionRate = scheduledCount > 0
            ? Math.round((completedCount / scheduledCount) * 100)
            : 0;

        result.push({
            day: dayNames[i],
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
