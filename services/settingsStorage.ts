/**
 * Settings Storage Service
 * Handles persistence of app settings using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'habit_app_settings';

export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
    userName: string;
    userAvatar: string;
    globalNotificationsEnabled: boolean;
    defaultNotificationTime: string; // HH:MM format
    weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
    theme: ThemeMode;
    hasCompletedOnboarding: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
    userName: '',
    userAvatar: '😊',
    globalNotificationsEnabled: true,
    defaultNotificationTime: '09:00',
    weekStartDay: 1, // Monday
    theme: 'dark',
    hasCompletedOnboarding: false,
};

/**
 * Load settings from AsyncStorage
 */
export async function loadSettings(): Promise<AppSettings> {
    try {
        const json = await AsyncStorage.getItem(SETTINGS_KEY);
        if (json) {
            const stored = JSON.parse(json);
            // Merge with defaults to handle new settings fields
            // TEST ONLY: Force onboarding on every reload as requested
            return { ...DEFAULT_SETTINGS, ...stored, hasCompletedOnboarding: false };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save settings to AsyncStorage
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

/**
 * Update partial settings
 */
export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await loadSettings();
    const updated = { ...current, ...updates };
    await saveSettings(updated);
    return updated;
}

/**
 * Reset all settings to defaults
 */
export async function resetSettings(): Promise<void> {
    try {
        await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
        console.error('Error resetting settings:', error);
    }
}
