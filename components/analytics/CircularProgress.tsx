/**
 * CircularProgress Component
 * Animated circular progress ring for completion rate display
 */

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    trendMessage?: string;
}

export default function CircularProgress({
    percentage,
    size = 80,
    strokeWidth = 8,
    trendMessage,
}: CircularProgressProps) {
    const { colors } = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.leftContent}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>COMPLETION RATE</Text>
                <View style={styles.percentageRow}>
                    <Text style={[styles.percentageValue, { color: colors.text }]}>{percentage}</Text>
                    <Text style={[styles.percentageSymbol, { color: colors.text }]}>%</Text>
                </View>
                {trendMessage && (
                    <Text style={[styles.trendMessage, { color: colors.textSecondary }]}>{trendMessage}</Text>
                )}
            </View>
            <View style={styles.ringContainer}>
                <Svg width={size} height={size}>
                    {/* Background circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.cardBorder}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.accent}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View style={[styles.iconContainer, { width: size, height: size, transform: [{ rotate: '45deg' }] }]}>
                    <Ionicons name="arrow-up" size={32} color={colors.accent} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 16,
        padding: Spacing.lg,
    },
    leftContent: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: Spacing.xs,
    },
    percentageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    percentageValue: {
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 56,
    },
    percentageSymbol: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 2,
    },
    trendMessage: {
        fontSize: 14,
        marginTop: Spacing.xs,
        lineHeight: 20,
    },
    ringContainer: {
        position: 'relative',
    },
    iconContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendIcon: {
        fontSize: 24,
    },
});
