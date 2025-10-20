const express = require('express');
const router = express.Router();
const feedbackController = require('./feedbackController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const feedbackValidation = require('./feedbackValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Create feedback (all authenticated users)
router.post(
  '/',
  validate(feedbackValidation.createFeedback),
  feedbackController.createFeedback
);

// Get all feedback (admin, manager)
router.get(
  '/',
  rbacMiddleware(['admin', 'manager']),
  validate(feedbackValidation.getAllFeedback),
  feedbackController.getAllFeedback
);

// Get feedback analytics (admin, manager)
router.get(
  '/analytics',
  rbacMiddleware(['admin', 'manager']),
  validate(feedbackValidation.getFeedbackAnalytics),
  feedbackController.getFeedbackAnalytics
);

// Get feedback by order (all authenticated users)
router.get(
  '/order/:orderId',
  validate(feedbackValidation.getFeedbackByOrder),
  feedbackController.getFeedbackByOrder
);

// Get feedback by ID (all authenticated users)
router.get(
  '/:id',
  validate(feedbackValidation.getFeedbackById),
  feedbackController.getFeedbackById
);

// Respond to feedback (admin, manager)
router.post(
  '/:id/respond',
  rbacMiddleware(['admin', 'manager']),
  validate(feedbackValidation.respondToFeedback),
  feedbackController.respondToFeedback
);

module.exports = router;
