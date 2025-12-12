/**
 * Sample Habit Data
 */

import { Habit } from '@/types/habit';

export const sampleHabits: Habit[] = [
    {
        id: '1',
        name: 'Walk',
        icon: '🚶',
        goal: 4060,
        unit: 'steps',
        frequency: '3 days a week',
        daysPerWeek: 3,
        completedDays: 0,
        percentComplete: 0,
        totalProgress: 0,
        completedDates: {}, // Empty initially
    },
    {
        id: '2',
        name: 'Working Time',
        icon: '💼',
        goal: 240,
        unit: 'hours',
        frequency: '3 days a week',
        daysPerWeek: 3,
        completedDays: 0,
        percentComplete: 0,
        totalProgress: 0,
        completedDates: {}, // Empty initially
    },
];
