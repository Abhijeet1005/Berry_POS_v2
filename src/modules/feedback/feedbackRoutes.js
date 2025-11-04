const express = require('express');
const router = express.Router();
const feedbackController = require('./feedbackController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const feedbackValidation = require('./feedbackValidation');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Create feedback (all authenticated users)
router.post(
  '/',
  validate(feedbackValidation.createFeedback),
  feedbackController.createFeedback
);

// Get all feedback (admin, manager)
router.get(
  '/',
  requirePermission('admin.access'),
  validate(feedbackValidation.getAllFeedback, 'query'),
  feedbackController.getAllFeedback
);

// Get feedback analytics (admin, manager)
router.get(
  '/analytics',
  requirePermission('admin.access'),
  validate(feedbackValidation.getFeedbackAnalytics, 'query'),
  feedbackController.getFeedbackAnalytics
);

// Get feedback by order (all authenticated users)
router.get(
  '/order/:orderId',
  validateObjectId('orderId'),
  feedbackController.getFeedbackByOrder
);

// Get feedback by ID (all authenticated users)
router.get(
  '/:id',
  validateObjectId('id'),
  feedbackController.getFeedbackById
);

// Respond to feedback (admin, manager)
router.post(
  '/:id/respond',
  validateObjectId('id'),
  requirePermission('admin.access'),
  validate(feedbackValidation.respondToFeedback),
  feedbackController.respondToFeedback
);

module.exports = router;
