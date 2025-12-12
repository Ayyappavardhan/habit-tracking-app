/**
 * Habit Categories
 * Each category has an emoji icon and default metric type
 */

import { HabitCategory, MetricType } from '@/types/habit';

export interface CategoryConfig {
    id: HabitCategory;
    name: string;
    emoji: string;
    defaultMetric: MetricType;
    defaultUnit: string;
    defaultGoal: number;
    description: string;
}

export const categories: CategoryConfig[] = [
    {
        id: 'exercise',
        name: 'Exercise',
        emoji: '🏃',
        defaultMetric: 'minutes',
        defaultUnit: 'minutes',
        defaultGoal: 30,
        description: 'Running, Gym, Yoga',
    },
    {
        id: 'walking',
        name: 'Walking',
        emoji: '🚶',
        defaultMetric: 'steps',
        defaultUnit: 'steps',
        defaultGoal: 10000,
        description: 'Daily steps goal',
    },
    {
        id: 'reading',
        name: 'Reading',
        emoji: '📚',
        defaultMetric: 'minutes',
        defaultUnit: 'minutes',
        defaultGoal: 30,
        description: 'Books, Articles',
    },
    {
        id: 'meditation',
        name: 'Meditation',
        emoji: '🧘',
        defaultMetric: 'minutes',
        defaultUnit: 'minutes',
        defaultGoal: 10,
        description: 'Mindfulness, Calm',
    },
    {
        id: 'water',
        name: 'Water',
        emoji: '💧',
        defaultMetric: 'count',
        defaultUnit: 'glasses',
        defaultGoal: 8,
        description: 'Stay hydrated',
    },
    {
        id: 'sleep',
        name: 'Sleep',
        emoji: '😴',
        defaultMetric: 'hours',
        defaultUnit: 'hours',
        defaultGoal: 8,
        description: 'Quality rest',
    },
    {
        id: 'work',
        name: 'Work',
        emoji: '💼',
        defaultMetric: 'hours',
        defaultUnit: 'hours',
        defaultGoal: 8,
        description: 'Focus time',
    },
    {
        id: 'learning',
        name: 'Learning',
        emoji: '🎓',
        defaultMetric: 'minutes',
        defaultUnit: 'minutes',
        defaultGoal: 30,
        description: 'Study, Courses',
    },
    {
        id: 'health',
        name: 'Health',
        emoji: '❤️',
        defaultMetric: 'boolean',
        defaultUnit: 'times',
        defaultGoal: 1,
        description: 'Medicine, Vitamins',
    },
    {
        id: 'custom',
        name: 'Custom',
        emoji: '✨',
        defaultMetric: 'count',
        defaultUnit: 'times',
        defaultGoal: 1,
        description: 'Create your own',
    },
];

export const getCategoryById = (id: HabitCategory): CategoryConfig | undefined => {
    return categories.find(cat => cat.id === id);
};

export const metricLabels: Record<MetricType, string> = {
    steps: 'Steps',
    minutes: 'Minutes',
    hours: 'Hours',
    count: 'Count',
    boolean: 'Yes/No',
};

export const unitOptions: Record<MetricType, string[]> = {
    steps: ['steps'],
    minutes: ['minutes', 'mins'],
    hours: ['hours', 'hrs'],
    count: ['times', 'glasses', 'pills', 'pages', 'items'],
    boolean: ['times'],
};
