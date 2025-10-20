const express = require('express');
const router = express.Router();
const notificationController = require('./notificationController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const notificationValidation = require('./notificationValidation');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Send notification (admin, manager, captain)
router.post(
  '/send',
  requirePermission('admin.access'),
  validate(notificationValidation.sendNotification),
  notificationController.sendNotification
);

// Get notification by ID (all authenticated users)
router.get(
  '/:id',
  validate(notificationValidation.getNotificationById),
  notificationController.getNotificationById
);

// Get user notifications (all authenticated users)
router.get(
  '/user/:userId',
  validate(notificationValidation.getUserNotifications),
  notificationController.getUserNotifications
);

// Template management (admin, manager)
router.post(
  '/templates',
  requirePermission('admin.access'),
  validate(notificationValidation.createTemplate),
  notificationController.createTemplate
);

router.get(
  '/templates',
  requirePermission('admin.access'),
  validate(notificationValidation.getTemplates),
  notificationController.getTemplates
);

router.get(
  '/templates/:id',
  requirePermission('admin.access'),
  validate(notificationValidation.getTemplateById),
  notificationController.getTemplateById
);

router.put(
  '/templates/:id',
  requirePermission('admin.access'),
  validate(notificationValidation.updateTemplate),
  notificationController.updateTemplate
);

router.delete(
  '/templates/:id',
  requirePermission('admin.access'),
  validate(notificationValidation.deleteTemplate),
  notificationController.deleteTemplate
);

module.exports = router;
