const express = require('express');
const router = express.Router();
const couponController = require('./couponController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const couponValidation = require('./couponValidation');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Create coupon (admin, manager)
router.post(
  '/',
  requirePermission('admin.access'),
  validate(couponValidation.createCoupon),
  couponController.createCoupon
);

// Get all coupons (admin, manager, cashier, captain)
router.get(
  '/',
  requirePermission('coupons.read'),
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
  requirePermission('admin.access'),
  validate(couponValidation.updateCoupon),
  couponController.updateCoupon
);

// Delete coupon (admin, manager)
router.delete(
  '/:id',
  requirePermission('admin.access'),
  validate(couponValidation.deleteCoupon),
  couponController.deleteCoupon
);

// Get coupon usage (admin, manager)
router.get(
  '/:id/usage',
  requirePermission('admin.access'),
  validate(couponValidation.getCouponUsage),
  couponController.getCouponUsage
);

module.exports = router;
