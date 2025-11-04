const Joi = require('joi');

const sendNotification = Joi.object({
  userId: Joi.string(),
  customerId: Joi.string(),
  channels: Joi.array().items(Joi.string().valid('push', 'sms', 'email', 'whatsapp')).min(1).required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  phone: Joi.string(),
  email: Joi.string().email(),
  data: Joi.object()
});

const getUserNotifications = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('sent', 'delivered', 'read', 'failed')
});

const createTemplate = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('order', 'reservation', 'feedback', 'payment', 'promotion', 'alert').required(),
  channel: Joi.string().valid('push', 'sms', 'email', 'whatsapp').required(),
  subject: Joi.string(),
  body: Joi.string().required(),
  variables: Joi.array().items(Joi.string())
});

const getTemplates = Joi.object({
  type: Joi.string().valid('order', 'reservation', 'feedback', 'payment', 'promotion', 'alert'),
  channel: Joi.string().valid('push', 'sms', 'email', 'whatsapp')
});

const updateTemplate = Joi.object({
  name: Joi.string(),
  subject: Joi.string(),
  body: Joi.string(),
  variables: Joi.array().items(Joi.string())
}).min(1);

module.exports = {
  sendNotification,
  getUserNotifications,
  createTemplate,
  getTemplates,
  updateTemplate
};
