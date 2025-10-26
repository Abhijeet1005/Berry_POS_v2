const cloudinary = require('cloudinary').v2;
const config = require('../config/environment');
const { ValidationError } = require('../utils/errorHandler');

// Configure Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
});

/**
 * Upload image to Cloudinary
 */
const uploadImage = async (file, options = {}) => {
    try {
        const {
            folder = 'berry-blocks-pos/dishes',
            transformation = {},
            publicId = null
        } = options;

        const uploadOptions = {
            folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            ...transformation
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, uploadOptions);

        return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes
        };
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

/**
 * Upload multiple images
 */
const uploadMultipleImages = async (files, options = {}) => {
    try {
        const uploadPromises = files.map(file => uploadImage(file, options));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        throw new Error(`Multiple image upload failed: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok' && result.result !== 'not found') {
            throw new Error('Failed to delete image');
        }

        return { success: true, result: result.result };
    } catch (error) {
        throw new Error(`Image deletion failed: ${error.message}`);
    }
};

/**
 * Delete multiple images
 */
const deleteMultipleImages = async (publicIds) => {
    try {
        const deletePromises = publicIds.map(publicId => deleteImage(publicId));
        const results = await Promise.all(deletePromises);
        return results;
    } catch (error) {
        throw new Error(`Multiple image deletion failed: ${error.message}`);
    }
};

/**
 * Get image URL with transformations
 */
const getImageUrl = (publicId, transformations = {}) => {
    try {
        return cloudinary.url(publicId, {
            secure: true,
            ...transformations
        });
    } catch (error) {
        throw new Error(`Failed to generate image URL: ${error.message}`);
    }
};

/**
 * Get square crop URL
 */
const getSquareCropUrl = (publicId, size = 400) => {
    return getImageUrl(publicId, {
        width: size,
        height: size,
        crop: 'fill',
        gravity: 'auto'
    });
};

/**
 * Validate image file
 */
const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
        throw new ValidationError('No file provided');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new ValidationError('Invalid file type. Only JPG, PNG, and WebP are allowed');
    }

    if (file.size > maxSize) {
        throw new ValidationError('File size exceeds 5MB limit');
    }

    return true;
};

/**
 * Validate multiple image files
 */
const validateMultipleImageFiles = (files, maxCount = 5) => {
    if (!files || files.length === 0) {
        throw new ValidationError('No files provided');
    }

    if (files.length > maxCount) {
        throw new ValidationError(`Maximum ${maxCount} images allowed`);
    }

    files.forEach(file => validateImageFile(file));

    return true;
};

module.exports = {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    deleteMultipleImages,
    getImageUrl,
    getSquareCropUrl,
    validateImageFile,
    validateMultipleImageFiles
};
