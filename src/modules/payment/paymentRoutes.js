const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const {
  createPaymentSchema,
  splitPaymentSchema,
  updatePaymentStatusSchema,
  refundSchema,
  createRazorpayOrderSchema,
  verifyPaymentSchema
} = require('./paymentValidation');

/**
 * @route   POST /api/v1/payments/razorpay/webhook
 * @desc    Handle Razorpay webhook (no auth required)
 * @access  Public (verified by signature)
 */
router.post(
  '/razorpay/webhook',
  paymentController.handleRazorpayWebhook
);

// All other routes require authentication and tenant context
router.use(authenticate);
router.use(injectTenantContext);

/**
 * @route   POST /api/v1/payments
 * @desc    Create a payment
 * @access  Private (Cashier+)
 */
router.post(
  '/',
  requirePermission('payments.create'),
  validate(createPaymentSchema),
  paymentController.createPayment
);

/**
 * @route   POST /api/v1/payments/split
 * @desc    Process split payment
 * @access  Private (Cashier+)
 */
router.post(
  '/split',
  requirePermission('payments.create'),
  validate(splitPaymentSchema),
  paymentController.processSplitPayment
);

/**
 * @route   POST /api/v1/payments/razorpay/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post(
  '/razorpay/create-order',
  requirePermission('payments.create'),
  validate(createRazorpayOrderSchema),
  paymentController.createRazorpayOrder
);

/**
 * @route   POST /api/v1/payments/razorpay/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post(
  '/razorpay/verify',
  requirePermission('payments.create'),
  validate(verifyPaymentSchema),
  paymentController.verifyRazorpayPayment
);

/**
 * @route   GET /api/v1/payments/order/:orderId
 * @desc    Get payments by order
 * @access  Private
 */
router.get(
  '/order/:orderId',
  validateObjectId('orderId'),
  requirePermission('payments.read'),
  paymentController.getPaymentsByOrder
);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  requirePermission('payments.read'),
  paymentController.getPayment
);

/**
 * @route   POST /api/v1/payments/:id/refund
 * @desc    Process refund
 * @access  Private (Manager+)
 */
router.post(
  '/:id/refund',
  validateObjectId('id'),
  requirePermission('payments.refund'),
  validate(refundSchema),
  paymentController.processRefund
);

/**
 * @route   GET /api/v1/payments/:id/receipt
 * @desc    Get payment receipt
 * @access  Private
 */
router.get(
  '/:id/receipt',
  validateObjectId('id'),
  requirePermission('payments.read'),
  paymentController.getReceipt
);

module.exports = router;
