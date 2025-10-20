const Joi = require('joi');

const pushSync = {
  body: Joi.object({
    entity: Joi.string().valid('order', 'payment', 'customer', 'table', 'dish').required(),
    entityId: Joi.string(),
    action: Joi.string().valid('create', 'update', 'delete').required(),
    data: Joi.object().required(),
    clientTimestamp: Joi.date().iso().required(),
    deviceId: Joi.string().required()
  })
};

const pullSync = {
  body: Joi.object({
    entities: Joi.array().items(
      Joi.string().valid('order', 'payment', 'customer', 'table', 'dish')
    ).min(1).required(),
    lastSyncTimestamp: Joi.date().iso(),
    deviceId: Joi.string().required()
  })
};

const getSyncStatus = {
  query: Joi.object({
    deviceId: Joi.string(),
    entity: Joi.string().valid('order', 'payment', 'customer', 'table', 'dish')
  })
};

const resolveConflict = {
  body: Joi.object({
    syncId: Joi.string().required(),
    resolution: Joi.string().valid('server_wins', 'client_wins', 'merge').required(),
    data: Joi.object()
  })
};

const retrySync = {
  params: Joi.object({
    syncId: Joi.string().required()
  })
};

module.exports = {
  pushSync,
  pullSync,
  getSyncStatus,
  resolveConflict,
  retrySync
};
