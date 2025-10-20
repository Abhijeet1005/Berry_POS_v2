const express = require('express');
const router = express.Router();
const notificationController = require('./notificationController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const notificationValidation = require('./notificationValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Send notification (admin, manager, captain)
router.post(
  '/send',
  rbacMiddleware(['admin', 'manager', 'captain']),
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
  rbacMiddleware(['admin', 'manager']),
  validate(notificationValidation.createTemplate),
  notificationController.createTemplate
);

router.get(
  '/templates',
  rbacMiddleware(['admin', 'manager']),
  validate(notificationValidation.getTemplates),
  notificationController.getTemplates
);

router.get(
  '/templates/:id',
  rbacMiddleware(['admin', 'manager']),
  validate(notificationValidation.getTemplateById),
  notificationController.getTemplateById
);

router.put(
  '/templates/:id',
  rbacMiddleware(['admin', 'manager']),
  validate(notificationValidation.updateTemplate),
  notificationController.updateTemplate
);

router.delete(
  '/templates/:id',
  rbacMiddleware(['admin', 'manager']),
  validate(notificationValidation.deleteTemplate),
  notificationController.deleteTemplate
);

module.exports = router;
