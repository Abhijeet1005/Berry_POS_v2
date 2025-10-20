const Coupon = require('../../models/Coupon');
const Order = require('../../models/Order');
const Customer = require('../../models/Customer');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Create coupon
 */
const createCoupon = async (couponData, tenantId) => {
  const { code, type, value, minOrderValue, maxDiscount, validFrom, validUntil, usageLimit, perUserLimit, applicableOutlets, applicableDishes, applicableCategories, campaignId } = couponData;
  
  // Check if code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), tenantId });
  if (existingCoupon) {
    throw new ValidationError('Coupon code already exists');
  }
  
  const coupon = new Coupon({
    code: code.toUpperCase(),
    type,
    value,
    minOrderValue,
    maxDiscount,
    validFrom,
    validUntil,
    usageLimit,
    perUserLimit,
    applicableOutlets,
    applicableDishes,
    applicableCategories,
    campaignId,
    tenantId,
    isActive: true
  });
  
  await coupon.save();
  
  return coupon;
};

/**
 * Get all coupons
 */
const getCoupons = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  
  if (query.outletId) {
    filter.applicableOutlets = query.outletId;
  }
  
  if (query.campaignId) {
    filter.campaignId = query.campaignId;
  }
  
  const coupons = await Coupon.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Coupon.countDocuments(filter);
  
  return {
    coupons,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get coupon by code
 */
const getCouponByCode = async (code, tenantId) => {
  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(), 
    tenantId 
  });
  
  if (!coupon) {
    throw new NotFoundError('Coupon');
  }
  
  return coupon;
};

/**
 * Update coupon
 */
const updateCoupon = async (couponId, updateData, tenantId) => {
  const coupon = await Coupon.findOne({ _id: couponId, tenantId });
  
  if (!coupon) {
    throw new NotFoundError('Coupon');
  }
  
  // Prevent updating code
  delete updateData.code;
  delete updateData.tenantId;
  
  Object.assign(coupon, updateData);
  await coupon.save();
  
  return coupon;
};

/**
 * Delete coupon (deactivate)
 */
const deleteCoupon = async (couponId, tenantId) => {
  const coupon = await Coupon.findOne({ _id: couponId, tenantId });
  
  if (!coupon) {
    throw new NotFoundError('Coupon');
  }
  
  coupon.isActive = false;
  await coupon.save();
  
  return { message: 'Coupon deactivated successfully' };
};

/**
 * Validate coupon
 */
const validateCoupon = async (validationData, tenantId) => {
  const { code, customerId, outletId, orderTotal, items } = validationData;
  
  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(), 
    tenantId,
    isActive: true
  });
  
  if (!coupon) {
    throw new ValidationError('Invalid coupon code');
  }
  
  // Check validity period
  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    throw new ValidationError('Coupon is not yet valid');
  }
  
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    throw new ValidationError('Coupon has expired');
  }
  
  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ValidationError('Coupon usage limit reached');
  }
  
  // Check per-user limit
  if (customerId && coupon.perUserLimit) {
    const customerUsage = await Order.countDocuments({
      customerId,
      tenantId,
      'coupon.code': coupon.code
    });
    
    if (customerUsage >= coupon.perUserLimit) {
      throw new ValidationError('You have reached the usage limit for this coupon');
    }
  }
  
  // Check outlet applicability
  if (coupon.applicableOutlets && coupon.applicableOutlets.length > 0) {
    if (!coupon.applicableOutlets.includes(outletId)) {
      throw new ValidationError('Coupon not applicable for this outlet');
    }
  }
  
  // Check minimum order value
  if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
    throw new ValidationError(`Minimum order value of ₹${coupon.minOrderValue} required`);
  }
  
  // Check dish/category applicability
  if (items && (coupon.applicableDishes?.length > 0 || coupon.applicableCategories?.length > 0)) {
    const applicableItems = items.filter(item => {
      if (coupon.applicableDishes?.includes(item.dishId)) return true;
      if (coupon.applicableCategories?.includes(item.category)) return true;
      return false;
    });
    
    if (applicableItems.length === 0) {
      throw new ValidationError('Coupon not applicable for selected items');
    }
  }
  
  // Calculate discount
  let discount = 0;
  
  if (coupon.type === 'percentage') {
    discount = (orderTotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
    if (discount > orderTotal) {
      discount = orderTotal;
    }
  }
  
  return {
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description
    },
    discount: Math.round(discount * 100) / 100,
    finalAmount: Math.round((orderTotal - discount) * 100) / 100
  };
};

/**
 * Apply coupon to order (increment usage count)
 */
const applyCoupon = async (code, orderId, tenantId) => {
  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(), 
    tenantId 
  });
  
  if (!coupon) {
    throw new NotFoundError('Coupon');
  }
  
  coupon.usedCount += 1;
  coupon.lastUsedAt = new Date();
  await coupon.save();
  
  return coupon;
};

/**
 * Get coupon usage statistics
 */
const getCouponUsage = async (couponId, tenantId) => {
  const coupon = await Coupon.findOne({ _id: couponId, tenantId });
  
  if (!coupon) {
    throw new NotFoundError('Coupon');
  }
  
  // Get orders using this coupon
  const orders = await Order.find({
    tenantId,
    'coupon.code': coupon.code
  })
    .select('orderNumber total coupon.discount createdAt customerId')
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
  
  const totalDiscount = orders.reduce((sum, order) => sum + (order.coupon?.discount || 0), 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  return {
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount
    },
    statistics: {
      totalOrders: orders.length,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageDiscount: orders.length > 0 ? Math.round((totalDiscount / orders.length) * 100) / 100 : 0,
      averageOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0
    },
    recentOrders: orders
  };
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getCouponUsage
};
