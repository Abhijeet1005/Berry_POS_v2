const express = require('express');
const router = express.Router();
const menuController = require('./menuController');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
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
