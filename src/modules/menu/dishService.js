const Dish = require('../../models/Dish');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Create a new dish
 */
const createDish = async (dishData, tenantId) => {
  const dish = new Dish({
    ...dishData,
    tenantId
  });
  
  await dish.save();
  return dish;
};

/**
 * Get all dishes with filters and pagination
 */
const getDishes = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  // Build filter
  const filter = { tenantId, isActive: true };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }
  
  if (query.dietaryTags) {
    filter.dietaryTags = { $in: Array.isArray(query.dietaryTags) ? query.dietaryTags : [query.dietaryTags] };
  }
  
  if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable === 'true';
  }
  
  if (query.tags) {
    filter.tags = { $in: Array.isArray(query.tags) ? query.tags : [query.tags] };
  }
  
  // Get dishes
  const dishes = await Dish.find(filter)
    .populate('categoryId', 'name kitchenSection')
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
  
  const total = await Dish.countDocuments(filter);
  
  return {
    dishes,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get dish by ID
 */
const getDishById = async (dishId, tenantId) => {
  const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true })
    .populate('categoryId', 'name kitchenSection');
  
  if (!dish) {
    throw new NotFoundError('Dish');
  }
  
  return dish;
};

/**
 * Update dish
 */
const updateDish = async (dishId, updateData, tenantId) => {
  const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true });
  
  if (!dish) {
    throw new NotFoundError('Dish');
  }
  
  Object.assign(dish, updateData);
  await dish.save();
  
  return dish;
};

/**
 * Delete dish (soft delete)
 */
const deleteDish = async (dishId, tenantId) => {
  const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true });
  
  if (!dish) {
    throw new NotFoundError('Dish');
  }
  
  dish.isActive = false;
  await dish.save();
  
  return { message: 'Dish deleted successfully' };
};

/**
 * Update dish stock
 */
const updateStock = async (dishId, quantity, operation, tenantId) => {
  const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true });
  
  if (!dish) {
    throw new NotFoundError('Dish');
  }
  
  if (operation === 'increment') {
    await dish.incrementStock(quantity);
  } else if (operation === 'decrement') {
    await dish.decrementStock(quantity);
  } else if (operation === 'set') {
    dish.stock = quantity;
    await dish.save();
  } else {
    throw new ValidationError('Invalid operation. Use increment, decrement, or set');
  }
  
  return dish;
};

/**
 * Search dishes
 */
const searchDishes = async (searchParams, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(searchParams);
  
  const filter = { tenantId, isActive: true };
  
  // Text search
  if (searchParams.query) {
    filter.$text = { $search: searchParams.query };
  }
  
  // Outlet filter
  if (searchParams.outletId) {
    filter.outletId = searchParams.outletId;
  }
  
  // Dietary tags filter
  if (searchParams.dietaryTags) {
    const tags = Array.isArray(searchParams.dietaryTags) ? searchParams.dietaryTags : [searchParams.dietaryTags];
    filter.dietaryTags = { $in: tags };
  }
  
  // Allergen exclusion
  if (searchParams.excludeAllergens) {
    const allergens = Array.isArray(searchParams.excludeAllergens) ? searchParams.excludeAllergens : [searchParams.excludeAllergens];
    filter.allergens = { $nin: allergens };
  }
  
  // Prep time filter
  if (searchParams.maxPrepTime) {
    filter.prepTime = { $lte: parseInt(searchParams.maxPrepTime) };
  }
  
  // Price range
  if (searchParams.minPrice || searchParams.maxPrice) {
    filter.price = {};
    if (searchParams.minPrice) filter.price.$gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) filter.price.$lte = parseFloat(searchParams.maxPrice);
  }
  
  // Availability filter
  if (searchParams.availableOnly === 'true') {
    filter.isAvailable = true;
  }
  
  // Build sort
  let sort = {};
  if (searchParams.query) {
    sort = { score: { $meta: 'textScore' } };
  } else {
    sort = { name: 1 };
  }
  
  // Get dishes
  const dishes = await Dish.find(filter)
    .populate('categoryId', 'name kitchenSection')
    .skip(skip)
    .limit(limit)
    .sort(sort);
  
  const total = await Dish.countDocuments(filter);
  
  return {
    dishes,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get dishes by category
 */
const getDishesByCategory = async (categoryId, tenantId, outletId) => {
  const filter = {
    tenantId,
    categoryId,
    isActive: true
  };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  const dishes = await Dish.find(filter).sort({ name: 1 });
  
  return dishes;
};

/**
 * Bulk update stock
 */
const bulkUpdateStock = async (updates, tenantId) => {
  const results = [];
  
  for (const update of updates) {
    try {
      const dish = await updateStock(update.dishId, update.quantity, update.operation, tenantId);
      results.push({ dishId: update.dishId, success: true, dish });
    } catch (error) {
      results.push({ dishId: update.dishId, success: false, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  createDish,
  getDishes,
  getDishById,
  updateDish,
  deleteDish,
  updateStock,
  searchDishes,
  getDishesByCategory,
  bulkUpdateStock
};
