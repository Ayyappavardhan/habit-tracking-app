/**
 * Onboarding - Features Screen
 * Highlights streaks and progress tracking.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, ChartLineUp, Flame, TrendUp } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeaturesScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} weight="regular" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <TrendUp size={64} color={colors.accent} weight="regular" />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Building Habits
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Consistency is key. Track your daily streaks, visualize your progress, and stay motivated to reach your goals.
                </Text>

                <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                        <Flame size={24} color="#FF9500" weight="fill" />
                        <Text style={[styles.featureText, { color: colors.text }]}>Track streaks</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <ChartLineUp size={24} color="#34C759" weight="regular" />
                        <Text style={[styles.featureText, { color: colors.text }]}>View analytics</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/onboarding/privacy')}
                >
                    <Text style={[styles.buttonText, { color: colors.background }]}>
                        Next
                    </Text>
                    <ArrowRight size={20} color={colors.background} weight="regular" />
                </TouchableOpacity>
            </View>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.xl * 2,
    },
    featureList: {
        gap: Spacing.md,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    featureText: {
        fontSize: 18,
        fontWeight: '500',
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
