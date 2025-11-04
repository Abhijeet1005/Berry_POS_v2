const Joi = require('joi');

const createCoupon = Joi.object({
  code: Joi.string().uppercase().min(3).max(20).required(),
  description: Joi.string(),
  type: Joi.string().valid('percentage', 'fixed').required(),
  value: Joi.number().min(0).required(),
  minOrderValue: Joi.number().min(0),
  maxDiscount: Joi.number().min(0),
  validFrom: Joi.date().iso(),
  validUntil: Joi.date().iso().min(Joi.ref('validFrom')),
  usageLimit: Joi.number().integer().min(1),
  perUserLimit: Joi.number().integer().min(1),
  applicableOutlets: Joi.array().items(Joi.string()),
  applicableDishes: Joi.array().items(Joi.string()),
  applicableCategories: Joi.array().items(Joi.string()),
  campaignId: Joi.string()
});

const getCoupons = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.string().valid('true', 'false'),
  outletId: Joi.string(),
  campaignId: Joi.string()
});

const updateCoupon = Joi.object({
  description: Joi.string(),
  value: Joi.number().min(0),
  minOrderValue: Joi.number().min(0),
  maxDiscount: Joi.number().min(0),
  validFrom: Joi.date().iso(),
  validUntil: Joi.date().iso(),
  usageLimit: Joi.number().integer().min(1),
  perUserLimit: Joi.number().integer().min(1),
  applicableOutlets: Joi.array().items(Joi.string()),
  applicableDishes: Joi.array().items(Joi.string()),
  applicableCategories: Joi.array().items(Joi.string()),
  isActive: Joi.boolean()
}).min(1);

const validateCoupon = Joi.object({
  code: Joi.string().required(),
  customerId: Joi.string(),
  outletId: Joi.string().required(),
  orderTotal: Joi.number().min(0).required(),
  items: Joi.array().items(Joi.object({
    dishId: Joi.string(),
    category: Joi.string()
  }))
});

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon
};
