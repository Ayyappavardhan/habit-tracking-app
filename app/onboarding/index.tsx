/**
 * Onboarding - Welcome Screen
 * First screen users see. Focuses on value proposition.
 * Always uses dark theme for consistent image blending.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { ArrowRight } from 'phosphor-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.75;

// Force dark theme colors for onboarding (images have dark backgrounds)
const ONBOARDING_COLORS = {
    background: '#0D0D0D',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    accent: '#FFD700',
};

export default function WelcomeScreen() {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: ONBOARDING_COLORS.background }]}>
            <View style={styles.content}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('@/assets/images/onboarding/onboarding-welcome.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.title, { color: ONBOARDING_COLORS.text }]}>
                    Build Better Habits
                </Text>

                <Text style={[styles.subtitle, { color: ONBOARDING_COLORS.textSecondary }]}>
                    Track your progress, stay consistent, and reach your goals with a simple, privacy-focused habit tracker.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: ONBOARDING_COLORS.accent }]}
                    onPress={() => router.push('/onboarding/pain-point')}
                >
                    <Text style={[styles.buttonText, { color: ONBOARDING_COLORS.background }]}>
                        Get Started
                    </Text>
                    <ArrowRight size={20} color={ONBOARDING_COLORS.background} weight="regular" />
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
    imageWrapper: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        marginBottom: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
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
