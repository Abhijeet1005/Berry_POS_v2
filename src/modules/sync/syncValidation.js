const Joi = require('joi');

const pushSync = Joi.object({
  entity: Joi.string().valid('order', 'payment', 'customer', 'table', 'dish').required(),
  entityId: Joi.string(),
  action: Joi.string().valid('create', 'update', 'delete').required(),
  data: Joi.object().required(),
  clientTimestamp: Joi.date().iso().required(),
  deviceId: Joi.string().required()
});

const pullSync = Joi.object({
  entities: Joi.array().items(
    Joi.string().valid('order', 'payment', 'customer', 'table', 'dish')
  ).min(1).required(),
  lastSyncTimestamp: Joi.date().iso(),
  deviceId: Joi.string().required()
});

const getSyncStatus = Joi.object({
  deviceId: Joi.string(),
  entity: Joi.string().valid('order', 'payment', 'customer', 'table', 'dish')
});

const resolveConflict = Joi.object({
  syncId: Joi.string().required(),
  resolution: Joi.string().valid('server_wins', 'client_wins', 'merge').required(),
  data: Joi.object()
});

module.exports = {
  pushSync,
  pullSync,
  getSyncStatus,
  resolveConflict
};
