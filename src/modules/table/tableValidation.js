const Joi = require('joi');
const { commonSchemas } = require('../../middleware/validationMiddleware');
const { TABLE_STATUS } = require('../../config/constants');

const createTableSchema = Joi.object({
  outletId: commonSchemas.objectId.required(),
  tableNumber: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  section: Joi.string()
});

const updateTableSchema = Joi.object({
  tableNumber: Joi.string(),
  capacity: Joi.number().integer().min(1),
  section: Joi.string()
});

const updateTableStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(TABLE_STATUS)).required()
});

const transferOrderSchema = Joi.object({
  fromTableId: commonSchemas.objectId.required(),
  toTableId: commonSchemas.objectId.required()
});

const mergeTablesSchema = Joi.object({
  tableIds: Joi.array().items(commonSchemas.objectId).min(2).required()
});

module.exports = {
  createTableSchema,
  updateTableSchema,
  updateTableStatusSchema,
  transferOrderSchema,
  mergeTablesSchema
};
