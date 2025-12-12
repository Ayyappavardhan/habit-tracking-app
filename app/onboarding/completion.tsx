/**
 * Onboarding - Completion Screen
 * Celebrates setup completion and transitions to the main app.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Medal, Rocket, Star } from 'phosphor-react-native';
import React, { useRef } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompletionScreen() {
    const { colors } = useTheme();
    const { updateSettings } = useSettings();
    const confettiRef = useRef<ConfettiCannon>(null);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const handleComplete = async () => {
        // Mark onboarding as fully complete
        await updateSettings({ hasCompletedOnboarding: true });

        // Navigate to the main app
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ConfettiCannon
                count={200}
                origin={{ x: windowWidth / 2, y: windowHeight }}
                autoStart={true}
                fadeOut={true}
                explosionSpeed={350}
                fallSpeed={3000}
            />

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <Medal size={80} color={colors.accent} weight="fill" />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    You're All Set!
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your profile is ready and your first habit is set up. {"\n"}
                    It's time to start your journey.
                </Text>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Star size={32} color="#FFD700" weight="fill" />
                    <Text style={[styles.cardText, { color: colors.text }]}>
                        "Small daily improvements are the key to staggering long-term results."
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={handleComplete}
                >
                    <Text style={[styles.buttonText, { color: colors.background }]}>
                        Let's Go!
                    </Text>
                    <Rocket size={20} color={colors.background} weight="regular" />
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
        width: 140,
        height: 140,
        borderRadius: BorderRadius.full,
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
    card: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
        gap: Spacing.md,
    },
    cardText: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 22,
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
