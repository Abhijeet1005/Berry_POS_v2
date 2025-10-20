const Joi = require('joi');

const createCoupon = {
  body: Joi.object({
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
  })
};

const getCoupons = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isActive: Joi.string().valid('true', 'false'),
    outletId: Joi.string(),
    campaignId: Joi.string()
  })
};

const getCouponByCode = {
  params: Joi.object({
    code: Joi.string().required()
  })
};

const updateCoupon = {
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
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
  }).min(1)
};

const deleteCoupon = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

const validateCoupon = {
  body: Joi.object({
    code: Joi.string().required(),
    customerId: Joi.string(),
    outletId: Joi.string().required(),
    orderTotal: Joi.number().min(0).required(),
    items: Joi.array().items(Joi.object({
      dishId: Joi.string(),
      category: Joi.string()
    }))
  })
};

const getCouponUsage = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponUsage
};
