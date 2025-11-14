const PurchaseOrder = require('../../models/PurchaseOrder');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Create purchase order
 */
const createPurchaseOrder = async (poData, tenantId, userId) => {
  const po = new PurchaseOrder({
    ...poData,
    tenantId,
    createdBy: userId
  });
  
  // Calculate totals
  po.calculateTotals();
  
  await po.save();
  return po;
};

/**
 * Get all purchase orders with filters and pagination
 */
const getPurchaseOrders = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.supplierId) {
    filter.supplierId = query.supplierId;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }
  
  const purchaseOrders = await PurchaseOrder.find(filter)
    .populate('supplierId', 'name phone email')
    .populate('items.inventoryItemId', 'name unit')
    .populate('createdBy', 'firstName lastName')
    .populate('approvedBy', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await PurchaseOrder.countDocuments(filter);
  
  return {
    purchaseOrders,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get purchase order by ID
 */
const getPurchaseOrderById = async (poId, tenantId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId })
    .populate('supplierId', 'name phone email address')
    .populate('items.inventoryItemId', 'name unit sku')
    .populate('createdBy', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName email');
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  return po;
};

/**
 * Update purchase order
 */
const updatePurchaseOrder = async (poId, updateData, tenantId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  if (po.status !== 'draft' && po.status !== 'pending') {
    throw new ValidationError('Only draft or pending purchase orders can be updated');
  }
  
  Object.assign(po, updateData);
  
  // Recalculate totals if items changed
  if (updateData.items) {
    po.calculateTotals();
  }
  
  await po.save();
  
  return po;
};

/**
 * Delete purchase order
 */
const deletePurchaseOrder = async (poId, tenantId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  if (po.status !== 'draft') {
    throw new ValidationError('Only draft purchase orders can be deleted');
  }
  
  await po.deleteOne();
  
  return { message: 'Purchase order deleted successfully' };
};

/**
 * Approve purchase order
 */
const approvePurchaseOrder = async (poId, tenantId, userId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  await po.approve(userId);
  
  return po;
};

/**
 * Submit purchase order (change status from draft to pending)
 */
const submitPurchaseOrder = async (poId, tenantId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  if (po.status !== 'draft') {
    throw new ValidationError('Only draft purchase orders can be submitted');
  }
  
  po.status = 'pending';
  await po.save();
  
  return po;
};

/**
 * Mark purchase order as ordered
 */
const markAsOrdered = async (poId, tenantId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  if (po.status !== 'approved') {
    throw new ValidationError('Only approved purchase orders can be marked as ordered');
  }
  
  po.status = 'ordered';
  po.orderedDate = new Date();
  await po.save();
  
  return po;
};

/**
 * Receive goods
 */
const receiveGoods = async (poId, receivedItems, tenantId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  if (po.status !== 'ordered' && po.status !== 'partially-received') {
    throw new ValidationError('Only ordered or partially received purchase orders can receive goods');
  }
  
  await po.receiveGoods(receivedItems);
  
  return po;
};

/**
 * Cancel purchase order
 */
const cancelPurchaseOrder = async (poId, tenantId) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
  
  if (!po) {
    throw new NotFoundError('Purchase order');
  }
  
  if (po.status === 'received' || po.status === 'cancelled') {
    throw new ValidationError('Cannot cancel received or already cancelled purchase orders');
  }
  
  po.status = 'cancelled';
  await po.save();
  
  return po;
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  approvePurchaseOrder,
  submitPurchaseOrder,
  markAsOrdered,
  receiveGoods,
  cancelPurchaseOrder
};
