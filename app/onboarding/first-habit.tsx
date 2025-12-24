/**
 * Onboarding - First Habit Screen
 * User creates their first habit.
 * Always uses dark theme for consistent onboarding experience.
 */

import { DEFAULT_ICON, PopularHabit, popularHabitIcons } from '@/constants/iconData';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useSettings } from '@/context/SettingsContext';
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

// Force dark theme colors for onboarding
const ONBOARDING_COLORS = {
    background: '#0D0D0D',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textMuted: '#636366',
    accent: '#FFD700',
    card: '#1C1C1E',
    cardBorder: '#2C2C2E',
};

export default function FirstHabitScreen() {
    const { addHabit } = useHabits();
    const { settings } = useSettings();
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
        <SafeAreaView style={[styles.container, { backgroundColor: ONBOARDING_COLORS.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={ONBOARDING_COLORS.text} weight="regular" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: ONBOARDING_COLORS.text }]}>
                            Start with one habit
                        </Text>
                        <Text style={[styles.subtitle, { color: ONBOARDING_COLORS.textSecondary }]}>
                            What's the main thing you want to work on?
                        </Text>

                        {/* Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: ONBOARDING_COLORS.textSecondary }]}>I want to...</Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: ONBOARDING_COLORS.card,
                                    color: ONBOARDING_COLORS.text,
                                    borderColor: ONBOARDING_COLORS.cardBorder
                                }]}
                                value={habitName}
                                onChangeText={(text) => {
                                    setHabitName(text);
                                    setSelectedSuggestion(null);
                                }}
                                placeholder="e.g., Drink more water"
                                placeholderTextColor={ONBOARDING_COLORS.textMuted}
                                maxLength={50}
                            />
                        </View>

                        {/* Suggestions */}
                        <Text style={[styles.sectionTitle, { color: ONBOARDING_COLORS.textSecondary }]}>
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
                                                backgroundColor: ONBOARDING_COLORS.card,
                                                borderColor: isSelected ? ONBOARDING_COLORS.accent : ONBOARDING_COLORS.cardBorder
                                            },
                                            isSelected && { backgroundColor: ONBOARDING_COLORS.accent + '10' }
                                        ]}
                                        onPress={() => handleSelectSuggestion(habit)}
                                    >
                                        <View style={[
                                            styles.suggestionIconContainer,
                                            { backgroundColor: 'rgba(255,255,255,0.08)' },
                                            isSelected && { backgroundColor: ONBOARDING_COLORS.accent + '20' }
                                        ]}>
                                            {renderIcon(habit.icon, 24, isSelected ? ONBOARDING_COLORS.accent : ONBOARDING_COLORS.textSecondary)}
                                        </View>
                                        <Text style={[
                                            styles.suggestionText,
                                            { color: ONBOARDING_COLORS.text },
                                            isSelected && { color: ONBOARDING_COLORS.accent, fontWeight: '600' }
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
                            { backgroundColor: ONBOARDING_COLORS.accent },
                            !habitName.trim() && { opacity: 0.5 }
                        ]}
                        onPress={handleStartTracking}
                        disabled={!habitName.trim()}
                    >
                        <Text style={[styles.buttonText, { color: ONBOARDING_COLORS.background }]}>
                            Start Tracking
                        </Text>
                        <CheckCircle size={20} color={ONBOARDING_COLORS.background} weight="fill" />
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
