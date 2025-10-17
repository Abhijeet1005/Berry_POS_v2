const Joi = require('joi');
const { commonSchemas } = require('../../middleware/validationMiddleware');
const { DIETARY_TAGS } = require('../../config/constants');

const createDishSchema = Joi.object({
  outletId: commonSchemas.objectId.required(),
  name: Joi.string().min(2).max(100).required(),
  description: Joi.object({
    short: Joi.string().max(100),
    detailed: Joi.string().max(500)
  }),
  categoryId: commonSchemas.objectId.required(),
  images: Joi.array().items(Joi.string().uri()),
  price: Joi.number().positive().required(),
  portionSizes: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    servings: Joi.number().positive().default(1)
  })),
  dietaryTags: Joi.array().items(Joi.string().valid(...Object.values(DIETARY_TAGS))),
  allergens: Joi.array().items(Joi.string()),
  ingredients: Joi.array().items(Joi.string()),
  nutritionInfo: Joi.object({
    calories: Joi.number(),
    protein: Joi.number(),
    carbs: Joi.number(),
    fats: Joi.number(),
    fiber: Joi.number()
  }),
  tasteFactor: Joi.object({
    spicy: Joi.number().min(0).max(10),
    sweet: Joi.number().min(0).max(10),
    tangy: Joi.number().min(0).max(10),
    salty: Joi.number().min(0).max(10),
    bitter: Joi.number().min(0).max(10)
  }),
  prepTime: Joi.number().positive(),
  stock: Joi.number().min(0),
  tags: Joi.array().items(Joi.string().valid('chef-special', 'seasonal', 'most-ordered', 'staff-pick', 'new')),
  taxRate: Joi.number().min(0).max(100)
});

const updateDishSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.object({
    short: Joi.string().max(100),
    detailed: Joi.string().max(500)
  }),
  categoryId: commonSchemas.objectId,
  images: Joi.array().items(Joi.string().uri()),
  price: Joi.number().positive(),
  portionSizes: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    servings: Joi.number().positive()
  })),
  dietaryTags: Joi.array().items(Joi.string().valid(...Object.values(DIETARY_TAGS))),
  allergens: Joi.array().items(Joi.string()),
  ingredients: Joi.array().items(Joi.string()),
  nutritionInfo: Joi.object({
    calories: Joi.number(),
    protein: Joi.number(),
    carbs: Joi.number(),
    fats: Joi.number(),
    fiber: Joi.number()
  }),
  tasteFactor: Joi.object({
    spicy: Joi.number().min(0).max(10),
    sweet: Joi.number().min(0).max(10),
    tangy: Joi.number().min(0).max(10),
    salty: Joi.number().min(0).max(10),
    bitter: Joi.number().min(0).max(10)
  }),
  prepTime: Joi.number().positive(),
  stock: Joi.number().min(0),
  tags: Joi.array().items(Joi.string().valid('chef-special', 'seasonal', 'most-ordered', 'staff-pick', 'new')),
  taxRate: Joi.number().min(0).max(100)
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().positive().required(),
  operation: Joi.string().valid('increment', 'decrement', 'set').required()
});

const searchDishesSchema = Joi.object({
  query: Joi.string(),
  outletId: commonSchemas.objectId,
  dietaryTags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  excludeAllergens: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  maxPrepTime: Joi.number().positive(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  availableOnly: Joi.string().valid('true', 'false'),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100)
});

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  image: Joi.string().uri(),
  kitchenSection: Joi.string().valid('kitchen', 'bar', 'dessert', 'bakery', 'grill').default('kitchen'),
  displayOrder: Joi.number().integer().min(0).default(0)
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  image: Joi.string().uri(),
  kitchenSection: Joi.string().valid('kitchen', 'bar', 'dessert', 'bakery', 'grill'),
  displayOrder: Joi.number().integer().min(0)
});

module.exports = {
  createDishSchema,
  updateDishSchema,
  updateStockSchema,
  searchDishesSchema,
  createCategorySchema,
  updateCategorySchema
};
