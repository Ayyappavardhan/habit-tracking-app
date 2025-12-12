/**
 * Header Component
 * Displays app icon, date, and action icons
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import the app icon
const appIcon = require('../../assets/images/icon.png');

interface HeaderProps {
    date?: string;
    onCalendarPress?: () => void;
    onSettingsPress?: () => void;
}

export default function Header({
    date,
    onCalendarPress,
    onSettingsPress,
}: HeaderProps) {
    const { colors } = useTheme();

    const today = date || new Date().toLocaleDateString('en-US', {
        weekday: undefined,
        month: 'short',
        day: 'numeric'
    });

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={[styles.appIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                    <Image
                        source={appIcon}
                        style={styles.appIcon}
                        contentFit="cover"
                    />
                </View>
                <Text style={[styles.dateText, { color: colors.text }]}>Today, {today}</Text>
            </View>

            <View style={styles.rightSection}>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={onCalendarPress}
                >
                    <Ionicons name="calendar-outline" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={onSettingsPress}
                >
                    <Ionicons name="settings-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    appIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    appIcon: {
        width: 48,
        height: 48,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
