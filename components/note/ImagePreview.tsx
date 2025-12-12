import { Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ImagePreviewProps {
    visible: boolean;
    imageUri: string | null;
    onClose: () => void;
    onDownload: (uri: string) => Promise<void>;
}

export default function ImagePreview({ visible, imageUri, onClose, onDownload }: ImagePreviewProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [downloading, setDownloading] = useState(false);

    if (!imageUri) return null;

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await onDownload(imageUri);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.container}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                {/* Header Controls - Absolute Positioned */}
                <View style={[styles.header, { top: insets.top + Spacing.sm }]}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                        onPress={handleDownload}
                        disabled={downloading}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={0.7}
                    >
                        {downloading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="download-outline" size={24} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        zIndex: 999,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
