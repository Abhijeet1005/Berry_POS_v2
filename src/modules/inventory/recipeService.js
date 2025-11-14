const Recipe = require('../../models/Recipe');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');

/**
 * Create recipe
 */
const createRecipe = async (recipeData, tenantId) => {
  // Check if recipe already exists for this dish
  const existingRecipe = await Recipe.findOne({
    tenantId,
    outletId: recipeData.outletId,
    dishId: recipeData.dishId,
    isActive: true
  });
  
  if (existingRecipe) {
    throw new ValidationError('Recipe already exists for this dish');
  }
  
  const recipe = new Recipe({
    ...recipeData,
    tenantId
  });
  
  // Calculate ingredient costs
  await recipe.calculateTotalCost();
  await recipe.save();
  
  return recipe;
};

/**
 * Get all recipes
 */
const getRecipes = async (query, tenantId) => {
  const filter = { tenantId, isActive: true };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.dishId) {
    filter.dishId = query.dishId;
  }
  
  const recipes = await Recipe.find(filter)
    .populate('dishId', 'name price images')
    .populate('ingredients.inventoryItemId', 'name unit currentStock unitCost')
    .sort({ createdAt: -1 });
  
  return recipes;
};

/**
 * Get recipe by ID
 */
const getRecipeById = async (recipeId, tenantId) => {
  const recipe = await Recipe.findOne({ _id: recipeId, tenantId, isActive: true })
    .populate('dishId', 'name price images categoryId')
    .populate('ingredients.inventoryItemId', 'name unit currentStock unitCost minStockLevel');
  
  if (!recipe) {
    throw new NotFoundError('Recipe');
  }
  
  return recipe;
};

/**
 * Get recipe by dish ID
 */
const getRecipeByDishId = async (dishId, outletId, tenantId) => {
  const recipe = await Recipe.findOne({
    tenantId,
    outletId,
    dishId,
    isActive: true
  })
    .populate('dishId', 'name price')
    .populate('ingredients.inventoryItemId', 'name unit currentStock unitCost');
  
  if (!recipe) {
    throw new NotFoundError('Recipe not found for this dish');
  }
  
  return recipe;
};

/**
 * Update recipe
 */
const updateRecipe = async (recipeId, updateData, tenantId) => {
  const recipe = await Recipe.findOne({ _id: recipeId, tenantId, isActive: true });
  
  if (!recipe) {
    throw new NotFoundError('Recipe');
  }
  
  Object.assign(recipe, updateData);
  
  // Recalculate costs if ingredients changed
  if (updateData.ingredients) {
    await recipe.calculateTotalCost();
  }
  
  await recipe.save();
  
  return recipe;
};

/**
 * Delete recipe (soft delete)
 */
const deleteRecipe = async (recipeId, tenantId) => {
  const recipe = await Recipe.findOne({ _id: recipeId, tenantId, isActive: true });
  
  if (!recipe) {
    throw new NotFoundError('Recipe');
  }
  
  recipe.isActive = false;
  await recipe.save();
  
  return { message: 'Recipe deleted successfully' };
};

/**
 * Check recipe availability
 */
const checkRecipeAvailability = async (recipeId, quantity, tenantId) => {
  const recipe = await Recipe.findOne({ _id: recipeId, tenantId, isActive: true })
    .populate('ingredients.inventoryItemId', 'name currentStock');
  
  if (!recipe) {
    throw new NotFoundError('Recipe');
  }
  
  const availability = await recipe.checkAvailability(quantity);
  
  return availability;
};

/**
 * Calculate recipe cost
 */
const calculateRecipeCost = async (recipeId, tenantId) => {
  const recipe = await Recipe.findOne({ _id: recipeId, tenantId, isActive: true })
    .populate('ingredients.inventoryItemId', 'unitCost');
  
  if (!recipe) {
    throw new NotFoundError('Recipe');
  }
  
  const totalCost = await recipe.calculateTotalCost();
  
  return {
    recipeId: recipe._id,
    dishId: recipe.dishId,
    totalCost,
    ingredients: recipe.ingredients.map(ing => ({
      inventoryItemId: ing.inventoryItemId._id,
      quantity: ing.quantity,
      unit: ing.unit,
      cost: ing.cost
    }))
  };
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  getRecipeByDishId,
  updateRecipe,
  deleteRecipe,
  checkRecipeAvailability,
  calculateRecipeCost
};
