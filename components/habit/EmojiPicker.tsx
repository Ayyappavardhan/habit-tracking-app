/**
 * Emoji Picker Component
 * Modal grid of common emojis for custom habits
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface EmojiPickerProps {
    visible: boolean;
    selectedEmoji: string;
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const emojiCategories: { name: string; emojis: string[] }[] = [
    {
        name: 'Fitness',
        emojis: ['🏃', '🚶', '🏋️', '🧘', '🚴', '🏊', '⚽', '🎾', '🏀', '🥊'],
    },
    {
        name: 'Health',
        emojis: ['💧', '🥗', '🍎', '💊', '😴', '❤️', '🧠', '👁️', '🦷', '💪'],
    },
    {
        name: 'Productivity',
        emojis: ['💼', '📚', '✍️', '💻', '📱', '⏰', '📝', '🎯', '📊', '💡'],
    },
    {
        name: 'Lifestyle',
        emojis: ['🧹', '🌱', '🐕', '💰', '🎵', '🎨', '📸', '✈️', '🛒', '🎮'],
    },
    {
        name: 'Mindfulness',
        emojis: ['🧘', '🙏', '🌅', '🌙', '☀️', '🌸', '🕯️', '📿', '🌿', '🦋'],
    },
    {
        name: 'Social',
        emojis: ['👋', '💬', '📞', '👪', '🤝', '🎁', '📧', '👥', '🌍', '🎉'],
    },
];

const { height: screenHeight } = Dimensions.get('window');

export default function EmojiPicker({
    visible,
    selectedEmoji,
    onSelect,
    onClose
}: EmojiPickerProps) {
    const { colors } = useTheme();

    const handleSelect = (emoji: string) => {
        onSelect(emoji);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdropTouch}
                    onPress={onClose}
                    activeOpacity={1}
                />
                <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Choose Emoji</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Selected Preview */}
                    <View style={[styles.preview, { borderBottomColor: colors.cardBorder }]}>
                        <View style={[styles.previewCircle, { backgroundColor: colors.card, borderColor: colors.accent }]}>
                            <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
                        </View>
                        <Text style={[styles.previewText, { color: colors.textSecondary }]}>Current</Text>
                    </View>

                    {/* Emoji Grid */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                    >
                        {emojiCategories.map((category) => (
                            <View key={category.name} style={styles.category}>
                                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>{category.name}</Text>
                                <View style={styles.emojiGrid}>
                                    {category.emojis.map((emoji, index) => (
                                        <TouchableOpacity
                                            key={`${category.name}-${index}`}
                                            style={[
                                                styles.emojiButton,
                                                { backgroundColor: colors.card },
                                                selectedEmoji === emoji && { backgroundColor: colors.accent },
                                            ]}
                                            onPress={() => handleSelect(emoji)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.emoji}>{emoji}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                        <View style={styles.bottomPadding} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    backdropTouch: {
        flex: 1,
    },
    container: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        height: screenHeight * 0.65,
        minHeight: 400,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    previewCircle: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    previewEmoji: {
        fontSize: 28,
    },
    previewText: {
        fontSize: 11,
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Spacing.sm,
    },
    category: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    categoryLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    emojiButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.sm,
        margin: 3,
    },
    emoji: {
        fontSize: 22,
    },
    bottomPadding: {
        height: 30,
    },
});

