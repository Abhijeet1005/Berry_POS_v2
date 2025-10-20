const aiService = require('./aiService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Generate dish profile
 * POST /api/v1/ai/generate-dish-profile
 */
const generateDishProfile = asyncHandler(async (req, res) => {
  const profile = await aiService.generateDishProfile(req.body);
  
  res.json(successResponse(profile, 'Dish profile generated successfully'));
});

/**
 * Analyze nutrition
 * POST /api/v1/ai/analyze-nutrition
 */
const analyzeNutrition = asyncHandler(async (req, res) => {
  const { dishName, ingredients, portionSize } = req.body;
  
  const nutrition = await aiService.analyzeNutrition(dishName, ingredients, portionSize);
  
  res.json(successResponse(nutrition, 'Nutrition analysis completed'));
});

/**
 * Get personalized recommendations
 * GET /api/v1/ai/recommendations/:customerId
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { outletId } = req.query;
  
  const result = await aiService.getRecommendations(customerId, req.tenantId, outletId);
  
  res.json(successResponse(result, 'Recommendations retrieved successfully'));
});

/**
 * Update taste profile
 * POST /api/v1/ai/update-taste-profile
 */
const updateTasteProfile = asyncHandler(async (req, res) => {
  const { customerId } = req.body;
  
  const result = await aiService.updateTasteProfile(customerId, req.tenantId);
  
  res.json(successResponse(result, 'Taste profile updated successfully'));
});

module.exports = {
  generateDishProfile,
  analyzeNutrition,
  getRecommendations,
  updateTasteProfile
};
