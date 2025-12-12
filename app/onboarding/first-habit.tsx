/**
 * Onboarding - First Habit Screen
 * User creates their first habit.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

const POPULAR_HABITS = [
    { name: 'Drink Water', emoji: '💧' },
    { name: 'Read Books', emoji: '📚' },
    { name: 'Exercise', emoji: '💪' },
    { name: 'Meditate', emoji: '🧘' },
    { name: 'Wake Up Early', emoji: '🌅' },
    { name: 'Walk', emoji: '🚶' },
];

export default function FirstHabitScreen() {
    const { addHabit } = useHabits();
    const { updateSettings } = useSettings();
    const { colors } = useTheme();
    const [habitName, setHabitName] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

    const handleSelectSuggestion = (name: string, emoji: string) => {
        setHabitName(name);
        setSelectedSuggestion(name);
    };

    const handleStartTracking = async () => {
        if (!habitName.trim()) return;

        // Find emoji if suggested, otherwise default
        const suggestion = POPULAR_HABITS.find(h => h.name === habitName);
        const emoji = suggestion ? suggestion.emoji : '🎯'; // Default target emoji

        // Add the habit with correct Habit interface properties
        await addHabit({
            name: habitName,
            category: 'health', // Default category
            icon: emoji, // Use the selected emoji or default
            metricType: 'boolean', // Simple completion by default
            goal: 1,
            unit: 'times',
            frequency: 'daily', // Default frequency
            daysPerWeek: 7,
            notificationEnabled: false,
            notificationTime: undefined,
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
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
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
                            {POPULAR_HABITS.map((habit) => (
                                <TouchableOpacity
                                    key={habit.name}
                                    style={[
                                        styles.suggestionCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: selectedSuggestion === habit.name ? colors.accent : colors.cardBorder
                                        },
                                        selectedSuggestion === habit.name && { backgroundColor: colors.accent + '10' }
                                    ]}
                                    onPress={() => handleSelectSuggestion(habit.name, habit.emoji)}
                                >
                                    <Text style={styles.suggestionEmoji}>{habit.emoji}</Text>
                                    <Text style={[
                                        styles.suggestionText,
                                        { color: colors.text },
                                        selectedSuggestion === habit.name && { color: colors.accent, fontWeight: '600' }
                                    ]}>
                                        {habit.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
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
                        <Ionicons name="checkmark-circle" size={20} color={colors.background} />
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
        width: '47%', // roughly half width with gap
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    suggestionEmoji: {
        fontSize: 32,
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
