/**
 * Onboarding - First Habit Screen
 * User creates their first habit.
 */

import { DEFAULT_ICON, PopularHabit, popularHabitIcons } from '@/constants/iconData';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import * as PhosphorIcons from 'phosphor-react-native';
import { ArrowLeft, CheckCircle } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use popular habits from iconData
const POPULAR_HABITS = popularHabitIcons.slice(0, 6);

export default function FirstHabitScreen() {
    const { addHabit } = useHabits();
    const { settings } = useSettings();
    const { colors, isDark } = useTheme();
    const [habitName, setHabitName] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
    const [selectedHabit, setSelectedHabit] = useState<PopularHabit | null>(null);

    // Helper to render Phosphor icon dynamically
    const renderIcon = (iconName: string, size: number, color: string) => {
        const IconComponent = (PhosphorIcons as any)[iconName];
        if (IconComponent) {
            return <IconComponent size={size} color={color} weight="regular" />;
        }
        return <PhosphorIcons.Star size={size} color={color} weight="regular" />;
    };

    const handleSelectSuggestion = (habit: PopularHabit) => {
        setHabitName(habit.name);
        setSelectedSuggestion(habit.name);
        setSelectedHabit(habit);
    };

    const handleStartTracking = async () => {
        if (!habitName.trim()) return;

        // Use selected habit data or defaults for custom habits
        const habitData = selectedHabit || {
            name: habitName,
            icon: DEFAULT_ICON,
            goal: 1,
            unit: 'times',
            category: 'custom'
        };

        // Add the habit with appropriate properties
        await addHabit({
            name: habitName,
            category: habitData.category as any,
            icon: habitData.icon,
            metricType: habitData.goal > 1 ? 'count' : 'boolean',
            goal: habitData.goal,
            unit: habitData.unit,
            frequency: 'daily',
            daysPerWeek: 7,
            notificationEnabled: settings.globalNotificationsEnabled,
            notificationTime: settings.defaultNotificationTime,
        });

        // Navigate to completion screen
        router.push('/onboarding/completion');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={colors.text} weight="regular" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Start with one habit
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            What's the main thing you want to work on?
                        </Text>

                        {/* Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>I want to...</Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: colors.card,
                                    color: colors.text,
                                    borderColor: colors.cardBorder
                                }]}
                                value={habitName}
                                onChangeText={(text) => {
                                    setHabitName(text);
                                    setSelectedSuggestion(null);
                                }}
                                placeholder="e.g., Drink more water"
                                placeholderTextColor={colors.textMuted}
                                maxLength={50}
                            />
                        </View>

                        {/* Suggestions */}
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                            Suggestions
                        </Text>
                        <View style={styles.suggestionsGrid}>
                            {POPULAR_HABITS.map((habit) => {
                                const isSelected = selectedSuggestion === habit.name;
                                return (
                                    <TouchableOpacity
                                        key={habit.name}
                                        style={[
                                            styles.suggestionCard,
                                            {
                                                backgroundColor: colors.card,
                                                borderColor: isSelected ? colors.accent : colors.cardBorder
                                            },
                                            isSelected && { backgroundColor: colors.accent + '10' }
                                        ]}
                                        onPress={() => handleSelectSuggestion(habit)}
                                    >
                                        <View style={[
                                            styles.suggestionIconContainer,
                                            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                                            isSelected && { backgroundColor: colors.accent + '20' }
                                        ]}>
                                            {renderIcon(habit.icon, 24, isSelected ? colors.accent : colors.textSecondary)}
                                        </View>
                                        <Text style={[
                                            styles.suggestionText,
                                            { color: colors.text },
                                            isSelected && { color: colors.accent, fontWeight: '600' }
                                        ]}>
                                            {habit.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: colors.accent },
                            !habitName.trim() && { opacity: 0.5 }
                        ]}
                        onPress={handleStartTracking}
                        disabled={!habitName.trim()}
                    >
                        <Text style={[styles.buttonText, { color: colors.background }]}>
                            Start Tracking
                        </Text>
                        <CheckCircle size={20} color={colors.background} weight="fill" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
    },
    backButton: {
        padding: Spacing.xs,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        width: '100%',
        gap: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: Spacing.xs,
    },
    textInput: {
        width: '100%',
        height: 56,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.md,
        marginLeft: Spacing.xs,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    suggestionCard: {
        width: '47%',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    suggestionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionText: {
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        padding: Spacing.xl,
    },
    button: {
        flexDirection: 'row',
        height: 56,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
    },
});
