/**
 * Onboarding - Profile Screen
 * User enters name and selects avatar.
 * Always uses dark theme for consistent onboarding experience.
 */

import { EmojiPicker } from '@/components/habit';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, CheckCircle, PencilSimple } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
    Image,
    ImageSourcePropType,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Avatar Assets - Diverse options for all users
const AVATARS = [
    { id: 'avatar-male', label: 'Adult Male', source: require('@/assets/images/avatar-male.png') },
    { id: 'avatar-female', label: 'Adult Female', source: require('@/assets/images/avatar-female.png') },
    { id: 'avatar-male-child', label: 'Boy', source: require('@/assets/images/avatar-male-child.png') },
    { id: 'avatar-female-child', label: 'Girl', source: require('@/assets/images/avatar-female-child.png') },
    { id: 'avatar-male-teen', label: 'Teen Boy', source: require('@/assets/images/avatar-male-teen.png') },
    { id: 'avatar-female-teen', label: 'Teen Girl', source: require('@/assets/images/avatar-female-teen.png') },
    { id: 'avatar-male-young', label: 'Young Man', source: require('@/assets/images/avatar-male-young.png') },
    { id: 'avatar-male-pro', label: 'Professional', source: require('@/assets/images/avatar-male-pro.png') },
];

// Force dark theme colors for onboarding
const ONBOARDING_COLORS = {
    background: '#0D0D0D',
    backgroundSecondary: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textMuted: '#636366',
    accent: '#FFD700',
    card: '#1C1C1E',
    cardBorder: '#2C2C2E',
};

