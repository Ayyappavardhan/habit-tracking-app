/**
 * Image Gallery Component
 * Displays a list of images attached to a note
 */

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { NoteImage } from '@/types/note';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ImageGalleryProps {
    images: NoteImage[];
    onDelete: (id: string, uri: string) => void;
    onPress: (image: NoteImage) => void;
}

export default function ImageGallery({ images, onDelete, onPress }: ImageGalleryProps) {
    const { colors } = useTheme();

    if (!images || images.length === 0) return null;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {images.map((img) => (
                <View key={img.id} style={styles.imageWrapper}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onPress(img)}
                    >
                        <Image
                            source={{ uri: img.uri }}
                            style={[styles.image, { borderColor: colors.cardBorder }]}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: colors.card }]}
                        onPress={() => onDelete(img.id, img.uri)}
                    >
                        <Ionicons name="close" size={14} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    content: {
        gap: Spacing.sm,
    },
    imageWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    deleteButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});
