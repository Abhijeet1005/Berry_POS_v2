const express = require('express');
const router = express.Router();
const customerController = require('./customerController');
const { customerAuthMiddleware } = require('../../middleware/customerAuthMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const customerValidation = require('./customerValidation');

// Apply tenant middleware to all routes
router.use(tenantMiddleware);

// Auth routes (public)
router.post(
  '/auth/register',
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
  validate(customerValidation.getMenu),
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
  validate(customerValidation.updateCartItem),
  customerController.updateCartItem
);
router.delete('/cart/:itemId', customerController.removeFromCart);
router.delete('/cart', customerController.clearCart);

// Order routes
router.post(
  '/orders',
  validate(customerValidation.placeOrder),
  customerController.placeOrder
);
router.get('/orders', customerController.getOrders);
router.get('/orders/:id', customerController.getOrderById);
router.post(
  '/orders/:id/cancel',
  validate(customerValidation.cancelOrder),
  customerController.cancelOrder
);

module.exports = router;
