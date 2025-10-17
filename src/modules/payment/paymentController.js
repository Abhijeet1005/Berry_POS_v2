const paymentService = require('./paymentService');
const razorpayService = require('./razorpayService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');
const { AuthenticationError } = require('../../utils/errorHandler');

/**
 * Create payment
 * POST /api/v1/payments
 */
const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req.tenantId);
  
  res.status(201).json(successResponse(payment, 'Payment created successfully'));
});

/**
 * Get payment by ID
 * GET /api/v1/payments/:id
 */
const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, req.tenantId);
  
  res.json(successResponse(payment, 'Payment retrieved successfully'));
});

/**
 * Get payments by order
 * GET /api/v1/payments/order/:orderId
 */
const getPaymentsByOrder = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentsByOrder(req.params.orderId, req.tenantId);
  
  res.json(successResponse(payments, 'Payments retrieved successfully'));
});

/**
 * Process split payment
 * POST /api/v1/payments/split
 */
const processSplitPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethods } = req.body;
  const payment = await paymentService.processSplitPayment(orderId, paymentMethods, req.tenantId);
  
  res.status(201).json(successResponse(payment, 'Split payment processed successfully'));
});

/**
 * Process refund
 * POST /api/v1/payments/:id/refund
 */
const processRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const payment = await paymentService.processRefund(req.params.id, reason, req.tenantId);
  
  res.json(successResponse(payment, 'Refund processed successfully'));
});

/**
 * Get receipt
 * GET /api/v1/payments/:id/receipt
 */
const getReceipt = asyncHandler(async (req, res) => {
  const receipt = await paymentService.getReceipt(req.params.id, req.tenantId);
  
  res.json(successResponse(receipt, 'Receipt retrieved successfully'));
});

/**
 * Create Razorpay order
 * POST /api/v1/payments/razorpay/create-order
 */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;
  const razorpayOrder = await razorpayService.createRazorpayOrder(orderId, amount);
  
  res.status(201).json(successResponse(razorpayOrder, 'Razorpay order created successfully'));
});

/**
 * Verify Razorpay payment
 * POST /api/v1/payments/razorpay/verify
 */
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  
  const isValid = razorpayService.verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );
  
  if (!isValid) {
    throw new AuthenticationError('Invalid payment signature');
  }
  
  res.json(successResponse({ verified: true }, 'Payment verified successfully'));
});

/**
 * Razorpay webhook handler
 * POST /api/v1/payments/razorpay/webhook
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  // Verify webhook signature
  const isValid = razorpayService.verifyWebhookSignature(req.body, signature);
  
  if (!isValid) {
    throw new AuthenticationError('Invalid webhook signature');
  }
  
  const { event, payload } = req.body;
  
  // Process webhook event
  const eventData = await razorpayService.processWebhookEvent(event, payload);
  
  // Update payment status based on event
  if (eventData.orderId && eventData.status) {
    // Find payment by Razorpay order ID and update status
    // This would require storing razorpayOrderId in payment record
    // For now, just acknowledge the webhook
  }
  
  res.json({ status: 'ok' });
});

module.exports = {
  createPayment,
  getPayment,
  getPaymentsByOrder,
  processSplitPayment,
  processRefund,
  getReceipt,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook
};
