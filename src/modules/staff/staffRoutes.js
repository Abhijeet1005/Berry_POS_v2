const express = require('express');
const router = express.Router();
const staffController = require('./staffController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const staffValidation = require('./staffValidation');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Create staff member (admin only)
router.post(
  '/',
  requirePermission('staff.create'),
  validate(staffValidation.createStaff),
  staffController.createStaff
);

// Get all staff (admin, manager)
router.get(
  '/',
  requirePermission('staff.read'),
  validate(staffValidation.getStaff),
  staffController.getStaff
);

// Get staff by outlet (admin, manager)
router.get(
  '/outlet/:outletId',
  requirePermission('staff.read'),
  validate(staffValidation.getStaffByOutlet),
  staffController.getStaffByOutlet
);

// Get staff by ID (admin, manager)
router.get(
  '/:id',
  requirePermission('staff.read'),
  validate(staffValidation.getStaffById),
  staffController.getStaffMember
);

// Update staff (admin only)
router.put(
  '/:id',
  requirePermission('staff.update'),
  validate(staffValidation.updateStaff),
  staffController.updateStaff
);

// Delete staff (admin only)
router.delete(
  '/:id',
  requirePermission('staff.delete'),
  validate(staffValidation.deleteStaff),
  staffController.deleteStaff
);

// Get staff performance (admin, manager)
router.get(
  '/:id/performance',
  requirePermission('staff.read'),
  validate(staffValidation.getStaffPerformance),
  staffController.getStaffPerformance
);

module.exports = router;
