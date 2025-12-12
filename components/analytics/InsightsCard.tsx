/**
 * InsightsCard Component
 * Dynamic personalized insights based on user data
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Insight {
    icon: string;
    title: string;
    description: string;
    type: 'success' | 'tip' | 'warning' | 'info';
}

interface InsightsCardProps {
    insights: Insight[];
}

// Map insight types to Ionicons
const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    success: 'checkmark-circle',
    tip: 'bulb',
    warning: 'warning',
    info: 'information-circle',
};

export default function InsightsCard({ insights }: InsightsCardProps) {
    const { colors, isDark } = useTheme();

    if (insights.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <Ionicons name="sparkles" size={20} color={colors.accent} />
                <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
            </View>

            <View style={styles.insightsList}>
                {insights.map((insight, index) => {
                    const iconName = TYPE_ICONS[insight.type] || 'information-circle';
                    const isSuccess = insight.type === 'success';
                    const isWarning = insight.type === 'warning';
                    const iconColor = isSuccess
                        ? colors.success
                        : isWarning
                            ? (isDark ? '#FFB800' : '#FF9500')
                            : colors.accent;

                    return (
                        <View key={index}>
                            {index > 0 && (
                                <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
                            )}
                            <View style={styles.insightItem}>
                                <View style={[styles.iconWrapper, { backgroundColor: iconColor + '15' }]}>
                                    <Ionicons name={iconName} size={18} color={iconColor} />
                                </View>
                                <View style={styles.insightContent}>
                                    <Text style={[styles.insightTitle, { color: colors.text }]}>
                                        {insight.title}
                                    </Text>
                                    <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
                                        {insight.description}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    insightsList: {
        gap: 0,
    },
    divider: {
        height: 1,
        marginVertical: Spacing.md,
        opacity: 0.5,
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    insightDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
});

