const Order = require('../../models/Order');
const Dish = require('../../models/Dish');
const Table = require('../../models/Table');
const Customer = require('../../models/Customer');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler');
const aiService = require('../ai/aiService');

// ⚠️ PRODUCTION WARNING: In-memory cart storage will lose data on server restart
// TODO: Replace with Redis before production deployment
// Example: const redis = require('../../config/redis');
// await redis.setex(`cart:${customerId}`, 86400, JSON.stringify(cart)); // 24 hour expiry
const cartStore = new Map();

/**
 * Get menu for customer
 */
const getMenu = async (query, tenantId) => {
  const { outletId, category, dietaryTags, search, customerId } = query;

  const filter = {
    tenantId,
    outletId,
    isActive: true,
    isAvailable: true
  };

  if (category) {
    filter.category = category;
  }

  if (dietaryTags) {
    filter.dietaryTags = { $in: Array.isArray(dietaryTags) ? dietaryTags : [dietaryTags] };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const dishes = await Dish.find(filter)
    .select('name description price images dietaryTags category aiGenerated stock highlights')
    .sort({ displayOrder: 1, name: 1 });

  // Get recommendations if customer ID provided
  let recommendations = [];
  if (customerId) {
    try {
      const result = await aiService.getRecommendations(customerId, tenantId, outletId);
      recommendations = result.recommendations.slice(0, 5).map(d => d._id.toString());
    } catch (error) {
      // Ignore recommendation errors
    }
  }

  return {
    dishes: dishes.map(dish => ({
      ...dish.toObject(),
      isRecommended: recommendations.includes(dish._id.toString())
    })),
    total: dishes.length
  };
};

/**
 * Get cart
 */
const getCart = async (customerId) => {
  const cart = cartStore.get(customerId) || { items: [], total: 0 };
  return cart;
};

/**
 * Add item to cart
 */
const addToCart = async (customerId, itemData, tenantId) => {
  const { dishId, quantity, specialInstructions } = itemData;

  // Validate dish
  const dish = await Dish.findOne({ _id: dishId, tenantId, isActive: true, isAvailable: true });

  if (!dish) {
    throw new NotFoundError('Dish not available');
  }

  // Check stock
  if (dish.stock !== undefined && dish.stock < quantity) {
    throw new ValidationError('Insufficient stock');
  }

  // Get or create cart
  let cart = cartStore.get(customerId) || { items: [], total: 0 };

  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(item => item.dishId === dishId);

  if (existingItemIndex >= 0) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      dishId,
      name: dish.name,
      price: dish.price,
      quantity,
      specialInstructions,
      image: dish.images?.[0]
    });
  }

  // Calculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartStore.set(customerId, cart);

  return cart;
};

/**
 * Update cart item
 */
const updateCartItem = async (customerId, dishId, quantity) => {
  const cart = cartStore.get(customerId);

  if (!cart) {
    throw new NotFoundError('Cart is empty');
  }

  const itemIndex = cart.items.findIndex(item => item.dishId === dishId);

  if (itemIndex < 0) {
    throw new NotFoundError('Item not in cart');
  }

  if (quantity <= 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
  }

  // Calculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartStore.set(customerId, cart);

  return cart;
};

/**
 * Remove item from cart
 */
const removeFromCart = async (customerId, dishId) => {
  return await updateCartItem(customerId, dishId, 0);
};

/**
 * Clear cart
 */
const clearCart = async (customerId) => {
  cartStore.delete(customerId);
  return { items: [], total: 0 };
};

/**
 * Place order from cart
 */
const placeOrder = async (customerId, orderData, tenantId) => {
  const { outletId, orderType, tableId, deliveryAddress, paymentMethod } = orderData;

  // Get cart
  const cart = cartStore.get(customerId);

  if (!cart || cart.items.length === 0) {
    throw new ValidationError('Cart is empty');
  }

  // Validate table if dine-in
  if (orderType === 'dine-in' && tableId) {
    const table = await Table.findOne({ _id: tableId, tenantId, outletId });
    if (!table) {
      throw new NotFoundError('Table');
    }
  }

  // Calculate taxes (5% default)
  const taxAmount = cart.total * 0.05;
  const total = cart.total + taxAmount;

  // Create order
  const order = new Order({
    tenantId,
    outletId,
    customerId,
    orderType,
    tableId,
    deliveryAddress,
    items: cart.items.map(item => ({
      dishId: item.dishId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
      status: 'pending'
    })),
    subtotal: cart.total,
    taxAmount,
    total,
    paymentMethod,
    status: 'pending',
    source: 'customer-app'
  });

  await order.save();

  // Decrement stock for each item
  for (const item of cart.items) {
    const dish = await Dish.findById(item.dishId);
    if (dish && dish.stock !== undefined) {
      await dish.decrementStock(item.quantity);
    }
  }

  // Update customer stats
  const customer = await Customer.findById(customerId);
  if (customer) {
    customer.totalOrders += 1;
    customer.lastOrderDate = new Date();
    await customer.save();
  }

  // Clear cart
  cartStore.delete(customerId);

  // TODO: Send notification to restaurant (implement real-time notification)
  // TODO: Process payment if paymentMethod is not 'cash'

  return order;
};

/**
 * Get customer orders
 */
const getOrders = async (customerId, query, tenantId) => {
  const { status, limit = 20 } = query;

  const filter = { customerId, tenantId };

  if (status) {
    filter.status = status;
  }

  const orders = await Order.find(filter)
    .populate('outletId', 'name address phone')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  return orders;
};

/**
 * Get order by ID
 */
const getOrderById = async (customerId, orderId, tenantId) => {
  const order = await Order.findOne({ _id: orderId, customerId, tenantId })
    .populate('outletId', 'name address phone')
    .populate('items.dishId', 'name images');

  if (!order) {
    throw new NotFoundError('Order');
  }

  return order;
};

/**
 * Cancel order
 */
const cancelOrder = async (customerId, orderId, reason, tenantId) => {
  const order = await Order.findOne({ _id: orderId, customerId, tenantId });

  if (!order) {
    throw new NotFoundError('Order');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ValidationError('Order cannot be cancelled at this stage');
  }

  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledAt = new Date();

  await order.save();

  // TODO: Send notification to restaurant
  // TODO: Process refund if payment was made

  return order;
};

module.exports = {
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
