const Order = require('../../models/Order');
const Dish = require('../../models/Dish');
const Table = require('../../models/Table');
const Customer = require('../../models/Customer');
const Recipe = require('../../models/Recipe');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');
const { ORDER_STATUS, TABLE_STATUS } = require('../../config/constants');

// DynoAPI integration (lazy load to avoid circular dependencies)
let orderSyncService;
const getOrderSyncService = () => {
  if (!orderSyncService) {
    orderSyncService = require('../integrations/dynoapi/orderSyncService');
  }
  return orderSyncService;
};

/**
 * Create a new order
 */
const createOrder = async (orderData, tenantId, userId) => {
  const { customerId, tableId, orderType, items, source, specialInstructions } = orderData;
  
  // Validate customer if provided
  if (customerId) {
    const customer = await Customer.findOne({ _id: customerId, tenantId });
    if (!customer) {
      throw new NotFoundError('Customer');
    }
  }
  
  // Validate table if provided
  if (tableId) {
    const table = await Table.findOne({ _id: tableId, tenantId });
    if (!table) {
      throw new NotFoundError('Table');
    }
    
    // Update table status to occupied
    if (table.status === TABLE_STATUS.AVAILABLE) {
      table.status = TABLE_STATUS.OCCUPIED;
      await table.save();
    }
  }
  
  // Validate and process items
  const processedItems = [];
  let subtotal = 0;
  
  for (const item of items) {
    const dish = await Dish.findOne({ _id: item.dishId, tenantId, isActive: true });
    
    if (!dish) {
      throw new NotFoundError(`Dish with ID ${item.dishId}`);
    }
    
    if (!dish.isAvailable) {
      throw new ValidationError(`Dish "${dish.name}" is not available`);
    }
    
    // Check if recipe exists for this dish
    const recipe = await Recipe.findOne({
      tenantId,
      outletId: orderData.outletId,
      dishId: item.dishId,
      isActive: true
    });
    
    // If recipe exists, check ingredient availability
    if (recipe) {
      const availability = await recipe.checkAvailability(item.quantity);
      
      if (!availability.available) {
        const missingItems = availability.unavailableItems
          .map(i => `${i.name} (need ${i.required}${i.unit || ''}, have ${i.available}${i.unit || ''})`)
          .join(', ');
        throw new ValidationError(
          `Cannot prepare "${dish.name}". Insufficient ingredients: ${missingItems}`
        );
      }
    } else {
      // If no recipe, fall back to dish stock (for pre-made items)
      if (dish.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for dish "${dish.name}"`);
      }
      
      // Decrement dish stock
      await dish.decrementStock(item.quantity);
    }
    
    const itemPrice = item.portionSize 
      ? dish.portionSizes.find(p => p.name === item.portionSize)?.price || dish.price
      : dish.price;
    
    processedItems.push({
      dishId: dish._id,
      name: dish.name,
      quantity: item.quantity,
      price: itemPrice,
      portionSize: item.portionSize,
      customization: item.customization,
      status: 'pending'
    });
    
    subtotal += itemPrice * item.quantity;
  }
  
  // Calculate tax
  const taxAmount = subtotal * 0.05; // 5% tax (can be made configurable)
  
  // Create order
  const order = new Order({
    tenantId,
    outletId: orderData.outletId,
    customerId,
    tableId,
    orderType,
    source: source || 'pos',
    items: processedItems,
    subtotal,
    taxAmount,
    discountAmount: 0,
    total: subtotal + taxAmount,
    status: ORDER_STATUS.PENDING,
    staffId: userId,
    specialInstructions
  });
  
  await order.save();
  
  // Deduct inventory for items with recipes
  try {
    for (const item of items) {
      const recipe = await Recipe.findOne({
        tenantId,
        outletId: orderData.outletId,
        dishId: item.dishId,
        isActive: true
      });
      
      if (recipe) {
        // Deduct inventory using recipe method
        await recipe.deductInventory(item.quantity);
      }
    }
  } catch (error) {
    // Log error but don't fail the order (order is already created)
    console.error('Failed to deduct inventory:', error);
    // In production, you might want to create a notification for manager
  }
  
  // Update table with current order
  if (tableId) {
    await Table.findByIdAndUpdate(tableId, { currentOrderId: order._id });
  }
  
  return order;
};

/**
 * Get orders with filters and pagination
 */
const getOrders = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  if (query.orderType) {
    filter.orderType = query.orderType;
  }
  
  if (query.customerId) {
    filter.customerId = query.customerId;
  }
  
  if (query.tableId) {
    filter.tableId = query.tableId;
  }
  
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  
  const orders = await Order.find(filter)
    .populate('customerId', 'name phone email')
    .populate('tableId', 'tableNumber')
    .populate('staffId', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Order.countDocuments(filter);
  
  return {
    orders,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId })
    .populate('customerId', 'name phone email loyaltyPoints')
    .populate('tableId', 'tableNumber capacity')
    .populate('staffId', 'firstName lastName role')
    .populate('items.dishId', 'name images categoryId');
  
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  return order;
};

/**
 * Update order
 */
const updateOrder = async (orderId, updateData, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId });
  
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  // Prevent updating completed or cancelled orders
  if (order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.CANCELLED) {
    throw new ValidationError('Cannot update completed or cancelled orders');
  }
  
  Object.assign(order, updateData);
  await order.save();
  
  return order;
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, status, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId });
  
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  order.status = status;
  
  if (status === ORDER_STATUS.COMPLETED) {
    order.completedAt = new Date();
    
    // Update table status if applicable
    if (order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, {
        status: TABLE_STATUS.AVAILABLE,
        currentOrderId: null
      });
    }
    
    // Update customer stats
    if (order.customerId) {
      const customer = await Customer.findById(order.customerId);
      if (customer) {
        customer.totalOrders += 1;
        customer.totalSpent += order.total;
        customer.lastOrderDate = new Date();
        await customer.save();
        await customer.updateSegment();
      }
    }
  }
  
  await order.save();
  
  // Sync status to platform if order is from Swiggy/Zomato
  try {
    if (order.source === 'swiggy' || order.source === 'zomato') {
      const syncService = getOrderSyncService();
      await syncService.syncOrderStatus(order._id, status);
    }
  } catch (error) {
    // Log but don't fail the order update
    console.error('Error syncing order status to platform:', error);
  }
  
  return order;
};

/**
 * Cancel order item
 */
const cancelOrderItem = async (orderId, itemId, reason, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId });
  
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  const item = order.items.id(itemId);
  
  if (!item) {
    throw new NotFoundError('Order item');
  }
  
  // Restore stock
  const dish = await Dish.findById(item.dishId);
  if (dish) {
    await dish.incrementStock(item.quantity);
  }
  
  // Remove item from order
  order.items.pull(itemId);
  
  // Recalculate totals
  order.calculateTotals();
  
  await order.save();
  
  return order;
};

/**
 * Get orders by table
 */
const getOrdersByTable = async (tableId, tenantId) => {
  const orders = await Order.find({
    tableId,
    tenantId,
    status: { $nin: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED] }
  })
    .populate('customerId', 'name phone')
    .populate('staffId', 'firstName lastName')
    .sort({ createdAt: -1 });
  
  return orders;
};

/**
 * Get orders by customer
 */
const getOrdersByCustomer = async (customerId, tenantId, limit = 10) => {
  const orders = await Order.find({ customerId, tenantId })
    .populate('tableId', 'tableNumber')
    .populate('items.dishId', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit);
  
  return orders;
};

/**
 * Cancel entire order with inventory restoration
 */
const cancelOrder = async (orderId, reason, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId });
  
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  // Prevent cancelling already completed orders
  if (order.status === ORDER_STATUS.COMPLETED) {
    throw new ValidationError('Cannot cancel completed orders');
  }
  
  // Prevent cancelling already cancelled orders
  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new ValidationError('Order is already cancelled');
  }
  
  // Store previous status for inventory restoration logic
  const previousStatus = order.status;
  
  // Restore inventory ONLY if order was in 'pending' or 'confirmed' status
  // (i.e., food hasn't been prepared yet)
  const shouldRestoreInventory = ['pending', 'confirmed'].includes(previousStatus);
  
  if (shouldRestoreInventory) {
    try {
      // Restore inventory for each item
      for (const item of order.items) {
        // Check if dish has a recipe
        const recipe = await Recipe.findOne({
          tenantId,
          outletId: order.outletId,
          dishId: item.dishId,
          isActive: true
        });
        
        if (recipe) {
          // Restore inventory using recipe (add back ingredients)
          await recipe.restoreInventory(item.quantity);
        } else {
          // Restore dish stock (for items without recipes)
          const dish = await Dish.findById(item.dishId);
          if (dish && dish.stock !== undefined) {
            await dish.incrementStock(item.quantity);
          }
        }
      }
    } catch (error) {
      // Log error but continue with cancellation
      console.error('Failed to restore inventory on cancellation:', error);
      // In production, create notification for manager to manually adjust
    }
  }
  
  // Update order status
  order.status = ORDER_STATUS.CANCELLED;
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  
  await order.save();
  
  // Free up table if applicable
  if (order.tableId) {
    await Table.findByIdAndUpdate(order.tableId, {
      status: TABLE_STATUS.AVAILABLE,
      currentOrderId: null
    });
  }
  
  // Sync cancellation to platform if order is from Swiggy/Zomato
  try {
    if (order.source === 'swiggy' || order.source === 'zomato') {
      const syncService = getOrderSyncService();
      await syncService.cancelOrder(order._id, reason);
    }
  } catch (error) {
    console.error('Error syncing cancellation to platform:', error);
  }
  
  return order;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  cancelOrderItem,
  getOrdersByTable,
  getOrdersByCustomer
};
