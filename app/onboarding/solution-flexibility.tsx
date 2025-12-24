/**
 * Onboarding - Solution Flexibility Screen
 * Highlights flexibility and forgiveness.
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'phosphor-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.8;

const ONBOARDING_COLORS = {
    background: '#000000',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    accent: '#FFD700',
};

export default function SolutionFlexibilityScreen() {
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
                        source={require('@/assets/images/onboarding/onboarding-solution-flexibility.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />

                    {/* Gradient Masks for Seamless Blending */}
                    <LinearGradient
                        colors={[ONBOARDING_COLORS.background, 'transparent']}
                        style={styles.gradientTop}
                        pointerEvents="none"
                    />
                    <LinearGradient
                        colors={['transparent', ONBOARDING_COLORS.background]}
                        style={styles.gradientBottom}
                        pointerEvents="none"
                    />
                    <LinearGradient
                        colors={[ONBOARDING_COLORS.background, 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientLeft}
                        pointerEvents="none"
                    />
                    <LinearGradient
                        colors={['transparent', ONBOARDING_COLORS.background]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientRight}
                        pointerEvents="none"
                    />
                </View>

                <Text style={[styles.title, { color: ONBOARDING_COLORS.text }]}>
                    Life Happens
                </Text>

                <Text style={[styles.subtitle, { color: ONBOARDING_COLORS.textSecondary }]}>
                    Missed a day? No problem. Our flexible scheduling keeps your streak alive so you never feel discouraged.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: ONBOARDING_COLORS.accent }]}
                    onPress={() => router.push('/onboarding/features')}
                >
                    <Text style={[styles.buttonText, { color: ONBOARDING_COLORS.background }]}>
                        See Features
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
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradientTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        zIndex: 10,
    },
    gradientBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        zIndex: 10,
    },
    gradientLeft: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '40%',
        zIndex: 10,
    },
    gradientRight: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: '40%',
        zIndex: 10,
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
