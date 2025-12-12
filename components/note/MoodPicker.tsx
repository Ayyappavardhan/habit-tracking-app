/**
 * Mood Picker Component
 * Horizontal emoji picker for selecting mood
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { MoodEmojis, MoodType } from '@/types/note';
import haptics from '@/utils/haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MoodPickerProps {
    selectedMood?: MoodType;
    onSelect: (mood: MoodType | undefined) => void;
}

const moods: { type: MoodType; label: string }[] = [
    { type: 'great', label: 'Great' },
    { type: 'good', label: 'Good' },
    { type: 'okay', label: 'Okay' },
    { type: 'bad', label: 'Bad' },
    { type: 'terrible', label: 'Awful' },
];

export default function MoodPicker({ selectedMood, onSelect }: MoodPickerProps) {
    const { colors } = useTheme();

    const handlePress = (mood: MoodType) => {
        // Trigger haptic selection feedback
        haptics.selection();

        // Toggle off if already selected
        if (selectedMood === mood) {
            onSelect(undefined);
        } else {
            onSelect(mood);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>How are you feeling?</Text>
            <View style={styles.moodRow}>
                {moods.map((mood) => (
                    <TouchableOpacity
                        key={mood.type}
                        style={[
                            styles.moodButton,
                            { backgroundColor: colors.card },
                            selectedMood === mood.type && { backgroundColor: colors.accent },
                        ]}
                        onPress={() => handlePress(mood.type)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.moodEmoji}>{MoodEmojis[mood.type]}</Text>
                        <Text style={[
                            styles.moodLabel,
                            { color: colors.textSecondary },
                            selectedMood === mood.type && { color: colors.background, fontWeight: '600' },
                        ]}>
                            {mood.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    moodButton: {
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        minWidth: 60,
    },
    moodEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 11,
    },
});

