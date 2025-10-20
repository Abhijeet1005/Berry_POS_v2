const express = require('express');
const router = express.Router();
const loyaltyController = require('./loyaltyController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const loyaltyValidation = require('./loyaltyValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Get customer loyalty balance (all authenticated users)
router.get(
  '/customer/:customerId',
  validate(loyaltyValidation.getCustomerLoyalty),
  loyaltyController.getCustomerLoyalty
);

// Earn loyalty points (admin, manager, cashier, captain)
router.post(
  '/earn',
  rbacMiddleware(['admin', 'manager', 'cashier', 'captain']),
  validate(loyaltyValidation.earnPoints),
  loyaltyController.earnPoints
);

// Redeem loyalty points (admin, manager, cashier, captain)
router.post(
  '/redeem',
  rbacMiddleware(['admin', 'manager', 'cashier', 'captain']),
  validate(loyaltyValidation.redeemPoints),
  loyaltyController.redeemPoints
);

// Get loyalty rules (all authenticated users)
router.get(
  '/rules',
  validate(loyaltyValidation.getLoyaltyRules),
  loyaltyController.getLoyaltyRules
);

// Update loyalty rules (admin, manager)
router.put(
  '/rules/:outletId',
  rbacMiddleware(['admin', 'manager']),
  validate(loyaltyValidation.updateLoyaltyRules),
  loyaltyController.updateLoyaltyRules
);

// Get loyalty transaction history (all authenticated users)
router.get(
  '/history/:customerId',
  validate(loyaltyValidation.getLoyaltyHistory),
  loyaltyController.getLoyaltyHistory
);

module.exports = router;
