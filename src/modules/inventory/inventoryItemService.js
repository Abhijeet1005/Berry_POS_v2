const InventoryItem = require('../../models/InventoryItem');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Create inventory item
 */
const createInventoryItem = async (itemData, tenantId) => {
  const item = new InventoryItem({
    ...itemData,
    tenantId
  });
  
  await item.save();
  return item;
};

/**
 * Get all inventory items with filters and pagination
 */
const getInventoryItems = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId, isActive: true };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.category) {
    filter.category = query.category;
  }
  
  if (query.supplierId) {
    filter.supplierId = query.supplierId;
  }
  
  if (query.lowStock === 'true') {
    filter.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
  }
  
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { sku: { $regex: query.search, $options: 'i' } }
    ];
  }
  
  const items = await InventoryItem.find(filter)
    .populate('supplierId', 'name phone')
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
  
  const total = await InventoryItem.countDocuments(filter);
  
  return {
    items,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get inventory item by ID
 */
const getInventoryItemById = async (itemId, tenantId) => {
  const item = await InventoryItem.findOne({ _id: itemId, tenantId, isActive: true })
    .populate('supplierId', 'name phone email');
  
  if (!item) {
    throw new NotFoundError('Inventory item');
  }
  
  return item;
};

/**
 * Update inventory item
 */
const updateInventoryItem = async (itemId, updateData, tenantId) => {
  const item = await InventoryItem.findOne({ _id: itemId, tenantId, isActive: true });
  
  if (!item) {
    throw new NotFoundError('Inventory item');
  }
  
  Object.assign(item, updateData);
  await item.save();
  
  return item;
};

/**
 * Delete inventory item (soft delete)
 */
const deleteInventoryItem = async (itemId, tenantId) => {
  const item = await InventoryItem.findOne({ _id: itemId, tenantId, isActive: true });
  
  if (!item) {
    throw new NotFoundError('Inventory item');
  }
  
  item.isActive = false;
  await item.save();
  
  return { message: 'Inventory item deleted successfully' };
};

/**
 * Update stock
 */
const updateStock = async (itemId, quantity, operation, tenantId) => {
  const item = await InventoryItem.findOne({ _id: itemId, tenantId, isActive: true });
  
  if (!item) {
    throw new NotFoundError('Inventory item');
  }
  
  await item.updateStock(quantity, operation);
  
  return item;
};

/**
 * Get low stock items
 */
const getLowStockItems = async (outletId, tenantId) => {
  const filter = {
    tenantId,
    isActive: true,
    $expr: { $lte: ['$currentStock', '$minStockLevel'] }
  };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  const items = await InventoryItem.find(filter)
    .populate('supplierId', 'name phone')
    .sort({ currentStock: 1 });
  
  return items;
};

/**
 * Get items needing reorder
 */
const getReorderItems = async (outletId, tenantId) => {
  const filter = {
    tenantId,
    isActive: true,
    reorderPoint: { $exists: true, $ne: null },
    $expr: { $lte: ['$currentStock', '$reorderPoint'] }
  };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  const items = await InventoryItem.find(filter)
    .populate('supplierId', 'name phone email')
    .sort({ currentStock: 1 });
  
  return items;
};

/**
 * Get inventory valuation
 */
const getInventoryValuation = async (outletId, tenantId) => {
  const filter = { tenantId, isActive: true };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  const items = await InventoryItem.find(filter);
  
  const valuation = {
    totalItems: items.length,
    totalValue: 0,
    byCategory: {}
  };
  
  items.forEach(item => {
    const itemValue = item.getTotalValue();
    valuation.totalValue += itemValue;
    
    if (!valuation.byCategory[item.category]) {
      valuation.byCategory[item.category] = {
        count: 0,
        value: 0
      };
    }
    
    valuation.byCategory[item.category].count++;
    valuation.byCategory[item.category].value += itemValue;
  });
  
  return valuation;
};

module.exports = {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems,
  getReorderItems,
  getInventoryValuation
};
