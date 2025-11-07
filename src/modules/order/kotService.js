const KOT = require('../../models/KOT');
const Order = require('../../models/Order');
const Category = require('../../models/Category');
const { NotFoundError } = require('../../utils/errorHandler');
const { KOT_STATUS } = require('../../config/constants');

/**
 * Generate KOT for an order
 */
const generateKOT = async (orderId, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId })
    .populate('items.dishId')
    .populate('tableId');

  if (!order) {
    throw new NotFoundError('Order');
  }

  // Group items by kitchen section
  const itemsBySection = {};

  for (const item of order.items) {
    if (!item.dishId) {
      continue;
    }

    // Skip items that already have a KOT assigned
    if (item.kotId) {
      continue;
    }

    // Handle both populated and unpopulated dishId
    const dishIdValue = item.dishId._id || item.dishId;
    const categoryId = item.dishId.categoryId || null;

    let section = 'kitchen'; // Default section

    if (categoryId) {
      const category = await Category.findById(categoryId);
      section = category?.kitchenSection || 'kitchen';
    }

    if (!itemsBySection[section]) {
      itemsBySection[section] = [];
    }

    itemsBySection[section].push({
      dishId: dishIdValue,
      name: item.name,
      quantity: item.quantity,
      customization: item.customization
    });
  }

  // Check if there are any items to create KOT for
  if (Object.keys(itemsBySection).length === 0) {
    return [];
  }

  // Create KOT for each section
  const kots = [];

  for (const [section, items] of Object.entries(itemsBySection)) {
    const kot = new KOT({
      tenantId,
      outletId: order.outletId,
      orderId: order._id,
      tableNumber: order.tableId?.tableNumber || 'N/A',
      kitchenSection: section,
      items,
      status: KOT_STATUS.PENDING
    });

    const savedKot = await kot.save();

    // Update order items with KOT reference
    for (const kotItem of items) {
      const orderItem = order.items.find(i => {
        const itemDishId = i.dishId._id || i.dishId;
        return itemDishId.toString() === kotItem.dishId.toString();
      });
      if (orderItem) {
        orderItem.kotId = savedKot._id;
      }
    }

    kots.push(savedKot);
  }

  await order.save();

  return kots;
};

/**
 * Get KOT by ID
 */
const getKOTById = async (kotId, tenantId) => {
  const kot = await KOT.findOne({ _id: kotId, tenantId })
    .populate('orderId', 'orderNumber orderType')
    .populate('items.dishId', 'name images');

  if (!kot) {
    throw new NotFoundError('KOT');
  }

  return kot;
};

/**
 * Get KOTs with filters
 */
const getKOTs = async (query, tenantId) => {
  const filter = { tenantId };

  if (query.outletId) {
    filter.outletId = query.outletId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.kitchenSection) {
    filter.kitchenSection = query.kitchenSection;
  }

  if (query.orderId) {
    filter.orderId = query.orderId;
  }

  const kots = await KOT.find(filter)
    .populate('orderId', 'orderNumber tableNumber')
    .sort({ createdAt: -1 })
    .limit(100);

  return kots;
};

/**
 * Update KOT status
 */
const updateKOTStatus = async (kotId, status, tenantId) => {
  const kot = await KOT.findOne({ _id: kotId, tenantId });

  if (!kot) {
    throw new NotFoundError('KOT');
  }

  kot.status = status;

  if (status === KOT_STATUS.READY) {
    kot.completedAt = new Date();

    // Update order items status
    const order = await Order.findById(kot.orderId);
    if (order) {
      for (const kotItem of kot.items) {
        const orderItem = order.items.find(i =>
          i.dishId.toString() === kotItem.dishId.toString() &&
          i.kotId?.toString() === kot._id.toString()
        );
        if (orderItem) {
          orderItem.status = 'ready';
        }
      }
      await order.save();
    }
  }

  await kot.save();

  return kot;
};

/**
 * Get pending KOTs by section
 */
const getPendingKOTsBySection = async (section, outletId, tenantId) => {
  const kots = await KOT.find({
    tenantId,
    outletId,
    kitchenSection: section,
    status: { $in: [KOT_STATUS.PENDING, KOT_STATUS.PREPARING] }
  })
    .populate('orderId', 'orderNumber tableNumber orderType')
    .sort({ createdAt: 1 });

  return kots;
};

module.exports = {
  generateKOT,
  getKOTById,
  getKOTs,
  updateKOTStatus,
  getPendingKOTsBySection
};
