/**
 * Habit Storage Service
 * AsyncStorage helpers for persisting habits
 */

import { Habit } from '@/types/habit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_STORAGE_KEY = '@habits';

/**
 * Get all habits from storage
 */
export const getAllHabits = async (): Promise<Habit[]> => {
    try {
        const data = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting habits:', error);
        return [];
    }
};

/**
 * Save all habits to storage
 */
export const saveAllHabits = async (habits: Habit[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    } catch (error) {
        console.error('Error saving habits:', error);
        throw error;
    }
};

/**
 * Add a new habit to storage
 */
export const addHabit = async (habit: Habit): Promise<void> => {
    const habits = await getAllHabits();
    habits.push(habit);
    await saveAllHabits(habits);
};

/**
 * Update a habit in storage
 */
export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<void> => {
    const habits = await getAllHabits();
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
        habits[index] = { ...habits[index], ...updates };
        await saveAllHabits(habits);
    }
};

/**
 * Delete a habit from storage
 */
export const deleteHabit = async (id: string): Promise<void> => {
    const habits = await getAllHabits();
    const filtered = habits.filter(h => h.id !== id);
    await saveAllHabits(filtered);
};

/**
 * Get a specific habit by ID
 */
export const getHabitById = async (id: string): Promise<Habit | null> => {
    const habits = await getAllHabits();
    return habits.find(h => h.id === id) || null;
};

/**
 * Clear all habits from storage
 */
export const clearAllHabits = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(HABITS_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing habits:', error);
        throw error;
    }
};

