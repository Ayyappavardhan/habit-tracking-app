/**
 * Frequency Selector Component
 * Segmented control for Daily/Weekly/Monthly
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { FrequencyType } from '@/types/habit';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FrequencySelectorProps {
    selectedFrequency: FrequencyType;
    onSelect: (frequency: FrequencyType) => void;
}

const frequencies: { value: FrequencyType; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

export default function FrequencySelector({ selectedFrequency, onSelect }: FrequencySelectorProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>Frequency</Text>
            <View style={[styles.segmentedControl, { backgroundColor: colors.card }]}>
                {frequencies.map((freq) => (
                    <TouchableOpacity
                        key={freq.value}
                        style={[
                            styles.segment,
                            selectedFrequency === freq.value && { backgroundColor: colors.accent },
                        ]}
                        onPress={() => onSelect(freq.value)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                { color: colors.textSecondary },
                                selectedFrequency === freq.value && { color: colors.background, fontWeight: '600' },
                            ]}
                        >
                            {freq.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: BorderRadius.md,
        padding: Spacing.xs,
    },
    segment: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: BorderRadius.sm,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
