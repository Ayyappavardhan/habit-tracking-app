/**
 * Onboarding - Privacy Screen
 * Emphasizes no data collection and local storage.
 * Always uses dark theme for consistent image blending.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, DeviceMobile, UserMinus } from 'phosphor-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.6;

// Force dark theme colors for onboarding (images have dark backgrounds)
const ONBOARDING_COLORS = {
    background: '#0D0D0D',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textMuted: '#636366',
    accent: '#FFD700',
    card: '#1C1C1E',
    cardBorder: '#2C2C2E',
};

export default function PrivacyScreen() {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: ONBOARDING_COLORS.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={ONBOARDING_COLORS.text} weight="regular" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('@/assets/images/onboarding/onboarding-privacy.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.title, { color: ONBOARDING_COLORS.text }]}>
                    Privacy First
                </Text>

                <Text style={[styles.subtitle, { color: ONBOARDING_COLORS.textSecondary }]}>
                    Your data stays on your device. No sign-up, no cloud syncing, and absolutely no tracking.
                </Text>

                <View style={[styles.infoCard, { backgroundColor: ONBOARDING_COLORS.card, borderColor: ONBOARDING_COLORS.cardBorder }]}>
                    <View style={styles.infoItem}>
                        <DeviceMobile size={24} color={ONBOARDING_COLORS.accent} weight="fill" />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoTitle, { color: ONBOARDING_COLORS.text }]}>Local Storage Only</Text>
                            <Text style={[styles.infoDesc, { color: ONBOARDING_COLORS.textMuted }]}>
                                All habits and progress are stored locally on your phone.
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: ONBOARDING_COLORS.cardBorder }]} />

                    <View style={styles.infoItem}>
                        <UserMinus size={24} color={ONBOARDING_COLORS.accent} weight="fill" />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoTitle, { color: ONBOARDING_COLORS.text }]}>No Account Needed</Text>
                            <Text style={[styles.infoDesc, { color: ONBOARDING_COLORS.textMuted }]}>
                                Start using the app instantly without creating an account.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: ONBOARDING_COLORS.accent }]}
                    onPress={() => router.push('/onboarding/profile')}
                >
                    <Text style={[styles.buttonText, { color: ONBOARDING_COLORS.background }]}>
                        Next
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
    infoCard: {
        width: '100%',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.lg,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: Spacing.md,
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
