/**
 * Theme Context
 * Provides dynamic theme colors based on user settings
 */

import { getColors, ThemeMode } from '@/constants/theme';
import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from './SettingsContext';

// Color type based on getColors return
type ThemeColors = ReturnType<typeof getColors>;

interface ThemeContextType {
    colors: ThemeColors;
    theme: ThemeMode;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { settings } = useSettings();

    const value = useMemo(() => ({
        colors: getColors(settings.theme),
        theme: settings.theme,
        isDark: settings.theme === 'dark',
    }), [settings.theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
