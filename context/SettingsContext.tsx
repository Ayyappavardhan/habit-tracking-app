/**
 * Settings Context
 * Global state management for app settings with AsyncStorage persistence
 */

import {
    cancelAppDailyReminder,
    scheduleAppDailyReminder
} from '@/services/notifications';
import {
    AppSettings,
    DEFAULT_SETTINGS,
    loadSettings,
    resetSettings as resetStoredSettings,
    saveSettings,
} from '@/services/settingsStorage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface SettingsContextType {
    settings: AppSettings;
    loading: boolean;
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
    resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const isInitialLoad = useRef(true);

    // Load settings on mount and schedule app reminder if enabled
    useEffect(() => {
        async function load() {
            const stored = await loadSettings();
            setSettings(stored);

            // Schedule or cancel app daily reminder based on loaded settings
            if (stored.globalNotificationsEnabled) {
                await scheduleAppDailyReminder(stored.defaultNotificationTime);
            } else {
                await cancelAppDailyReminder();
            }

            setLoading(false);
            isInitialLoad.current = false;
        }
        load();
    }, []);

    const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        await saveSettings(newSettings);

        // Handle app daily reminder scheduling when notification settings change
        const notificationToggleChanged = updates.globalNotificationsEnabled !== undefined;
        const notificationTimeChanged = updates.defaultNotificationTime !== undefined;

        if (notificationToggleChanged || notificationTimeChanged) {
            if (newSettings.globalNotificationsEnabled) {
                // Schedule (or reschedule) the app daily reminder
                await scheduleAppDailyReminder(newSettings.defaultNotificationTime);
            } else {
                // Cancel the app daily reminder
                await cancelAppDailyReminder();
            }
        }
    }, [settings]);

    const resetAllSettings = useCallback(async () => {
        await resetStoredSettings();
        await cancelAppDailyReminder();
        setSettings(DEFAULT_SETTINGS);
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                loading,
                updateSettings,
                resetSettings: resetAllSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
