const express = require('express');
const router = express.Router();
const customerController = require('./customerController');
const { customerAuthMiddleware } = require('../../middleware/customerAuthMiddleware');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const customerValidation = require('./customerValidation');

/**
 * Customer tenant middleware - gets tenantId from request body/query/header
 * For public endpoints (register, login) that don't have authentication
 */
const customerTenantMiddleware = (req, res, next) => {
  // Try to get tenantId from multiple sources
  const tenantId = req.body.tenantId || 
                   req.query.tenantId || 
                   req.headers['x-tenant-id'] ||
                   req.tenantId; // From auth middleware if authenticated
  
  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'tenantId is required (provide in body, query, or x-tenant-id header)'
      }
    });
  }
  
  req.tenantId = tenantId;
  next();
};

// Apply customer tenant middleware to all routes
router.use(customerTenantMiddleware);

// Auth routes (public)
router.post(
  '/auth/register',
  (req, res, next) => {
    console.log('✅ Reached customer register route');
    console.log('TenantId:', req.tenantId);
    console.log('Body:', req.body);
    next();
  },
  validate(customerValidation.register),
  customerController.register
);

router.post(
  '/auth/login',
  validate(customerValidation.login),
  customerController.login
);

router.post(
  '/auth/verify-otp',
  validate(customerValidation.verifyOTP),
  customerController.verifyOTP
);

// Menu routes (public - can browse without auth)
router.get(
  '/menu',
  validate(customerValidation.getMenu, 'query'),
  customerController.getMenu
);

// Protected routes (require customer authentication)
router.use(customerAuthMiddleware);

// Profile routes
router.get('/profile', customerController.getProfile);
router.put(
  '/profile',
  validate(customerValidation.updateProfile),
  customerController.updateProfile
);

// Cart routes
router.get('/cart', customerController.getCart);
router.post(
  '/cart',
  validate(customerValidation.addToCart),
  customerController.addToCart
);
router.put(
  '/cart/:itemId',
  validateObjectId('itemId'),
  validate(customerValidation.updateCartItem),
  customerController.updateCartItem
);
router.delete('/cart/:itemId', validateObjectId('itemId'), customerController.removeFromCart);
router.delete('/cart', customerController.clearCart);

// Order routes
router.post(
  '/orders',
  validate(customerValidation.placeOrder),
  customerController.placeOrder
);
router.get('/orders', customerController.getOrders);
router.get('/orders/:id', validateObjectId('id'), customerController.getOrderById);
router.post(
  '/orders/:id/cancel',
  validateObjectId('id'),
  validate(customerValidation.cancelOrder),
  customerController.cancelOrder
);

module.exports = router;
