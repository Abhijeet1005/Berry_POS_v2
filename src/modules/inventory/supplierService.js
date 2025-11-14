const Supplier = require('../../models/Supplier');
const { NotFoundError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Create supplier
 */
const createSupplier = async (supplierData, tenantId) => {
  const supplier = new Supplier({
    ...supplierData,
    tenantId
  });
  
  await supplier.save();
  return supplier;
};

/**
 * Get all suppliers with filters and pagination
 */
const getSuppliers = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId, isActive: true };
  
  if (query.category) {
    filter.suppliedCategories = query.category;
  }
  
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { contactPerson: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } }
    ];
  }
  
  if (query.minRating) {
    filter.rating = { $gte: parseFloat(query.minRating) };
  }
  
  const suppliers = await Supplier.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
  
  const total = await Supplier.countDocuments(filter);
  
  return {
    suppliers,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get supplier by ID
 */
const getSupplierById = async (supplierId, tenantId) => {
  const supplier = await Supplier.findOne({ _id: supplierId, tenantId, isActive: true });
  
  if (!supplier) {
    throw new NotFoundError('Supplier');
  }
  
  return supplier;
};

/**
 * Update supplier
 */
const updateSupplier = async (supplierId, updateData, tenantId) => {
  const supplier = await Supplier.findOne({ _id: supplierId, tenantId, isActive: true });
  
  if (!supplier) {
    throw new NotFoundError('Supplier');
  }
  
  Object.assign(supplier, updateData);
  await supplier.save();
  
  return supplier;
};

/**
 * Delete supplier (soft delete)
 */
const deleteSupplier = async (supplierId, tenantId) => {
  const supplier = await Supplier.findOne({ _id: supplierId, tenantId, isActive: true });
  
  if (!supplier) {
    throw new NotFoundError('Supplier');
  }
  
  supplier.isActive = false;
  await supplier.save();
  
  return { message: 'Supplier deleted successfully' };
};

/**
 * Update supplier rating
 */
const updateSupplierRating = async (supplierId, rating, tenantId) => {
  const supplier = await Supplier.findOne({ _id: supplierId, tenantId, isActive: true });
  
  if (!supplier) {
    throw new NotFoundError('Supplier');
  }
  
  await supplier.updateRating(rating);
  
  return supplier;
};

/**
 * Get supplier performance
 */
const getSupplierPerformance = async (supplierId, tenantId) => {
  const PurchaseOrder = require('../../models/PurchaseOrder');
  
  const supplier = await Supplier.findOne({ _id: supplierId, tenantId, isActive: true });
  
  if (!supplier) {
    throw new NotFoundError('Supplier');
  }
  
  // Get all purchase orders for this supplier
  const purchaseOrders = await PurchaseOrder.find({
    tenantId,
    supplierId,
    status: { $in: ['received', 'partially-received'] }
  });
  
  const performance = {
    supplier: {
      id: supplier._id,
      name: supplier.name,
      rating: supplier.rating
    },
    totalOrders: purchaseOrders.length,
    totalValue: 0,
    onTimeDeliveries: 0,
    lateDeliveries: 0,
    averageDeliveryTime: 0
  };
  
  let totalDeliveryDays = 0;
  
  purchaseOrders.forEach(po => {
    performance.totalValue += po.total;
    
    if (po.receivedDate && po.expectedDeliveryDate) {
      const deliveryTime = (po.receivedDate - po.expectedDeliveryDate) / (1000 * 60 * 60 * 24);
      totalDeliveryDays += Math.abs(deliveryTime);
      
      if (po.receivedDate <= po.expectedDeliveryDate) {
        performance.onTimeDeliveries++;
      } else {
        performance.lateDeliveries++;
      }
    }
  });
  
  if (purchaseOrders.length > 0) {
    performance.averageDeliveryTime = Math.round(totalDeliveryDays / purchaseOrders.length);
    performance.onTimePercentage = Math.round((performance.onTimeDeliveries / purchaseOrders.length) * 100);
  }
  
  return performance;
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  updateSupplierRating,
  getSupplierPerformance
};
