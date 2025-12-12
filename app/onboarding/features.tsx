/**
 * Onboarding - Features Screen
 * Highlights streaks and progress tracking.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeaturesScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name="trending-up" size={64} color={colors.accent} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Building Habits
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Consistency is key. Track your daily streaks, visualize your progress, and stay motivated to reach your goals.
                </Text>

                <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                        <Ionicons name="flame" size={24} color="#FF9500" />
                        <Text style={[styles.featureText, { color: colors.text }]}>Track streaks</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="stats-chart" size={24} color="#34C759" />
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
                    <Ionicons name="arrow-forward" size={20} color={colors.background} />
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
