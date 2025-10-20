const notificationService = require('./notificationService');
const templateService = require('./templateService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Send notification
 * POST /api/v1/notifications/send
 */
const sendNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.sendNotification(req.body, req.tenantId);
  
  res.json(successResponse(result, 'Notification sent successfully'));
});

/**
 * Get notification by ID
 * GET /api/v1/notifications/:id
 */
const getNotificationById = asyncHandler(async (req, res) => {
  // TODO: Implement notification storage and retrieval
  res.json(successResponse({ id: req.params.id }, 'Notification retrieved successfully'));
});

/**
 * Get user notifications
 * GET /api/v1/notifications/user/:userId
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  // TODO: Implement notification history retrieval
  res.json(successResponse([], 'User notifications retrieved successfully'));
});

/**
 * Create notification template
 * POST /api/v1/notifications/templates
 */
const createTemplate = asyncHandler(async (req, res) => {
  const template = await templateService.createTemplate(req.body, req.tenantId);
  
  res.status(201).json(successResponse(template, 'Template created successfully'));
});

/**
 * Get all templates
 * GET /api/v1/notifications/templates
 */
const getTemplates = asyncHandler(async (req, res) => {
  const templates = await templateService.getTemplates(req.query, req.tenantId);
  
  res.json(successResponse(templates, 'Templates retrieved successfully'));
});

/**
 * Get template by ID
 * GET /api/v1/notifications/templates/:id
 */
const getTemplateById = asyncHandler(async (req, res) => {
  const template = await templateService.getTemplateById(req.params.id, req.tenantId);
  
  res.json(successResponse(template, 'Template retrieved successfully'));
});

/**
 * Update template
 * PUT /api/v1/notifications/templates/:id
 */
const updateTemplate = asyncHandler(async (req, res) => {
  const template = await templateService.updateTemplate(req.params.id, req.body, req.tenantId);
  
  res.json(successResponse(template, 'Template updated successfully'));
});

/**
 * Delete template
 * DELETE /api/v1/notifications/templates/:id
 */
const deleteTemplate = asyncHandler(async (req, res) => {
  await templateService.deleteTemplate(req.params.id, req.tenantId);
  
  res.json(successResponse(null, 'Template deleted successfully'));
});

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
