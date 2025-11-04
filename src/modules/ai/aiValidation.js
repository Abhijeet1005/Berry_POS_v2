const Joi = require('joi');

const generateDishProfile = Joi.object({
  name: Joi.string().required(),
  ingredients: Joi.array().items(Joi.string()).min(1).required(),
  category: Joi.string(),
  dietaryTags: Joi.array().items(Joi.string().valid('Veg', 'Non-Veg', 'Vegan', 'Jain', 'Eggetarian'))
});

const analyzeNutrition = Joi.object({
  dishName: Joi.string().required(),
  ingredients: Joi.array().items(Joi.string()).min(1).required(),
  portionSize: Joi.string()
});

const getRecommendations = Joi.object({
  outletId: Joi.string().required()
});

const updateTasteProfile = Joi.object({
  customerId: Joi.string().required()
});

module.exports = {
  generateDishProfile,
  analyzeNutrition,
  getRecommendations,
  updateTasteProfile
};
