const express = require('express');
const router = express.Router();
const analyticsController = require('./analyticsController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const analyticsValidation = require('./analyticsValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// All analytics endpoints require admin or manager role
router.use(rbacMiddleware(['admin', 'manager']));

// Get sales analytics
router.get(
  '/sales',
  validate(analyticsValidation.getSalesAnalytics),
  analyticsController.getSalesAnalytics
);

// Get dish analytics
router.get(
  '/dishes',
  validate(analyticsValidation.getDishAnalytics),
  analyticsController.getDishAnalytics
);

// Get customer analytics
router.get(
  '/customers',
  validate(analyticsValidation.getCustomerAnalytics),
  analyticsController.getCustomerAnalytics
);

// Get staff analytics
router.get(
  '/staff',
  validate(analyticsValidation.getStaffAnalytics),
  analyticsController.getStaffAnalytics
);

// Get campaign analytics
router.get(
  '/campaigns',
  validate(analyticsValidation.getCampaignAnalytics),
  analyticsController.getCampaignAnalytics
);

// Export report
router.post(
  '/reports/export',
  validate(analyticsValidation.exportReport),
  analyticsController.exportReport
);

module.exports = router;
