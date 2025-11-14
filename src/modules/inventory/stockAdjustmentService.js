const StockAdjustment = require('../../models/StockAdjustment');
const InventoryItem = require('../../models/InventoryItem');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Create stock adjustment
 */
const createStockAdjustment = async (adjustmentData, tenantId, userId) => {
  const inventoryItem = await InventoryItem.findOne({
    _id: adjustmentData.inventoryItemId,
    tenantId,
    isActive: true
  });
  
  if (!inventoryItem) {
    throw new NotFoundError('Inventory item');
  }
  
  // Calculate new stock based on adjustment
  const previousStock = inventoryItem.currentStock;
  let newStock;
  
  if (adjustmentData.adjustmentType === 'correction') {
    // For corrections, newStock is provided directly
    newStock = adjustmentData.newStock || adjustmentData.quantity;
  } else {
    // For wastage, damage, theft, expiry - reduce stock
    newStock = previousStock - Math.abs(adjustmentData.quantity);
  }
  
  if (newStock < 0) {
    throw new ValidationError('Adjustment would result in negative stock');
  }
  
  // Calculate cost impact
  const cost = Math.abs(adjustmentData.quantity) * inventoryItem.unitCost;
  
  const adjustment = new StockAdjustment({
    ...adjustmentData,
    tenantId,
    previousStock,
    newStock,
    cost,
    createdBy: userId
  });
  
  await adjustment.save();
  
  return adjustment;
};

/**
 * Get all stock adjustments with filters and pagination
 */
const getStockAdjustments = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.inventoryItemId) {
    filter.inventoryItemId = query.inventoryItemId;
  }
  
  if (query.adjustmentType) {
    filter.adjustmentType = query.adjustmentType;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  
  const adjustments = await StockAdjustment.find(filter)
    .populate('inventoryItemId', 'name sku unit')
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await StockAdjustment.countDocuments(filter);
  
  return {
    adjustments,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get stock adjustment by ID
 */
const getStockAdjustmentById = async (adjustmentId, tenantId) => {
  const adjustment = await StockAdjustment.findOne({ _id: adjustmentId, tenantId })
    .populate('inventoryItemId', 'name sku unit currentStock')
    .populate('createdBy', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName email');
  
  if (!adjustment) {
    throw new NotFoundError('Stock adjustment');
  }
  
  return adjustment;
};

/**
 * Update stock adjustment
 */
const updateStockAdjustment = async (adjustmentId, updateData, tenantId) => {
  const adjustment = await StockAdjustment.findOne({ _id: adjustmentId, tenantId });
  
  if (!adjustment) {
    throw new NotFoundError('Stock adjustment');
  }
  
  if (adjustment.status !== 'pending') {
    throw new ValidationError('Only pending adjustments can be updated');
  }
  
  Object.assign(adjustment, updateData);
  await adjustment.save();
  
  return adjustment;
};

/**
 * Approve stock adjustment
 */
const approveStockAdjustment = async (adjustmentId, tenantId, userId) => {
  const adjustment = await StockAdjustment.findOne({ _id: adjustmentId, tenantId });
  
  if (!adjustment) {
    throw new NotFoundError('Stock adjustment');
  }
  
  await adjustment.approve(userId);
  
  return adjustment;
};

/**
 * Reject stock adjustment
 */
const rejectStockAdjustment = async (adjustmentId, reason, tenantId, userId) => {
  const adjustment = await StockAdjustment.findOne({ _id: adjustmentId, tenantId });
  
  if (!adjustment) {
    throw new NotFoundError('Stock adjustment');
  }
  
  await adjustment.reject(userId, reason);
  
  return adjustment;
};

/**
 * Get adjustment summary
 */
const getAdjustmentSummary = async (query, tenantId) => {
  const filter = { tenantId, status: 'approved' };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  
  const summary = await StockAdjustment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$adjustmentType',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$cost' }
      }
    }
  ]);
  
  return summary;
};

module.exports = {
  createStockAdjustment,
  getStockAdjustments,
  getStockAdjustmentById,
  updateStockAdjustment,
  approveStockAdjustment,
  rejectStockAdjustment,
  getAdjustmentSummary
};
