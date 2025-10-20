const express = require('express');
const router = express.Router();
const staffController = require('./staffController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const staffValidation = require('./staffValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Create staff member (admin only)
router.post(
  '/',
  rbacMiddleware(['admin']),
  validate(staffValidation.createStaff),
  staffController.createStaff
);

// Get all staff (admin, manager)
router.get(
  '/',
  rbacMiddleware(['admin', 'manager']),
  validate(staffValidation.getStaff),
  staffController.getStaff
);

// Get staff by outlet (admin, manager)
router.get(
  '/outlet/:outletId',
  rbacMiddleware(['admin', 'manager']),
  validate(staffValidation.getStaffByOutlet),
  staffController.getStaffByOutlet
);

// Get staff by ID (admin, manager)
router.get(
  '/:id',
  rbacMiddleware(['admin', 'manager']),
  validate(staffValidation.getStaffById),
  staffController.getStaffMember
);

// Update staff (admin only)
router.put(
  '/:id',
  rbacMiddleware(['admin']),
  validate(staffValidation.updateStaff),
  staffController.updateStaff
);

// Delete staff (admin only)
router.delete(
  '/:id',
  rbacMiddleware(['admin']),
  validate(staffValidation.deleteStaff),
  staffController.deleteStaff
);

// Get staff performance (admin, manager)
router.get(
  '/:id/performance',
  rbacMiddleware(['admin', 'manager']),
  validate(staffValidation.getStaffPerformance),
  staffController.getStaffPerformance
);

module.exports = router;
