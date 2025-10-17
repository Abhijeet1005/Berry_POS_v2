const dishService = require('./dishService');
const categoryService = require('./categoryService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

// Dish Controllers

/**
 * Create dish
 * POST /api/v1/dishes
 */
const createDish = asyncHandler(async (req, res) => {
  const dish = await dishService.createDish(req.body, req.tenantId);
  
  res.status(201).json(successResponse(dish, 'Dish created successfully'));
});

/**
 * Get all dishes
 * GET /api/v1/dishes
 */
const getDishes = asyncHandler(async (req, res) => {
  const result = await dishService.getDishes(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.dishes,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

/**
 * Get dish by ID
 * GET /api/v1/dishes/:id
 */
const getDish = asyncHandler(async (req, res) => {
  const dish = await dishService.getDishById(req.params.id, req.tenantId);
  
  res.json(successResponse(dish, 'Dish retrieved successfully'));
});

/**
 * Update dish
 * PUT /api/v1/dishes/:id
 */
const updateDish = asyncHandler(async (req, res) => {
  const dish = await dishService.updateDish(req.params.id, req.body, req.tenantId);
  
  res.json(successResponse(dish, 'Dish updated successfully'));
});

/**
 * Delete dish
 * DELETE /api/v1/dishes/:id
 */
const deleteDish = asyncHandler(async (req, res) => {
  const result = await dishService.deleteDish(req.params.id, req.tenantId);
  
  res.json(successResponse(result, 'Dish deleted successfully'));
});

/**
 * Update dish stock
 * PATCH /api/v1/dishes/:id/stock
 */
const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;
  const dish = await dishService.updateStock(req.params.id, quantity, operation, req.tenantId);
  
  res.json(successResponse(dish, 'Stock updated successfully'));
});

/**
 * Search dishes
 * GET /api/v1/dishes/search
 */
const searchDishes = asyncHandler(async (req, res) => {
  const result = await dishService.searchDishes(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.dishes,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

// Category Controllers

/**
 * Create category
 * POST /api/v1/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.tenantId);
  
  res.status(201).json(successResponse(category, 'Category created successfully'));
});

/**
 * Get all categories
 * GET /api/v1/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(req.tenantId);
  
  res.json(successResponse(categories, 'Categories retrieved successfully'));
});

/**
 * Get category by ID
 * GET /api/v1/categories/:id
 */
const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id, req.tenantId);
  
  res.json(successResponse(category, 'Category retrieved successfully'));
});

/**
 * Update category
 * PUT /api/v1/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.tenantId);
  
  res.json(successResponse(category, 'Category updated successfully'));
});

/**
 * Delete category
 * DELETE /api/v1/categories/:id
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id, req.tenantId);
  
  res.json(successResponse(result, 'Category deleted successfully'));
});

module.exports = {
  // Dish controllers
  createDish,
  getDishes,
  getDish,
  updateDish,
  deleteDish,
  updateStock,
  searchDishes,
  
  // Category controllers
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
};
