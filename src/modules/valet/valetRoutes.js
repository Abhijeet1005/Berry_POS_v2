const express = require('express');
const router = express.Router();
const valetController = require('./valetController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const valetValidation = require('./valetValidation');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Create valet request (all authenticated users)
router.post(
  '/requests',
  validate(valetValidation.createValetRequest),
  valetController.createValetRequest
);

// Get active valet requests (admin, manager, captain)
router.get(
  '/requests',
  requirePermission('admin.access'),
  validate(valetValidation.getActiveRequests),
  valetController.getActiveRequests
);

// Get valet performance (admin, manager)
router.get(
  '/performance',
  requirePermission('admin.access'),
  validate(valetValidation.getValetPerformance),
  valetController.getValetPerformance
);

// Get customer valet requests (all authenticated users)
router.get(
  '/requests/customer/:customerId',
  validate(valetValidation.getCustomerRequests),
  valetController.getCustomerRequests
);

// Get valet request by ID (all authenticated users)
router.get(
  '/requests/:id',
  validate(valetValidation.getValetRequestById),
  valetController.getValetRequestById
);

// Update valet status (admin, manager, captain)
router.patch(
  '/requests/:id/status',
  requirePermission('admin.access'),
  validate(valetValidation.updateValetStatus),
  valetController.updateValetStatus
);

module.exports = router;
