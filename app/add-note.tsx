/**
 * Add Note Screen
 * Full-screen note editor for habits
 */

import { ImageGallery, ImagePicker, ImagePreview, MoodPicker, NoteEditor } from '@/components/note';
import { NoteEditorRef } from '@/components/note/NoteEditor';
import { Colors, Spacing } from '@/constants/theme';
import { useHabits } from '@/context/HabitContext';
import { useNotes } from '@/context/NoteContext';
import { useTheme } from '@/context/ThemeContext';
import * as imageStorage from '@/services/imageStorage';
import { MoodType, NoteImage } from '@/types/note';
import { formatLocalDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AddNoteScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ habitId?: string; date?: string; fromCalendar?: string }>();
    const { getHabitById } = useHabits();
    const { getNote, saveNote, deleteNote } = useNotes();
    const { colors, isDark } = useTheme();

    const habitId = params.habitId || '';
    const date = params.date || formatLocalDate(new Date());
    const fromCalendar = params.fromCalendar === 'true';

    const habit = getHabitById(habitId);
    const existingNote = getNote(habitId, date);

    // Handle back navigation - go to calendar if came from there
    const handleBack = useCallback(() => {
        if (fromCalendar) {
            router.replace('/calendar');
        } else {
            router.back();
        }
    }, [fromCalendar, router]);

    const [content, setContent] = useState(existingNote?.content || '');
    const [mood, setMood] = useState<MoodType | undefined>(existingNote?.mood);
    const [images, setImages] = useState<NoteImage[]>(existingNote?.images || []);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
    const noteEditorRef = useRef<NoteEditorRef>(null);

    // Load existing note on mount
    useEffect(() => {
        if (existingNote) {
            setContent(existingNote.content);
            setMood(existingNote.mood);
            setImages(existingNote.images || []);
        }
    }, [existingNote?.id]);

    // Format date for display
    const formatDisplayDate = (dateStr: string) => {
        const dateObj = new Date(dateStr + 'T12:00:00'); // Add time to prevent timezone issues
        const today = formatLocalDate(new Date());

        if (dateStr === today) {
            return 'Today';
        }

        return dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    // Auto-save handler
    const handleContentChange = useCallback(async (newContent: string) => {
        setContent(newContent);

        if (newContent.trim() || mood) {
            setIsSaving(true);
            setSaveStatus('saving');
            try {
                await saveNote(habitId, date, {
                    content: newContent,
                    mood,
                    images,
                });
                setSaveStatus('saved');
            } catch (error) {
                console.error('Error saving note:', error);
                setSaveStatus('idle');
            } finally {
                setIsSaving(false);
            }
        }
    }, [habitId, date, mood, images, saveNote]);

    // Handle mood change
    const handleMoodChange = useCallback(async (newMood: MoodType | undefined) => {
        setMood(newMood);

        if (content.trim() || newMood || images.length > 0) {
            setIsSaving(true);
            setSaveStatus('saving');
            try {
                await saveNote(habitId, date, {
                    content,
                    mood: newMood,
                    images,
                });
                setSaveStatus('saved');
            } catch (error) {
                console.error('Error saving note:', error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [habitId, date, content, images, saveNote]);

    // Handle Image Selection
    const handleImageSelected = useCallback(async (uri: string) => {
        try {
            // Save to app storage
            const savedPath = await imageStorage.saveImage(uri);

            const newImage: NoteImage = {
                id: Date.now().toString(),
                uri: savedPath,
                createdAt: new Date().toISOString(),
            };

            const newImages = [...images, newImage];
            setImages(newImages);

            // Auto-save
            setIsSaving(true);
            setSaveStatus('saving');
            await saveNote(habitId, date, {
                content,
                mood,
                images: newImages,
            });
            setSaveStatus('saved');
        } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save image');
            setSaveStatus('idle');
        } finally {
            setIsSaving(false);
        }
    }, [habitId, date, content, mood, images, saveNote]);

    // Handle Image Delete
    const handleDeleteImage = useCallback(async (id: string, uri: string) => {
        Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Determine if we need to delete the file
                            // For now, let's keep it simple and just remove from note
                            // A separate cleanup process could handle orphaned files
                            await imageStorage.deleteImage(uri);

                            const newImages = images.filter(img => img.id !== id);
                            setImages(newImages);

                            // Auto-save
                            setIsSaving(true);
                            setSaveStatus('saving');
                            await saveNote(habitId, date, {
                                content,
                                mood,
                                images: newImages,
                            });
                            setSaveStatus('saved');
                        } catch (error) {
                            console.error('Error deleting image:', error);
                            Alert.alert('Error', 'Failed to delete image');
                        } finally {
                            setIsSaving(false);
                        }
                    },
                },
            ]
        );
    }, [habitId, date, content, mood, images, saveNote]);

    const handleViewImage = (image: NoteImage) => {
        setPreviewImage(image.uri);
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

    // Delete note
    const handleDelete = useCallback(() => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteNote(habitId, date);
                            router.back();
                        } catch (error) {
                            console.error('Error deleting note:', error);
                        }
                    },
                },
            ]
        );
    }, [habitId, date, deleteNote, router]);

    // Status indicator text
    const getStatusText = () => {
        switch (saveStatus) {
            case 'saving':
                return 'Saving...';
            case 'saved':
                return 'Saved ✓';
            default:
                return '';
        }
    };

    if (!habit) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.centered}>
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>Habit not found</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.backLink, { color: colors.accent }]}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>
                            {habit.icon} {habit.name}
                        </Text>
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDisplayDate(date)}</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={[styles.saveStatus, { color: colors.success }]}>{getStatusText()}</Text>
                        {existingNote && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Mood Picker */}
                    <MoodPicker
                        selectedMood={mood}
                        onSelect={handleMoodChange}
                    />

                    {/* Image Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>IMAGES</Text>
                    </View>

                    <ImageGallery
                        images={images}
                        onDelete={handleDeleteImage}
                        onPress={handleViewImage}
                    />

                    <ImagePicker
                        onImageSelected={handleImageSelected}
                        disabled={isSaving}
                    />

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTE</Text>
                    </View>

                    {/* Note Editor */}
                    <NoteEditor
                        ref={noteEditorRef}
                        content={content}
                        onContentChange={handleContentChange}
                        placeholder={`How did ${habit.name} go today? Write your thoughts, progress, or reflections...`}
                    />

                    <View style={styles.bottomPadding} />
                </ScrollView>
            </KeyboardAvoidingView>
            {/* Image Preview Modal */}
            <ImagePreview
                visible={showPreview}
                imageUri={previewImage}
                onClose={() => setShowPreview(false)}
                onDownload={handleDownloadImage}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        marginBottom: Spacing.md,
    },
    backLink: {
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    habitName: {
        fontSize: 17,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 13,
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 80,
        justifyContent: 'flex-end',
    },
    saveStatus: {
        fontSize: 12,
        marginRight: Spacing.sm,
    },
    deleteButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
    },
    bottomPadding: {
        height: 100,
    },
    sectionHeader: {
        marginBottom: Spacing.xs,
        marginTop: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

