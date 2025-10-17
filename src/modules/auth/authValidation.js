const Joi = require('joi');
const { commonSchemas } = require('../../middleware/validationMiddleware');
const { ROLES } = require('../../config/constants');

const registerSchema = Joi.object({
  email: commonSchemas.email.required(),
  password: commonSchemas.password.required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: commonSchemas.phone.required(),
  role: Joi.string().valid(...Object.values(ROLES)).required(),
  tenantId: commonSchemas.objectId.required(),
  outletId: commonSchemas.objectId
});

const loginSchema = Joi.object({
  email: commonSchemas.email.required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: commonSchemas.email.required()
});

const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: commonSchemas.password.required()
});

const verify2FASchema = Joi.object({
  token: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

const disable2FASchema = Joi.object({
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2FASchema,
  disable2FASchema
};
