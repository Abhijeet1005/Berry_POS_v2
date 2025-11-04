const Joi = require('joi');

const createFeedback = Joi.object({
  orderId: Joi.string().required(),
  customerId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow(''),
  categories: Joi.array().items(Joi.string().valid('food', 'service', 'ambience', 'value', 'cleanliness'))
});

const getFeedbackById = Joi.object({
  id: Joi.string().required()
});

const getFeedbackByOrder = Joi.object({
  orderId: Joi.string().required()
});

const respondToFeedback = Joi.object({
  response: Joi.string().required(),
  couponCode: Joi.string(),
  loyaltyBonus: Joi.number().integer().min(0)
});

const getFeedbackAnalytics = Joi.object({
  outletId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

const getAllFeedback = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  outletId: Joi.string(),
  rating: Joi.number().integer().min(1).max(5),
  sentiment: Joi.string().valid('positive', 'neutral', 'negative'),
  hasResponse: Joi.string().valid('true', 'false')
});

module.exports = {
  createFeedback,
  getFeedbackById,
  getFeedbackByOrder,
  respondToFeedback,
  getFeedbackAnalytics,
  getAllFeedback
};
