const express = require('express');
const router = express.Router();
const menuController = require('./menuController');
const dishImageController = require('./dishImageController');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { cacheMiddleware, invalidateCacheMiddleware } = require('../../middleware/cacheMiddleware');
const { uploadMultiple, handleMulterError } = require('../../middleware/uploadMiddleware');
const {
  createDishSchema,
  updateDishSchema,
  updateStockSchema,
  searchDishesSchema,
  createCategorySchema,
  updateCategorySchema
} = require('./menuValidation');

// All routes require authentication and tenant context
router.use(authenticate);
router.use(injectTenantContext);

// Dish Routes

/**
 * @route   POST /api/v1/dishes
 * @desc    Create a new dish
 * @access  Private (Manager+)
 */
router.post(
  '/dishes',
  requirePermission('dishes.create'),
  validate(createDishSchema),
  menuController.createDish
);

/**
 * @route   GET /api/v1/dishes
 * @desc    Get all dishes with filters
 * @access  Private
 */
router.get(
  '/dishes',
  requirePermission('dishes.read'),
  cacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  menuController.getDishes
);

/**
 * @route   GET /api/v1/dishes/search
 * @desc    Search dishes
 * @access  Private
 */
router.get(
  '/dishes/search',
  requirePermission('dishes.read'),
  validate(searchDishesSchema, 'query'),
  cacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  menuController.searchDishes
);

/**
 * @route   GET /api/v1/dishes/:id
 * @desc    Get dish by ID
 * @access  Private
 */
router.get(
  '/dishes/:id',
  validateObjectId('id'),
  requirePermission('dishes.read'),
  cacheMiddleware({ ttl: 600 }), // Cache for 10 minutes
  menuController.getDish
);

/**
 * @route   PUT /api/v1/dishes/:id
 * @desc    Update dish
 * @access  Private (Manager+)
 */
router.put(
  '/dishes/:id',
  validateObjectId('id'),
  requirePermission('dishes.update'),
  validate(updateDishSchema),
  invalidateCacheMiddleware({
    patterns: [(req) => `*:dishes:*:tenant:${req.tenantId}:*`]
  }),
  menuController.updateDish
);

/**
 * @route   DELETE /api/v1/dishes/:id
 * @desc    Delete dish
 * @access  Private (Manager+)
 */
router.delete(
  '/dishes/:id',
  validateObjectId('id'),
  requirePermission('dishes.delete'),
  menuController.deleteDish
);

/**
 * @route   PATCH /api/v1/dishes/:id/stock
 * @desc    Update dish stock
 * @access  Private (Manager+)
 */
router.patch(
  '/dishes/:id/stock',
  validateObjectId('id'),
  requirePermission('dishes.update'),
  validate(updateStockSchema),
  menuController.updateStock
);

// Dish Image Routes

/**
 * @route   POST /api/v1/dishes/:dishId/images
 * @desc    Upload images for a dish
 * @access  Private (Manager+)
 */
router.post(
  '/dishes/:dishId/images',
  validateObjectId('dishId'),
  requirePermission('dishes.update'),
  uploadMultiple,
  handleMulterError,
  dishImageController.uploadImages
);

/**
 * @route   PUT /api/v1/dishes/:dishId/images
 * @desc    Replace all dish images
 * @access  Private (Manager+)
 */
router.put(
  '/dishes/:dishId/images',
  validateObjectId('dishId'),
  requirePermission('dishes.update'),
  uploadMultiple,
  handleMulterError,
  dishImageController.replaceImages
);

/**
 * @route   DELETE /api/v1/dishes/:dishId/images/:imagePublicId
 * @desc    Delete a specific image from dish
 * @access  Private (Manager+)
 */
router.delete(
  '/dishes/:dishId/images/:imagePublicId',
  validateObjectId('dishId'),
  requirePermission('dishes.update'),
  dishImageController.deleteImage
);

/**
 * @route   DELETE /api/v1/dishes/:dishId/images
 * @desc    Delete all images from dish
 * @access  Private (Manager+)
 */
router.delete(
  '/dishes/:dishId/images',
  validateObjectId('dishId'),
  requirePermission('dishes.update'),
  dishImageController.deleteAllImages
);

/**
 * @route   GET /api/v1/dishes/:dishId/images/square
 * @desc    Get square crop URLs for dish images
 * @access  Private
 */
router.get(
  '/dishes/:dishId/images/square',
  validateObjectId('dishId'),
  requirePermission('dishes.read'),
  dishImageController.getSquareCropUrls
);

// Category Routes

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private (Manager+)
 */
router.post(
  '/categories',
  requirePermission('categories.create'),
  validate(createCategorySchema),
  menuController.createCategory
);

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Private
 */
router.get(
  '/categories',
  requirePermission('categories.read'),
  cacheMiddleware({ ttl: 600 }), // Cache for 10 minutes
  menuController.getCategories
);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Private
 */
router.get(
  '/categories/:id',
  validateObjectId('id'),
  requirePermission('categories.read'),
  menuController.getCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Manager+)
 */
router.put(
  '/categories/:id',
  validateObjectId('id'),
  requirePermission('categories.update'),
  validate(updateCategorySchema),
  menuController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Manager+)
 */
router.delete(
  '/categories/:id',
  validateObjectId('id'),
  requirePermission('categories.delete'),
  menuController.deleteCategory
);

module.exports = router;
