const dishImageService = require('./dishImageService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');
const { ValidationError } = require('../../utils/errorHandler');

/**
 * Upload images for a dish
 * POST /api/v1/dishes/:dishId/images
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ValidationError('No images provided');
  }

  const result = await dishImageService.uploadDishImages(
    req.params.dishId,
    req.files,
    req.tenantId
  );

  res.status(201).json(
    successResponse(result, `${result.uploadedImages.length} image(s) uploaded successfully`)
  );
});

/**
 * Delete a specific image from dish
 * DELETE /api/v1/dishes/:dishId/images/:imagePublicId
 */
const deleteImage = asyncHandler(async (req, res) => {
  // Decode the publicId (it comes URL encoded)
  const imagePublicId = decodeURIComponent(req.params.imagePublicId);

  const result = await dishImageService.deleteDishImage(
    req.params.dishId,
    imagePublicId,
    req.tenantId
  );

  res.json(successResponse(result, 'Image deleted successfully'));
});

/**
 * Delete all images from dish
 * DELETE /api/v1/dishes/:dishId/images
 */
const deleteAllImages = asyncHandler(async (req, res) => {
  const result = await dishImageService.deleteAllDishImages(
    req.params.dishId,
    req.tenantId
  );

  res.json(successResponse(result, `${result.deletedCount} image(s) deleted successfully`));
});

/**
 * Replace all dish images
 * PUT /api/v1/dishes/:dishId/images
 */
const replaceImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ValidationError('No images provided');
  }

  const result = await dishImageService.replaceDishImages(
    req.params.dishId,
    req.files,
    req.tenantId
  );

  res.json(
    successResponse(result, `Images replaced successfully. Total: ${result.totalImages}`)
  );
});

/**
 * Get dish images with square crop URLs
 * GET /api/v1/dishes/:dishId/images/square
 */
const getSquareCropUrls = asyncHandler(async (req, res) => {
  const Dish = require('../../models/Dish');
  const dish = await Dish.findOne({ 
    _id: req.params.dishId, 
    tenantId: req.tenantId, 
    isActive: true 
  });

  if (!dish) {
    throw new NotFoundError('Dish');
  }

  const size = parseInt(req.query.size) || 400;
  const squareUrls = dishImageService.getDishSquareCropUrls(dish, size);

  res.json(successResponse({ images: squareUrls }, 'Square crop URLs generated'));
});

module.exports = {
  uploadImages,
  deleteImage,
  deleteAllImages,
  replaceImages,
  getSquareCropUrls
};
