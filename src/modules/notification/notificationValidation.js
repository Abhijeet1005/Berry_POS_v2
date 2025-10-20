const Joi = require('joi');

const sendNotification = {
  body: Joi.object({
    userId: Joi.string(),
    customerId: Joi.string(),
    channels: Joi.array().items(Joi.string().valid('push', 'sms', 'email', 'whatsapp')).min(1).required(),
    title: Joi.string().required(),
    body: Joi.string().required(),
    phone: Joi.string(),
    email: Joi.string().email(),
    data: Joi.object()
  })
};

const getNotificationById = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

const getUserNotifications = {
  params: Joi.object({
    userId: Joi.string().required()
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('sent', 'delivered', 'read', 'failed')
  })
};

const createTemplate = {
  body: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('order', 'reservation', 'feedback', 'payment', 'promotion', 'alert').required(),
    channel: Joi.string().valid('push', 'sms', 'email', 'whatsapp').required(),
    subject: Joi.string(),
    body: Joi.string().required(),
    variables: Joi.array().items(Joi.string())
  })
};

const getTemplates = {
  query: Joi.object({
    type: Joi.string().valid('order', 'reservation', 'feedback', 'payment', 'promotion', 'alert'),
    channel: Joi.string().valid('push', 'sms', 'email', 'whatsapp')
  })
};

const getTemplateById = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

const updateTemplate = {
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
    name: Joi.string(),
    subject: Joi.string(),
    body: Joi.string(),
    variables: Joi.array().items(Joi.string())
  }).min(1)
};

const deleteTemplate = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

module.exports = {
  sendNotification,
  getNotificationById,
  getUserNotifications,
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate
};
