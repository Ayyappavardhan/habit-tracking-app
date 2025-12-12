/**
 * Settings Context
 * Global state management for app settings with AsyncStorage persistence
 */

import {
    AppSettings,
    DEFAULT_SETTINGS,
    loadSettings,
    resetSettings as resetStoredSettings,
    saveSettings,
} from '@/services/settingsStorage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

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

    // Load settings on mount
    useEffect(() => {
        async function load() {
            const stored = await loadSettings();
            setSettings(stored);
            setLoading(false);
        }
        load();
    }, []);

    const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        await saveSettings(newSettings);
    }, [settings]);

    const resetAllSettings = useCallback(async () => {
        await resetStoredSettings();
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
