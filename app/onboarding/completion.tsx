/**
 * Onboarding - Completion Screen
 * Celebrates setup completion and transitions to the main app.
 * Always uses dark theme for consistent image blending.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { router } from 'expo-router';
import { Rocket, Star } from 'phosphor-react-native';
import React, { useRef } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.65;

// Force dark theme colors for onboarding (images have dark backgrounds)
const ONBOARDING_COLORS = {
    background: '#0D0D0D',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    accent: '#FFD700',
    card: '#1C1C1E',
    cardBorder: '#2C2C2E',
};

export default function CompletionScreen() {
    const { updateSettings } = useSettings();
    const confettiRef = useRef<ConfettiCannon>(null);

    const handleComplete = async () => {
        // Mark onboarding as fully complete
        await updateSettings({ hasCompletedOnboarding: true });

        // Navigate to the main app
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: ONBOARDING_COLORS.background }]}>
            <View style={styles.content}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('@/assets/images/onboarding/onboarding-completion.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.title, { color: ONBOARDING_COLORS.text }]}>
                    You're All Set!
                </Text>

                <Text style={[styles.subtitle, { color: ONBOARDING_COLORS.textSecondary }]}>
                    Your profile is ready and your first habit is set up. {"\n"}
                    It's time to start your journey.
                </Text>

                <View style={[styles.card, { backgroundColor: ONBOARDING_COLORS.card, borderColor: ONBOARDING_COLORS.cardBorder }]}>
                    <Star size={28} color="#FFD700" weight="fill" />
                    <Text style={[styles.cardText, { color: ONBOARDING_COLORS.text }]}>
                        "Small daily improvements are the key to staggering long-term results."
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: ONBOARDING_COLORS.accent }]}
                    onPress={handleComplete}
                >
                    <Text style={[styles.buttonText, { color: ONBOARDING_COLORS.background }]}>
                        Let's Go!
                    </Text>
                    <Rocket size={20} color={ONBOARDING_COLORS.background} weight="fill" />
                </TouchableOpacity>
            </View>

            {/* Confetti rendered LAST so it appears on TOP of everything */}
            <ConfettiCannon
                count={200}
                origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
                autoStart={true}
                fadeOut={true}
                explosionSpeed={350}
                fallSpeed={3000}
            />
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
        marginBottom: Spacing.xl,
    },
    card: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    cardText: {
        flex: 1,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'left',
        lineHeight: 20,
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
