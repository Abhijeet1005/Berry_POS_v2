const Joi = require('joi');
const { commonSchemas } = require('../../middleware/validationMiddleware');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../../config/constants');

const createPaymentSchema = Joi.object({
  orderId: commonSchemas.objectId.required(),
  amount: Joi.number().positive().required(),
  paymentMethods: Joi.array().items(Joi.object({
    method: Joi.string().valid(...Object.values(PAYMENT_METHODS)).required(),
    amount: Joi.number().positive().required(),
    transactionId: Joi.string()
  })).min(1).required()
});

const splitPaymentSchema = Joi.object({
  orderId: commonSchemas.objectId.required(),
  paymentMethods: Joi.array().items(Joi.object({
    method: Joi.string().valid(...Object.values(PAYMENT_METHODS)).required(),
    amount: Joi.number().positive().required(),
    transactionId: Joi.string()
  })).min(2).required()
});

const updatePaymentStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(PAYMENT_STATUS)).required(),
  transactionDetails: Joi.object({
    method: Joi.string().valid(...Object.values(PAYMENT_METHODS)).required(),
    transactionId: Joi.string().required()
  })
});

const refundSchema = Joi.object({
  reason: Joi.string().required()
});

const createRazorpayOrderSchema = Joi.object({
  orderId: commonSchemas.objectId.required(),
  amount: Joi.number().positive().required()
});

const verifyPaymentSchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required()
});

module.exports = {
  createPaymentSchema,
  splitPaymentSchema,
  updatePaymentStatusSchema,
  refundSchema,
  createRazorpayOrderSchema,
  verifyPaymentSchema
};
