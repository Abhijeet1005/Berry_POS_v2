const Joi = require('joi');

const getCustomerLoyalty = {
  params: Joi.object({
    customerId: Joi.string().required()
  })
};

const earnPoints = {
  body: Joi.object({
    customerId: Joi.string().required(),
    orderId: Joi.string(),
    outletId: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    reason: Joi.string().valid('order', 'feedback', 'signup', 'bonus').required()
  })
};

const redeemPoints = {
  body: Joi.object({
    customerId: Joi.string().required(),
    orderId: Joi.string(),
    outletId: Joi.string().required(),
    points: Joi.number().integer().min(1).required()
  })
};

const getLoyaltyRules = {
  query: Joi.object({
    outletId: Joi.string().required()
  })
};

const updateLoyaltyRules = {
  params: Joi.object({
    outletId: Joi.string().required()
  }),
  body: Joi.object({
    earningRate: Joi.number().min(0),
    redemptionRate: Joi.number().min(0),
    minimumRedemption: Joi.number().integer().min(0),
    feedbackBonus: Joi.number().integer().min(0),
    signupBonus: Joi.number().integer().min(0)
  }).min(1)
};

const getLoyaltyHistory = {
  params: Joi.object({
    customerId: Joi.string().required()
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: Joi.string().valid('earn', 'redeem'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  })
};

module.exports = {
  getCustomerLoyalty,
  earnPoints,
  redeemPoints,
  getLoyaltyRules,
  updateLoyaltyRules,
  getLoyaltyHistory
};
