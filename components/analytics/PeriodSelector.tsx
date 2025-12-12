/**
 * PeriodSelector Component
 * Tab selector for Week/Month/Year time periods
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { PeriodType } from '@/utils/analyticsUtils';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PeriodSelectorProps {
    selectedPeriod: PeriodType;
    onSelect: (period: PeriodType) => void;
}

const periods: { key: PeriodType; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
];

export default function PeriodSelector({ selectedPeriod, onSelect }: PeriodSelectorProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            {periods.map(({ key, label }) => {
                const isSelected = selectedPeriod === key;
                return (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.tab,
                            isSelected && { backgroundColor: colors.accent },
                        ]}
                        onPress={() => onSelect(key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: colors.textSecondary },
                            isSelected && { color: colors.background },
                        ]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: BorderRadius.full,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
