const Joi = require('joi');
const { commonSchemas } = require('../../middleware/validationMiddleware');
const { TENANT_TYPES, SUBSCRIPTION_STATUS } = require('../../config/constants');

const createTenantSchema = Joi.object({
  type: Joi.string().valid(...Object.values(TENANT_TYPES)).required(),
  name: Joi.string().min(2).max(100).required(),
  parentId: commonSchemas.objectId,
  contactInfo: Joi.object({
    email: commonSchemas.email.required(),
    phone: commonSchemas.phone.required(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zipCode: Joi.string()
    })
  }).required(),
  subscription: Joi.object({
    tier: Joi.string(),
    status: Joi.string().valid(...Object.values(SUBSCRIPTION_STATUS)),
    startDate: Joi.date(),
    endDate: Joi.date(),
    billingCycle: Joi.string().valid('monthly', 'quarterly', 'annual')
  }),
  settings: Joi.object()
});

const updateTenantSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  contactInfo: Joi.object({
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zipCode: Joi.string()
    })
  }),
  settings: Joi.object()
});

const createOutletSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  contactInfo: Joi.object({
    email: commonSchemas.email.required(),
    phone: commonSchemas.phone.required(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zipCode: Joi.string()
    })
  }).required(),
  settings: Joi.object()
});

const updateSubscriptionSchema = Joi.object({
  tier: Joi.string(),
  status: Joi.string().valid(...Object.values(SUBSCRIPTION_STATUS)),
  startDate: Joi.date(),
  endDate: Joi.date(),
  billingCycle: Joi.string().valid('monthly', 'quarterly', 'annual')
});

module.exports = {
  createTenantSchema,
  updateTenantSchema,
  createOutletSchema,
  updateSubscriptionSchema
};
