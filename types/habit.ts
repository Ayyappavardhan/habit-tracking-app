/**
 * Habit Types
 */

export type HabitCategory =
    | 'exercise'
    | 'walking'
    | 'reading'
    | 'meditation'
    | 'water'
    | 'sleep'
    | 'work'
    | 'learning'
    | 'health'
    | 'custom';

export type MetricType = 'steps' | 'minutes' | 'hours' | 'count' | 'boolean';

export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface Habit {
    id: string;
    name: string;
    icon: string;
    category: HabitCategory;
    metricType: MetricType;
    goal: number;
    unit: string;
    frequency: FrequencyType;
    daysPerWeek: number;
    completedDays: number;
    percentComplete: number;
    totalProgress: number;
    // Changed from boolean to number to store actual progress values per day
    completedDates: Record<string, number>;
    notificationEnabled: boolean;
    notificationTime?: string;
    notificationDay?: number; // For weekly: 1-7 (Sun-Sat), for monthly: 1-31
    notificationId?: string;
    createdAt: string;
}

export interface HabitStats {
    daysFinished: number;
    percentCompleted: number;
    totalValue: number;
    unit: string;
}
