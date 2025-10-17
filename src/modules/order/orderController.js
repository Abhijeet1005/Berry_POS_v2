const orderService = require('./orderService');
const kotService = require('./kotService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

// Order Controllers

/**
 * Create order
 * POST /api/v1/orders
 */
const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.tenantId, req.userId);
  
  res.status(201).json(successResponse(order, 'Order created successfully'));
});

/**
 * Get all orders
 * GET /api/v1/orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.orders,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

/**
 * Get order by ID
 * GET /api/v1/orders/:id
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.tenantId);
  
  res.json(successResponse(order, 'Order retrieved successfully'));
});

/**
 * Update order
 * PUT /api/v1/orders/:id
 */
const updateOrder = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body, req.tenantId);
  
  res.json(successResponse(order, 'Order updated successfully'));
});

/**
 * Update order status
 * PATCH /api/v1/orders/:id/status
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status, req.tenantId);
  
  res.json(successResponse(order, 'Order status updated successfully'));
});

/**
 * Cancel order item
 * DELETE /api/v1/orders/:id/items/:itemId
 */
const cancelOrderItem = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.cancelOrderItem(
    req.params.id,
    req.params.itemId,
    reason,
    req.tenantId
  );
  
  res.json(successResponse(order, 'Order item cancelled successfully'));
});

/**
 * Generate KOT for order
 * POST /api/v1/orders/:id/kot
 */
const generateKOT = asyncHandler(async (req, res) => {
  const kots = await kotService.generateKOT(req.params.id, req.tenantId);
  
  res.status(201).json(successResponse(kots, 'KOT generated successfully'));
});

/**
 * Get orders by table
 * GET /api/v1/orders/table/:tableId
 */
const getOrdersByTable = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrdersByTable(req.params.tableId, req.tenantId);
  
  res.json(successResponse(orders, 'Orders retrieved successfully'));
});

/**
 * Get orders by customer
 * GET /api/v1/orders/customer/:customerId
 */
const getOrdersByCustomer = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrdersByCustomer(req.params.customerId, req.tenantId);
  
  res.json(successResponse(orders, 'Orders retrieved successfully'));
});

// KOT Controllers

/**
 * Get KOT by ID
 * GET /api/v1/kots/:id
 */
const getKOT = asyncHandler(async (req, res) => {
  const kot = await kotService.getKOTById(req.params.id, req.tenantId);
  
  res.json(successResponse(kot, 'KOT retrieved successfully'));
});

/**
 * Get KOTs with filters
 * GET /api/v1/kots
 */
const getKOTs = asyncHandler(async (req, res) => {
  const kots = await kotService.getKOTs(req.query, req.tenantId);
  
  res.json(successResponse(kots, 'KOTs retrieved successfully'));
});

/**
 * Update KOT status
 * PATCH /api/v1/kots/:id/status
 */
const updateKOTStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const kot = await kotService.updateKOTStatus(req.params.id, status, req.tenantId);
  
  res.json(successResponse(kot, 'KOT status updated successfully'));
});

module.exports = {
  // Order controllers
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrderItem,
  generateKOT,
  getOrdersByTable,
  getOrdersByCustomer,
  
  // KOT controllers
  getKOT,
  getKOTs,
  updateKOTStatus
};
