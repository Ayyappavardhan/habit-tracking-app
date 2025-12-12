import { BorderRadius, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useNotes } from '@/context/NoteContext';
import { useTheme } from '@/context/ThemeContext';
import { MoodEmojis, NoteImage } from '@/types/note';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePreview } from '../note';

interface NotePreviewModalProps {
    habitId: string;
    date: string;
    visible: boolean;
    onClose: () => void;
}

export default function NotePreviewModal({ habitId, date, visible, onClose }: NotePreviewModalProps) {
    const router = useRouter();
    const { getHabitById } = useHabits();
    const { getNote, deleteNote } = useNotes();
    const { colors } = useTheme();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Get live note data
    const note = useMemo(() => {
        if (!habitId || !date) return null;
        return getNote(habitId, date);
    }, [habitId, date, getNote]);

    // Get habit info
    const habit = useMemo(() => {
        if (!habitId) return null;
        return getHabitById(habitId);
    }, [habitId, getHabitById]);

    // Format date for display
    const formattedDate = useMemo(() => {
        if (!date) return '';
        const dateObj = new Date(date + 'T12:00:00');
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }, [date]);

    // Format timestamp
    const formatTimestamp = useCallback((isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    }, []);

    // Handle edit
    const handleEdit = useCallback(() => {
        // Close the preview modal first
        onClose();
        // Use setTimeout to ensure modal is fully closed before navigation
        // Use replace instead of push to avoid navigation stack issues with modal presentation
        setTimeout(() => {
            router.replace({
                pathname: '/add-note',
                params: { habitId, date, fromCalendar: 'true' }
            });
        }, 150);
    }, [habitId, date, router, onClose]);

    // Handle delete
    const handleDelete = useCallback(() => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteNote(habitId, date);
                            onClose();
                        } catch (error) {
                            console.error('Error deleting note:', error);
                            Alert.alert('Error', 'Failed to delete note. Please try again.');
                        }
                    },
                },
            ]
        );
    }, [habitId, date, deleteNote, onClose]);

    const handleViewImage = (uri: string) => {
        setPreviewImage(uri);
        setShowPreview(true);
    };

    const handleDownloadImage = async (uri: string) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Gallery permission is required to save images');
                return;
            }

            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert('Success', 'Image saved to gallery');
        } catch (error) {
            console.error('Error downloading image:', error);
            Alert.alert('Error', 'Failed to save image to gallery');
        }
    };

    if (!note || !habit) return null;

    if (!visible) return null;

    return (
        <View style={[styles.container, styles.overlay]}>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>
                            {habit.icon} {habit.name}
                        </Text>
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formattedDate}</Text>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={handleEdit}
                        >
                            <Ionicons name="pencil" size={20} color={colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={handleDelete}
                        >
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainer}
                >
                    {/* Mood Display */}
                    {note.mood && (
                        <View style={[styles.moodSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <Text style={styles.moodEmoji}>{MoodEmojis[note.mood]}</Text>
                            <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>
                                Feeling {note.mood}
                            </Text>
                        </View>
                    )}

                    {/* Images Section */}
                    {note.images && note.images.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>IMAGES</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                                {note.images.map((img: NoteImage) => (
                                    <TouchableOpacity
                                        key={img.id}
                                        onPress={() => handleViewImage(img.uri)}
                                        activeOpacity={0.8}
                                    >
                                        <Image
                                            source={{ uri: img.uri }}
                                            style={[styles.imagePreview, { borderColor: colors.cardBorder }]}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Note Content */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>JOURNAL ENTRY</Text>
                        <View style={[styles.noteContentCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <Text style={[styles.noteContent, { color: colors.text }]}>
                                {note.content || 'No content written.'}
                            </Text>
                        </View>
                    </View>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TAGS</Text>
                            <View style={styles.tagsContainer}>
                                {note.tags.map((tag, index) => (
                                    <View key={index} style={[styles.tag, { backgroundColor: colors.accent }]}>
                                        <Text style={[styles.tagText, { color: colors.background }]}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Timestamps */}
                    <View style={[styles.timestampsSection, { borderTopColor: colors.cardBorder }]}>
                        <View style={styles.timestampRow}>
                            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                                Created: {formatTimestamp(note.createdAt)}
                            </Text>
                        </View>
                        {note.updatedAt !== note.createdAt && (
                            <View style={styles.timestampRow}>
                                <Ionicons name="refresh-outline" size={14} color={colors.textMuted} />
                                <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                                    Updated: {formatTimestamp(note.updatedAt)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.bottomPadding} />
                </ScrollView>

                {/* Bottom Action Bar */}
                <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: colors.accent }]}
                        onPress={handleEdit}
                    >
                        <Ionicons name="pencil" size={20} color={colors.background} />
                        <Text style={[styles.editButtonText, { color: colors.background }]}>Edit Note</Text>
                    </TouchableOpacity>
                </View>

                {/* Image Preview Modal */}
                <ImagePreview
                    visible={showPreview}
                    imageUri={previewImage}
                    onClose={() => setShowPreview(false)}
                    onDownload={handleDownloadImage}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100, // Ensure it sits above calendar
    },
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
    },
    habitName: {
        fontSize: 17,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 13,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    headerActionButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.md,
    },
    moodSection: {
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
    },
    moodEmoji: {
        fontSize: 48,
        marginBottom: Spacing.sm,
    },
    moodLabel: {
        fontSize: 16,
        textTransform: 'capitalize',
    },
    section: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noteContentCard: {
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
    },
    noteContent: {
        fontSize: 16,
        lineHeight: 24,
    },
    imagesScroll: {
        flexDirection: 'row',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginRight: Spacing.sm,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    tag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timestampsSection: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        gap: Spacing.xs,
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    timestampText: {
        fontSize: 12,
    },
    bottomPadding: {
        height: 80,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
