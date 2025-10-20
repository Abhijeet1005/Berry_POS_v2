const express = require('express');
const router = express.Router();
const couponController = require('./couponController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const couponValidation = require('./couponValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Create coupon (admin, manager)
router.post(
  '/',
  rbacMiddleware(['admin', 'manager']),
  validate(couponValidation.createCoupon),
  couponController.createCoupon
);

// Get all coupons (admin, manager, cashier, captain)
router.get(
  '/',
  rbacMiddleware(['admin', 'manager', 'cashier', 'captain']),
  validate(couponValidation.getCoupons),
  couponController.getCoupons
);

// Validate coupon (all authenticated users)
router.post(
  '/validate',
  validate(couponValidation.validateCoupon),
  couponController.validateCoupon
);

// Get coupon by code (all authenticated users)
router.get(
  '/:code',
  validate(couponValidation.getCouponByCode),
  couponController.getCouponByCode
);

// Update coupon (admin, manager)
router.put(
  '/:id',
  rbacMiddleware(['admin', 'manager']),
  validate(couponValidation.updateCoupon),
  couponController.updateCoupon
);

// Delete coupon (admin, manager)
router.delete(
  '/:id',
  rbacMiddleware(['admin', 'manager']),
  validate(couponValidation.deleteCoupon),
  couponController.deleteCoupon
);

// Get coupon usage (admin, manager)
router.get(
  '/:id/usage',
  rbacMiddleware(['admin', 'manager']),
  validate(couponValidation.getCouponUsage),
  couponController.getCouponUsage
);

module.exports = router;
