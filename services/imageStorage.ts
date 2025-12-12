/**
 * Image Storage Service
 * Handles saving and retrieving images from the file system
 */

import * as FileSystem from 'expo-file-system/legacy';

const IMAGES_DIR = (FileSystem as any).documentDirectory + 'note_images/';

/**
 * Ensure the images directory exists
 */
const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
};

/**
 * Save an image to the app's local storage
 * @param sourceUri The URI of the image to save (e.g. from picker)
 * @returns The filename of the saved image
 */
export const saveImage = async (sourceUri: string): Promise<string> => {
    try {
        await ensureDirExists();

        // Generate a unique filename
        const filename = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const destPath = IMAGES_DIR + filename;

        // Copy the file
        await FileSystem.copyAsync({
            from: sourceUri,
            to: destPath,
        });

        return destPath;
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
};

/**
 * Delete an image from local storage
 * @param imagePath The full path of the image to delete
 */
export const deleteImage = async (imagePath: string): Promise<void> => {
    try {
        // Only delete file if it exists and is within our app's directory
        if (imagePath.startsWith((FileSystem as any).documentDirectory || '')) {
            const fileInfo = await FileSystem.getInfoAsync(imagePath);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(imagePath);
            }
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw here, just log error as it's not critical if delete fails
    }
};

/**
 * Get the full path for a saved image (if we were storing just filenames)
 * Currently we store full paths, so this might be identical to input
 */
export const getImagePath = (pathOrFilename: string): string => {
    // If it's already a full path (starts with file:// or matches document dir), return it
    if (pathOrFilename.startsWith('file://') || pathOrFilename.startsWith((FileSystem as any).documentDirectory || '')) {
        return pathOrFilename;
    }
    // Otherwise assume it's a filename in our images dir
    return IMAGES_DIR + pathOrFilename;
};
