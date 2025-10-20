const Joi = require('joi');

const generateDishProfile = {
  body: Joi.object({
    name: Joi.string().required(),
    ingredients: Joi.array().items(Joi.string()).min(1).required(),
    category: Joi.string(),
    dietaryTags: Joi.array().items(Joi.string().valid('Veg', 'Non-Veg', 'Vegan', 'Jain', 'Eggetarian'))
  })
};

const analyzeNutrition = {
  body: Joi.object({
    dishName: Joi.string().required(),
    ingredients: Joi.array().items(Joi.string()).min(1).required(),
    portionSize: Joi.string()
  })
};

const getRecommendations = {
  params: Joi.object({
    customerId: Joi.string().required()
  }),
  query: Joi.object({
    outletId: Joi.string().required()
  })
};

const updateTasteProfile = {
  body: Joi.object({
    customerId: Joi.string().required()
  })
};

module.exports = {
  generateDishProfile,
  analyzeNutrition,
  getRecommendations,
  updateTasteProfile
};
