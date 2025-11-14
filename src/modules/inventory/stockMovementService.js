const StockMovement = require('../../models/StockMovement');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Get stock movements with filters and pagination
 */
const getStockMovements = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.inventoryItemId) {
    filter.inventoryItemId = query.inventoryItemId;
  }
  
  if (query.type) {
    filter.type = query.type;
  }
  
  if (query.startDate || query.endDate) {
    filter.timestamp = {};
    if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
    if (query.endDate) filter.timestamp.$lte = new Date(query.endDate);
  }
  
  const movements = await StockMovement.find(filter)
    .populate('inventoryItemId', 'name sku unit')
    .populate('performedBy', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });
  
  const total = await StockMovement.countDocuments(filter);
  
  return {
    movements,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get stock movements for specific inventory item
 */
const getMovementsByItem = async (inventoryItemId, query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = {
    tenantId,
    inventoryItemId
  };
  
  if (query.type) {
    filter.type = query.type;
  }
  
  if (query.startDate || query.endDate) {
    filter.timestamp = {};
    if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
    if (query.endDate) filter.timestamp.$lte = new Date(query.endDate);
  }
  
  const movements = await StockMovement.find(filter)
    .populate('performedBy', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ timestamp: -1 });
  
  const total = await StockMovement.countDocuments(filter);
  
  return {
    movements,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get stock movement summary
 */
const getMovementSummary = async (query, tenantId) => {
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.inventoryItemId) {
    filter.inventoryItemId = query.inventoryItemId;
  }
  
  if (query.startDate || query.endDate) {
    filter.timestamp = {};
    if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
    if (query.endDate) filter.timestamp.$lte = new Date(query.endDate);
  }
  
  const summary = await StockMovement.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$totalCost' }
      }
    }
  ]);
  
  return summary;
};

module.exports = {
  getStockMovements,
  getMovementsByItem,
  getMovementSummary
};
