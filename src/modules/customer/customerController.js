const customerAuthService = require('./customerAuthService');
const customerOrderService = require('./customerOrderService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

// Auth endpoints
const register = asyncHandler(async (req, res) => {
  const result = await customerAuthService.registerCustomer(req.body, req.tenantId);
  res.status(201).json(successResponse(result, 'Registration successful'));
});

const login = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const result = await customerAuthService.loginCustomer(phone, req.tenantId);
  res.json(successResponse(result, 'OTP sent successfully'));
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const result = await customerAuthService.verifyOTP(phone, otp, req.tenantId);
  res.json(successResponse(result, 'Login successful'));
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await customerAuthService.getProfile(req.customer._id, req.tenantId);
  res.json(successResponse(profile, 'Profile retrieved successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await customerAuthService.updateProfile(req.customer._id, req.body, req.tenantId);
  res.json(successResponse(profile, 'Profile updated successfully'));
});

// Menu endpoints
const getMenu = asyncHandler(async (req, res) => {
  const menu = await customerOrderService.getMenu(
    { ...req.query, customerId: req.customer?._id },
    req.tenantId
  );
  res.json(successResponse(menu, 'Menu retrieved successfully'));
});

// Cart endpoints
const getCart = asyncHandler(async (req, res) => {
  const cart = await customerOrderService.getCart(req.customer._id);
  res.json(successResponse(cart, 'Cart retrieved successfully'));
});

const addToCart = asyncHandler(async (req, res) => {
  const cart = await customerOrderService.addToCart(req.customer._id, req.body, req.tenantId);
  res.json(successResponse(cart, 'Item added to cart'));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await customerOrderService.updateCartItem(req.customer._id, req.params.itemId, quantity);
  res.json(successResponse(cart, 'Cart updated successfully'));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await customerOrderService.removeFromCart(req.customer._id, req.params.itemId);
  res.json(successResponse(cart, 'Item removed from cart'));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await customerOrderService.clearCart(req.customer._id);
  res.json(successResponse(cart, 'Cart cleared successfully'));
});

// Order endpoints
const placeOrder = asyncHandler(async (req, res) => {
  const order = await customerOrderService.placeOrder(req.customer._id, req.body, req.tenantId);
  res.status(201).json(successResponse(order, 'Order placed successfully'));
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await customerOrderService.getOrders(req.customer._id, req.query, req.tenantId);
  res.json(successResponse(orders, 'Orders retrieved successfully'));
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await customerOrderService.getOrderById(req.customer._id, req.params.id, req.tenantId);
  res.json(successResponse(order, 'Order retrieved successfully'));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await customerOrderService.cancelOrder(req.customer._id, req.params.id, reason, req.tenantId);
  res.json(successResponse(order, 'Order cancelled successfully'));
});

module.exports = {
  register,
  login,
  verifyOTP,
  getProfile,
  updateProfile,
  getMenu,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder
};
