const express = require('express');
const router = express.Router();
const orderController = require('./orderController');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  cancelOrderItemSchema,
  updateKOTStatusSchema
} = require('./orderValidation');

// All routes require authentication and tenant context
router.use(authenticate);
router.use(injectTenantContext);

// Order Routes

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post(
  '/orders',
  requirePermission('orders.create'),
  validate(createOrderSchema),
  orderController.createOrder
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders with filters
 * @access  Private
 */
router.get(
  '/orders',
  requirePermission('orders.read'),
  orderController.getOrders
);

/**
 * @route   GET /api/v1/orders/table/:tableId
 * @desc    Get orders by table
 * @access  Private
 */
router.get(
  '/orders/table/:tableId',
  validateObjectId('tableId'),
  requirePermission('orders.read'),
  orderController.getOrdersByTable
);

/**
 * @route   GET /api/v1/orders/customer/:customerId
 * @desc    Get orders by customer
 * @access  Private
 */
router.get(
  '/orders/customer/:customerId',
  validateObjectId('customerId'),
  requirePermission('orders.read'),
  orderController.getOrdersByCustomer
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get(
  '/orders/:id',
  validateObjectId('id'),
  requirePermission('orders.read'),
  orderController.getOrder
);

/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Update order
 * @access  Private
 */
router.put(
  '/orders/:id',
  validateObjectId('id'),
  requirePermission('orders.update'),
  validate(updateOrderSchema),
  orderController.updateOrder
);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.patch(
  '/orders/:id/status',
  validateObjectId('id'),
  requirePermission('orders.update'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

/**
 * @route   DELETE /api/v1/orders/:id/items/:itemId
 * @desc    Cancel order item
 * @access  Private
 */
router.delete(
  '/orders/:id/items/:itemId',
  validateObjectId('id'),
  requirePermission('orders.update'),
  validate(cancelOrderItemSchema),
  orderController.cancelOrderItem
);

/**
 * @route   POST /api/v1/orders/:id/kot
 * @desc    Generate KOT for order
 * @access  Private
 */
router.post(
  '/orders/:id/kot',
  validateObjectId('id'),
  requirePermission('orders.create'),
  orderController.generateKOT
);

// KOT Routes

/**
 * @route   GET /api/v1/kots
 * @desc    Get KOTs with filters
 * @access  Private
 */
router.get(
  '/kots',
  requirePermission('kot.read'),
  orderController.getKOTs
);

/**
 * @route   GET /api/v1/kots/:id
 * @desc    Get KOT by ID
 * @access  Private
 */
router.get(
  '/kots/:id',
  validateObjectId('id'),
  requirePermission('kot.read'),
  orderController.getKOT
);

/**
 * @route   PATCH /api/v1/kots/:id/status
 * @desc    Update KOT status
 * @access  Private
 */
router.patch(
  '/kots/:id/status',
  validateObjectId('id'),
  requirePermission('kot.update'),
  validate(updateKOTStatusSchema),
  orderController.updateKOTStatus
);

module.exports = router;
