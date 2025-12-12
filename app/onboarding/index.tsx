/**
 * Onboarding - Welcome Screen
 * First screen users see. Focuses on value proposition.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name="flash" size={64} color={colors.accent} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Build Better Habits
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Track your progress, stay consistent, and reach your goals with a simple, privacy-focused habit tracker.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/onboarding/features')}
                >
                    <Text style={[styles.buttonText, { color: colors.background }]}>
                        Get Started
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
