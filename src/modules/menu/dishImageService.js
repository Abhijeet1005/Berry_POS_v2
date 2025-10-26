const Dish = require('../../models/Dish');
const cloudinaryService = require('../../services/cloudinaryService');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { cleanupFiles } = require('../../middleware/uploadMiddleware');

/**
 * Upload images for a dish
 */
const uploadDishImages = async (dishId, files, tenantId) => {
  try {
    // Validate dish exists
    const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true });
    if (!dish) {
      throw new NotFoundError('Dish');
    }

    // Validate files
    cloudinaryService.validateMultipleImageFiles(files);

    // Check total images limit (existing + new)
    const totalImages = (dish.images?.length || 0) + files.length;
    if (totalImages > 5) {
      throw new ValidationError(`Maximum 5 images allowed per dish. Current: ${dish.images?.length || 0}`);
    }

    // Upload to Cloudinary
    const folder = `berry-blocks-pos/dishes/${tenantId}/${dish.outletId}`;
    const uploadedImages = await cloudinaryService.uploadMultipleImages(files, { folder });

    // Add to dish
    if (!dish.images) {
      dish.images = [];
    }
    dish.images.push(...uploadedImages);
    await dish.save();

    // Cleanup temp files
    cleanupFiles(files);

    return {
      dish,
      uploadedImages,
      totalImages: dish.images.length
    };
  } catch (error) {
    // Cleanup temp files on error
    cleanupFiles(files);
    throw error;
  }
};

/**
 * Delete a specific image from dish
 */
const deleteDishImage = async (dishId, imagePublicId, tenantId) => {
  // Validate dish exists
  const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true });
  if (!dish) {
    throw new NotFoundError('Dish');
  }

  // Find image
  const imageIndex = dish.images.findIndex(img => img.publicId === imagePublicId);
  if (imageIndex === -1) {
    throw new NotFoundError('Image not found in dish');
  }

  // Delete from Cloudinary
  await cloudinaryService.deleteImage(imagePublicId);

  // Remove from dish
  dish.images.splice(imageIndex, 1);
  await dish.save();

  return {
    dish,
    deletedImageId: imagePublicId,
    remainingImages: dish.images.length
  };
};

/**
 * Delete all images from dish
 */
const deleteAllDishImages = async (dishId, tenantId) => {
  // Validate dish exists
  const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true });
  if (!dish) {
    throw new NotFoundError('Dish');
  }

  if (!dish.images || dish.images.length === 0) {
    throw new ValidationError('No images to delete');
  }

  // Delete all from Cloudinary
  const publicIds = dish.images.map(img => img.publicId);
  await cloudinaryService.deleteMultipleImages(publicIds);

  // Clear images array
  const deletedCount = dish.images.length;
  dish.images = [];
  await dish.save();

  return {
    dish,
    deletedCount
  };
};

/**
 * Replace dish images (delete old, upload new)
 */
const replaceDishImages = async (dishId, files, tenantId) => {
  try {
    // Validate dish exists
    const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true });
    if (!dish) {
      throw new NotFoundError('Dish');
    }

    // Validate files
    cloudinaryService.validateMultipleImageFiles(files);

    // Delete old images from Cloudinary
    if (dish.images && dish.images.length > 0) {
      const publicIds = dish.images.map(img => img.publicId);
      await cloudinaryService.deleteMultipleImages(publicIds);
    }

    // Upload new images
    const folder = `berry-blocks-pos/dishes/${tenantId}/${dish.outletId}`;
    const uploadedImages = await cloudinaryService.uploadMultipleImages(files, { folder });

    // Update dish
    dish.images = uploadedImages;
    await dish.save();

    // Cleanup temp files
    cleanupFiles(files);

    return {
      dish,
      uploadedImages,
      totalImages: dish.images.length
    };
  } catch (error) {
    // Cleanup temp files on error
    cleanupFiles(files);
    throw error;
  }
};

/**
 * Get image URLs with transformations
 */
const getDishImageUrls = (dish, transformation = null) => {
  if (!dish.images || dish.images.length === 0) {
    return [];
  }

  if (!transformation) {
    return dish.images.map(img => img.url);
  }

  // Apply transformation
  return dish.images.map(img => 
    cloudinaryService.getImageUrl(img.publicId, transformation)
  );
};

/**
 * Get square crop URLs for dish images
 */
const getDishSquareCropUrls = (dish, size = 400) => {
  if (!dish.images || dish.images.length === 0) {
    return [];
  }

  return dish.images.map(img => ({
    publicId: img.publicId,
    originalUrl: img.url,
    squareUrl: cloudinaryService.getSquareCropUrl(img.publicId, size)
  }));
};

module.exports = {
  uploadDishImages,
  deleteDishImage,
  deleteAllDishImages,
  replaceDishImages,
  getDishImageUrls,
  getDishSquareCropUrls
};