export default function ProfileScreen() {
    const { settings, updateSettings } = useSettings();
    const [name, setName] = useState(settings.userName);
    const [avatar, setAvatar] = useState(settings.userAvatar);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const getAvatarImage = (avatarString: string): ImageSourcePropType | null => {
        const avatarData = AVATARS.find(a => a.id === avatarString);
        return avatarData?.source || null;
    };

    const renderAvatar = () => {
        const imageSource = getAvatarImage(avatar);

        if (imageSource) {
            return <Image source={imageSource} style={styles.avatarImage} resizeMode="cover" />;
        }

        return <Text style={styles.avatarEmoji}>{avatar}</Text>;
    };

    const handleContinue = async () => {
        await updateSettings({ userName: name, userAvatar: avatar });
        router.push('/onboarding/first-habit');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: ONBOARDING_COLORS.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft size={24} color={ONBOARDING_COLORS.text} weight="regular" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: ONBOARDING_COLORS.text }]}>
                            Let's get to know you
                        </Text>
                        <Text style={[styles.subtitle, { color: ONBOARDING_COLORS.textSecondary }]}>
                            Choose an avatar and tell us your name.
                        </Text>

                        {/* Avatar Selection */}
                        <TouchableOpacity
                            style={[styles.avatarContainer, { backgroundColor: ONBOARDING_COLORS.backgroundSecondary }]}
                            onPress={() => setShowAvatarSelector(true)}
                        >
                            {renderAvatar()}
                            <View style={[styles.editBadge, { backgroundColor: ONBOARDING_COLORS.accent, borderColor: ONBOARDING_COLORS.background }]}>
                                <PencilSimple size={16} color={ONBOARDING_COLORS.background} weight="bold" />
                            </View>
                        </TouchableOpacity>

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: ONBOARDING_COLORS.textSecondary }]}>Your Name</Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: ONBOARDING_COLORS.card,
                                    color: ONBOARDING_COLORS.text,
                                    borderColor: ONBOARDING_COLORS.cardBorder
                                }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={ONBOARDING_COLORS.textMuted}
                                maxLength={30}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: ONBOARDING_COLORS.accent },
                            !name.trim() && { opacity: 0.5 }
                        ]}
                        onPress={handleContinue}
                        disabled={!name.trim()}
                    >
                        <Text style={[styles.buttonText, { color: ONBOARDING_COLORS.background }]}>
                            Continue
                        </Text>
                        <ArrowRight size={20} color={ONBOARDING_COLORS.background} weight="regular" />
                    </TouchableOpacity>
                </View>

                {/* Avatar Selection Modal */}
                <Modal
                    visible={showAvatarSelector}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowAvatarSelector(false)}
                >
                    <TouchableOpacity
                        style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
                        activeOpacity={1}
                        onPress={() => setShowAvatarSelector(false)}
                    >
                        <View style={[styles.avatarModalContent, { backgroundColor: ONBOARDING_COLORS.card }]}>
                            <Text style={[styles.modalTitle, { color: ONBOARDING_COLORS.text }]}>Choose Avatar</Text>

                            <ScrollView
                                style={styles.avatarScrollView}
                                contentContainerStyle={styles.avatarOptionsContainer}
                                showsVerticalScrollIndicator={false}
                            >
                                {AVATARS.map((avatarOption) => (
                                    <TouchableOpacity
                                        key={avatarOption.id}
                                        style={styles.avatarOption}
                                        onPress={() => {
                                            setAvatar(avatarOption.id);
                                            setShowAvatarSelector(false);
                                        }}
                                    >
                                        <View style={[
                                            styles.avatarOptionImageContainer,
                                            { backgroundColor: ONBOARDING_COLORS.backgroundSecondary },
                                            avatar === avatarOption.id && { borderColor: ONBOARDING_COLORS.accent, borderWidth: 2 }
                                        ]}>
                                            <Image source={avatarOption.source} style={styles.avatarOptionImage} />
                                        </View>
                                        <Text style={[styles.avatarOptionLabel, { color: ONBOARDING_COLORS.text }]}>
                                            {avatarOption.label}
                                        </Text>
                                        {avatar === avatarOption.id && (
                                            <View style={[styles.selectedBadge, { backgroundColor: ONBOARDING_COLORS.accent, borderColor: ONBOARDING_COLORS.card }]}>
                                                <CheckCircle size={12} color="#FFF" weight="fill" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}

                                {/* Emoji Option */}
                                <TouchableOpacity
                                    style={styles.avatarOption}
                                    onPress={() => {
                                        setShowAvatarSelector(false);
                                        setTimeout(() => setShowEmojiPicker(true), 300);
                                    }}
                                >
                                    <View style={[styles.avatarOptionImageContainer, { backgroundColor: ONBOARDING_COLORS.backgroundSecondary }]}>
                                        <Text style={{ fontSize: 32 }}>😊</Text>
                                    </View>
                                    <Text style={[styles.avatarOptionLabel, { color: ONBOARDING_COLORS.text }]}>Emoji</Text>
                                </TouchableOpacity>
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: ONBOARDING_COLORS.backgroundSecondary }]}
                                onPress={() => setShowAvatarSelector(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: ONBOARDING_COLORS.text }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <EmojiPicker
                    visible={showEmojiPicker}
                    selectedEmoji={avatar.length <= 2 ? avatar : '😊'}
                    onClose={() => setShowEmojiPicker(false)}
                    onSelect={(emoji) => {
                        setAvatar(emoji);
                        setShowEmojiPicker(false);
                    }}
                />
            </KeyboardAvoidingView>
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
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    avatarEmoji: {
        fontSize: 64,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0D0D0D',
    },
    inputContainer: {
        width: '100%',
        gap: Spacing.xs,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: Spacing.xs,
    },
    textInput: {
        width: '100%',
        height: 56,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarModalContent: {
        width: '85%',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: Spacing.lg,
    },
    avatarScrollView: {
        maxHeight: 300,
        width: '100%',
    },
    avatarOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        paddingBottom: Spacing.md,
        flexWrap: 'wrap',
    },
    avatarOption: {
        alignItems: 'center',
        position: 'relative',
    },
    avatarOptionImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        overflow: 'hidden',
    },
    avatarOptionImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarOptionLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1C1C1E',
    },
    cancelButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
