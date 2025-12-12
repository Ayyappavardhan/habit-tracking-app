/**
 * Calendar Utility Functions
 * Helper functions for calendar date calculations
 */

import { Habit } from '@/types/habit';

export interface DayCompletionStats {
    completed: number;
    total: number;
    percentage: number;
}

/**
 * Get completion stats for a specific date across all habits
 */
export function getCompletionStatsForDate(
    habits: Habit[],
    dateString: string
): DayCompletionStats {
    const total = habits.length;
    if (total === 0) {
        return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = habits.filter(
        (habit) => (habit.completedDates[dateString] || 0) > 0
    ).length;

    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
}

/**
 * Get all dates in a month as YYYY-MM-DD strings
 */
export function getDatesInMonth(year: number, month: number): string[] {
    const dates: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dates.push(dateStr);
    }

    return dates;
}

/**
 * Generate completion stats for all dates in a month
 */
export function getMonthCompletionStats(
    habits: Habit[],
    year: number,
    month: number
): Record<string, DayCompletionStats> {
    const dates = getDatesInMonth(year, month);
    const stats: Record<string, DayCompletionStats> = {};

    for (const dateString of dates) {
        stats[dateString] = getCompletionStatsForDate(habits, dateString);
    }

    return stats;
}

/**
 * Format a date string for display
 */
export function formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}
