/**
 * Image Picker Component
 * Buttons to capture photo or select from gallery
 */

import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoteImagePickerProps {
    onImageSelected: (uri: string) => void;
    disabled?: boolean;
}

export default function NoteImagePicker({ onImageSelected, disabled = false }: NoteImagePickerProps) {
    const { colors } = useTheme();

    const handleCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required to take photos');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsEditing: false, // Save time by skipping editing
            });

            if (!result.canceled && result.assets[0]) {
                onImageSelected(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to launch camera');
            console.error(error);
        }
    };

    const handleGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Gallery permission is required to upload images');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsMultipleSelection: false, // Keep it simple one at a time for now
            });

            if (!result.canceled && result.assets[0]) {
                onImageSelected(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open gallery');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    disabled && styles.disabled,
                ]}
                onPress={handleCamera}
                disabled={disabled}
            >
                <Ionicons name="camera" size={20} color={colors.accent} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    disabled && styles.disabled,
                ]}
                onPress={handleGallery}
                disabled={disabled}
            >
                <Ionicons name="images" size={20} color={colors.accent} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Gallery</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    disabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
