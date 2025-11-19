const Joi = require('joi');
const { commonSchemas } = require('../../middleware/validationMiddleware');
const { ORDER_TYPES, ORDER_SOURCES, ORDER_STATUS, KOT_STATUS } = require('../../config/constants');

const createOrderSchema = Joi.object({
  outletId: commonSchemas.objectId.required(),
  customerId: commonSchemas.objectId,
  tableId: commonSchemas.objectId,
  orderType: Joi.string().valid(...Object.values(ORDER_TYPES)).required(),
  source: Joi.string().valid(...Object.values(ORDER_SOURCES)),
  items: Joi.array().items(Joi.object({
    dishId: commonSchemas.objectId.required(),
    quantity: Joi.number().integer().min(1).required(),
    portionSize: Joi.string(),
    customization: Joi.string().max(200)
  })).min(1).required(),
  specialInstructions: Joi.string().max(500)
});

const updateOrderSchema = Joi.object({
  specialInstructions: Joi.string().max(500),
  couponCode: Joi.string(),
  loyaltyPointsUsed: Joi.number().min(0)
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ORDER_STATUS)).required()
});

const cancelOrderItemSchema = Joi.object({
  reason: Joi.string().required()
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().min(3).max(200).required()
});

const updateKOTStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(KOT_STATUS)).required()
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  cancelOrderItemSchema,
  cancelOrderSchema,
  updateKOTStatusSchema
};
