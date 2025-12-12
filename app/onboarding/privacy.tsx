/**
 * Onboarding - Privacy Screen
 * Emphasizes no data collection and local storage.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, DeviceMobile, ShieldCheck, UserMinus } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
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
                    <ShieldCheck size={64} color={colors.accent} weight="regular" />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Privacy First
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your data stays on your device. No sign-up, no cloud syncing, and absolutely no tracking.
                </Text>

                <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.infoItem}>
                        <DeviceMobile size={24} color={colors.text} weight="regular" />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoTitle, { color: colors.text }]}>Local Storage Only</Text>
                            <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
                                All habits and progress are stored locally on your phone.
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                    <View style={styles.infoItem}>
                        <UserMinus size={24} color={colors.text} weight="regular" />
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoTitle, { color: colors.text }]}>No Account Needed</Text>
                            <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
                                Start using the app instantly without creating an account.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.accent }]}
                    onPress={() => router.push('/onboarding/profile')}
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
