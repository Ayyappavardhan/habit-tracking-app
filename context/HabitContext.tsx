/**
 * Habit Context
 * Global state management for habits with AsyncStorage persistence
 */

import * as habitStorage from '@/services/habitStorage';
import {
    cancelNotification,
    checkNotificationLimitWarning,
    rescheduleAllHabitNotifications,
    scheduleHabitReminder
} from '@/services/notifications';
import { Habit } from '@/types/habit';
import { getTodayLocal } from '@/utils/dateUtils';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface HabitContextType {
    habits: Habit[];
    loading: boolean;
    addHabit: (habit: Omit<Habit, 'id' | 'completedDays' | 'percentComplete' | 'totalProgress' | 'completedDates' | 'createdAt'>) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    markHabitDone: (id: string) => void;
    recordProgress: (id: string, dateString: string, value: number) => void;
    toggleDateCompletion: (id: string, dateString: string) => void;
    getHabitById: (id: string) => Habit | undefined;
    refreshHabits: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    // Load habits from storage on mount
    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        setLoading(true);
        try {
            const storedHabits = await habitStorage.getAllHabits();

            // Perform migration/normalization for malformed habits (e.g. from legacy structure)
            const normalizedHabits = storedHabits.map((h: any) => {
                let updated = { ...h };
                let modified = false;

                // Fix missing top-level fields if they are nested in 'target'
                if (h.target && typeof h.target === 'object') {
                    if (updated.goal === undefined && h.target.value !== undefined) {
                        updated.goal = h.target.value;
                        modified = true;
                    }
                    if (updated.unit === undefined && h.target.unit !== undefined) {
                        updated.unit = h.target.unit;
                        modified = true;
                    }
                    if (updated.metricType === undefined && h.target.type !== undefined) {
                        updated.metricType = h.target.type === 'count' ? 'count' : 'boolean';
                        modified = true;
                    }
                    // Clean up target
                    delete updated.target;
                    modified = true;
                }

                // Default missing fields
                if (updated.goal === undefined) { updated.goal = 1; modified = true; }
                if (!updated.unit) { updated.unit = 'times'; modified = true; }
                if (!updated.metricType) { updated.metricType = 'boolean'; modified = true; }
                if (!updated.frequency) { updated.frequency = 'daily'; modified = true; }

                if (modified) {
                    console.log(`Migrated habit ${updated.id} to new structure`);
                }
                return updated as Habit;
            });

            setHabits(normalizedHabits);

            // Save normalized habits if any were modified
            // This is a rough check, ideally we'd track dirty state better
            if (JSON.stringify(normalizedHabits) !== JSON.stringify(storedHabits)) {
                habitStorage.saveAllHabits(normalizedHabits);
            }

            // Re-schedule all notifications on app launch to ensure they persist
            if (normalizedHabits.length > 0) {
                const notificationMap = await rescheduleAllHabitNotifications(normalizedHabits);

                // Update habits with new notification IDs if they changed
                if (notificationMap.size > 0) {
                    const updatedHabits = normalizedHabits.map(habit => {
                        const newNotificationId = notificationMap.get(habit.id);
                        if (newNotificationId && newNotificationId !== habit.notificationId) {
                            return { ...habit, notificationId: newNotificationId };
                        }
                        return habit;
                    });
                    setHabits(updatedHabits);
                    habitStorage.saveAllHabits(updatedHabits);
                }
            }
        } catch (error) {
            console.error('Error loading habits:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshHabits = async () => {
        await loadHabits();
    };

    const addHabit = useCallback(async (
        habitData: Omit<Habit, 'id' | 'completedDays' | 'percentComplete' | 'totalProgress' | 'completedDates' | 'createdAt'>
    ) => {
        const id = Date.now().toString();

        let notificationId: string | undefined;
        if (habitData.notificationEnabled && habitData.notificationTime) {
            // Check iOS notification limit before scheduling
            const canSchedule = await checkNotificationLimitWarning();
            if (canSchedule) {
                const result = await scheduleHabitReminder(
                    id,
                    habitData.name,
                    habitData.icon,
                    habitData.notificationTime,
                    habitData.frequency
                );
                if (result) notificationId = result;
            }
        }

        const newHabit: Habit = {
            ...habitData,
            id,
            completedDays: 0,
            percentComplete: 0,
            totalProgress: 0,
            completedDates: {},
            createdAt: new Date().toISOString(),
            notificationId,
        };

        // Update state
        setHabits(prev => {
            const updated = [...prev, newHabit];
            // Persist to storage
            habitStorage.saveAllHabits(updated);
            return updated;
        });
    }, []);

    const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
        const currentHabit = habits.find(h => h.id === id);
        if (!currentHabit) return;

        // Check if notification settings are changing
        const notificationTimeChanged = updates.notificationTime !== undefined &&
            updates.notificationTime !== currentHabit.notificationTime;
        const notificationEnabledChanged = updates.notificationEnabled !== undefined &&
            updates.notificationEnabled !== currentHabit.notificationEnabled;

        let newNotificationId = currentHabit.notificationId;

        if (notificationTimeChanged || notificationEnabledChanged) {
            // Cancel old notification if exists
            if (currentHabit.notificationId) {
                await cancelNotification(currentHabit.notificationId);
                newNotificationId = undefined;
            }

            // Schedule new notification if enabled
            const willBeEnabled = updates.notificationEnabled ?? currentHabit.notificationEnabled;
            const newTime = updates.notificationTime ?? currentHabit.notificationTime;

            if (willBeEnabled && newTime) {
                const canSchedule = await checkNotificationLimitWarning();
                if (canSchedule) {
                    const result = await scheduleHabitReminder(
                        id,
                        updates.name ?? currentHabit.name,
                        updates.icon ?? currentHabit.icon,
                        newTime,
                        updates.frequency ?? currentHabit.frequency
                    );
                    if (result) newNotificationId = result;
                }
            }
        }

        setHabits(prev => {
            const updated = prev.map(habit =>
                habit.id === id ? { ...habit, ...updates, notificationId: newNotificationId } : habit
            );
            // Persist to storage
            habitStorage.saveAllHabits(updated);
            return updated;
        });
    }, [habits]);

    const deleteHabit = useCallback(async (id: string) => {
        const habit = habits.find(h => h.id === id);
        if (habit?.notificationId) {
            await cancelNotification(habit.notificationId);
        }
        setHabits(prev => {
            const updated = prev.filter(habit => habit.id !== id);
            // Persist to storage
            habitStorage.saveAllHabits(updated);
            return updated;
        });
    }, [habits]);

    const markHabitDone = useCallback((id: string) => {
        const today = getTodayLocal();
        const habit = habits.find(h => h.id === id);
        if (habit) {
            // For boolean type, just toggle. For metrics, use goal value as default
            const value = habit.metricType === 'boolean' ? 1 : habit.goal;
            recordProgress(id, today, habit.completedDates[today] ? 0 : value);
        }
    }, [habits]);

    // Record progress for a specific date with a value
    const recordProgress = useCallback((id: string, dateString: string, value: number) => {
        // Don't allow future dates
        const today = getTodayLocal();
        if (dateString > today) {
            console.log('Cannot record progress for future dates');
            return;
        }

        setHabits(prev => {
            const updated = prev.map(habit => {
                if (habit.id !== id) return habit;

                const newCompletedDates = { ...habit.completedDates };
                const previousValue = newCompletedDates[dateString] || 0;

                if (value <= 0) {
                    // Remove the entry if value is 0 or negative
                    delete newCompletedDates[dateString];
                } else {
                    newCompletedDates[dateString] = value;
                }

                // SIMPLE CALCULATION:
                // Total Progress = Goal × Completed Days
                // Percent Complete = Completed Days / 365 (yearly progress)
                const newCompletedDays = Object.keys(newCompletedDates).length;
                const newTotalProgress = habit.goal * newCompletedDays;
                const newPercentComplete = Math.round((newCompletedDays / 365) * 100);

                return {
                    ...habit,
                    completedDates: newCompletedDates,
                    completedDays: newCompletedDays,
                    totalProgress: newTotalProgress,
                    percentComplete: Math.min(100, newPercentComplete),
                };
            });
            // Persist to storage
            habitStorage.saveAllHabits(updated);
            return updated;
        });
    }, []);

    const toggleDateCompletion = useCallback((id: string, dateString: string) => {
        // Don't allow future dates
        const today = getTodayLocal();
        if (dateString > today) {
            console.log('Cannot mark future dates as complete');
            return;
        }

        setHabits(prev => {
            const updated = prev.map(habit => {
                if (habit.id !== id) return habit;

                const isAlreadyCompleted = habit.completedDates[dateString] > 0;
                const newCompletedDates = { ...habit.completedDates };

                if (isAlreadyCompleted) {
                    delete newCompletedDates[dateString];
                } else {
                    // Use goal as default value when toggling on
                    newCompletedDates[dateString] = habit.goal;
                }

                // SIMPLE CALCULATION:
                // Total Progress = Goal × Completed Days
                // Percent Complete = Completed Days / 365 (yearly progress)
                const newCompletedDays = Object.keys(newCompletedDates).length;
                const newTotalProgress = habit.goal * newCompletedDays;
                const newPercentComplete = Math.round((newCompletedDays / 365) * 100);

                return {
                    ...habit,
                    completedDates: newCompletedDates,
                    completedDays: newCompletedDays,
                    totalProgress: newTotalProgress,
                    percentComplete: Math.min(100, newPercentComplete),
                };
            });
            // Persist to storage
            habitStorage.saveAllHabits(updated);
            return updated;
        });
    }, []);

    const getHabitById = useCallback((id: string) => {
        return habits.find(h => h.id === id);
    }, [habits]);

    return (
        <HabitContext.Provider value={{
            habits,
            loading,
            addHabit,
            updateHabit,
            deleteHabit,
            markHabitDone,
            recordProgress,
            toggleDateCompletion,
            getHabitById,
            refreshHabits,
        }}>
            {children}
        </HabitContext.Provider>
    );
}

export function useHabits() {
    const context = useContext(HabitContext);
    if (!context) {
        throw new Error('useHabits must be used within a HabitProvider');
    }
    return context;
}
