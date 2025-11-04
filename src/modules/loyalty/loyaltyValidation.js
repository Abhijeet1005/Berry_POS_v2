const Joi = require('joi');

const earnPoints = Joi.object({
  customerId: Joi.string().required(),
  orderId: Joi.string(),
  outletId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  reason: Joi.string().valid('order', 'feedback', 'signup', 'bonus').required()
});

const redeemPoints = Joi.object({
  customerId: Joi.string().required(),
  orderId: Joi.string(),
  outletId: Joi.string().required(),
  points: Joi.number().integer().min(1).required()
});

const getLoyaltyRules = Joi.object({
  outletId: Joi.string().required()
});

const updateLoyaltyRules = Joi.object({
  earningRate: Joi.number().min(0),
  redemptionRate: Joi.number().min(0),
  minimumRedemption: Joi.number().integer().min(0),
  feedbackBonus: Joi.number().integer().min(0),
  signupBonus: Joi.number().integer().min(0)
}).min(1);

const getLoyaltyHistory = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('earn', 'redeem'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

module.exports = {
  earnPoints,
  redeemPoints,
  getLoyaltyRules,
  updateLoyaltyRules,
  getLoyaltyHistory
};
