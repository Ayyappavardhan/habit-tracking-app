/**
 * Onboarding - Profile Screen
 * User enters name and selects avatar.
 */

import { EmojiPicker } from '@/components/habit';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

// Avatar Assets
const AVATAR_MALE = require('@/assets/images/avatar-male.png');
const AVATAR_FEMALE = require('@/assets/images/avatar-female.png');

export default function ProfileScreen() {
    const { settings, updateSettings } = useSettings();
    const { colors, isDark } = useTheme();
    const [name, setName] = useState(settings.userName);
    const [avatar, setAvatar] = useState(settings.userAvatar);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const getAvatarImage = (avatarString: string): ImageSourcePropType | null => {
        if (avatarString === 'avatar-male') return AVATAR_MALE;
        if (avatarString === 'avatar-female') return AVATAR_FEMALE;
        return null;
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Let's get to know you
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Choose an avatar and tell us your name.
                        </Text>

                        {/* Avatar Selection */}
                        <TouchableOpacity
                            style={[styles.avatarContainer, { backgroundColor: colors.backgroundSecondary }]}
                            onPress={() => setShowAvatarSelector(true)}
                        >
                            {renderAvatar()}
                            <View style={[styles.editBadge, { backgroundColor: colors.accent }]}>
                                <Ionicons name="pencil" size={16} color={colors.background} />
                            </View>
                        </TouchableOpacity>

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Your Name</Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: colors.card,
                                    color: colors.text,
                                    borderColor: colors.cardBorder
                                }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textMuted}
                                maxLength={30}
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: colors.accent },
                            !name.trim() && { opacity: 0.5 }
                        ]}
                        onPress={handleContinue}
                        disabled={!name.trim()}
                    >
                        <Text style={[styles.buttonText, { color: colors.background }]}>
                            Continue
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.background} />
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
                        style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}
                        activeOpacity={1}
                        onPress={() => setShowAvatarSelector(false)}
                    >
                        <View style={[styles.avatarModalContent, { backgroundColor: colors.card }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Avatar</Text>

                            <View style={styles.avatarOptionsContainer}>
                                <TouchableOpacity
                                    style={styles.avatarOption}
                                    onPress={() => {
                                        setAvatar('avatar-male');
                                        setShowAvatarSelector(false);
                                    }}
                                >
                                    <View style={[styles.avatarOptionImageContainer, { backgroundColor: colors.backgroundSecondary }]}>
                                        <Image source={AVATAR_MALE} style={styles.avatarOptionImage} />
                                    </View>
                                    <Text style={[styles.avatarOptionLabel, { color: colors.text }]}>Male</Text>
                                    {avatar === 'avatar-male' && (
                                        <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                                            <Ionicons name="checkmark" size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.avatarOption}
                                    onPress={() => {
                                        setAvatar('avatar-female');
                                        setShowAvatarSelector(false);
                                    }}
                                >
                                    <View style={[styles.avatarOptionImageContainer, { backgroundColor: colors.backgroundSecondary }]}>
                                        <Image source={AVATAR_FEMALE} style={styles.avatarOptionImage} />
                                    </View>
                                    <Text style={[styles.avatarOptionLabel, { color: colors.text }]}>Female</Text>
                                    {avatar === 'avatar-female' && (
                                        <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                                            <Ionicons name="checkmark" size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.avatarOption}
                                    onPress={() => {
                                        setShowAvatarSelector(false);
                                        setTimeout(() => setShowEmojiPicker(true), 300);
                                    }}
                                >
                                    <View style={[styles.avatarOptionImageContainer, { backgroundColor: colors.backgroundSecondary }]}>
                                        <Text style={{ fontSize: 32 }}>😊</Text>
                                    </View>
                                    <Text style={[styles.avatarOptionLabel, { color: colors.text }]}>Emoji</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={() => setShowAvatarSelector(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
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
        borderColor: Colors.background,
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
    avatarOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
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
        borderColor: Colors.card,
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
