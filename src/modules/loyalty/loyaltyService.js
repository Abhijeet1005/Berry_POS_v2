const Customer = require('../../models/Customer');
const LoyaltyTransaction = require('../../models/LoyaltyTransaction');
const Order = require('../../models/Order');
const Tenant = require('../../models/Tenant');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Get loyalty rules for outlet
 */
const getLoyaltyRules = async (outletId, tenantId) => {
  const outlet = await Tenant.findOne({ _id: outletId, tenantId });
  
  if (!outlet) {
    throw new NotFoundError('Outlet');
  }
  
  // Default loyalty rules
  const defaultRules = {
    earningRate: 1, // 1 point per rupee spent
    redemptionRate: 1, // 1 point = 1 rupee
    minimumRedemption: 100, // Minimum 100 points to redeem
    feedbackBonus: 50, // 50 points for feedback
    signupBonus: 100 // 100 points on signup
  };
  
  return outlet.loyaltyRules || defaultRules;
};

/**
 * Update loyalty rules for outlet
 */
const updateLoyaltyRules = async (outletId, rules, tenantId) => {
  const outlet = await Tenant.findOne({ _id: outletId, tenantId });
  
  if (!outlet) {
    throw new NotFoundError('Outlet');
  }
  
  outlet.loyaltyRules = rules;
  await outlet.save();
  
  return outlet.loyaltyRules;
};

/**
 * Get customer loyalty balance
 */
const getCustomerLoyalty = async (customerId, tenantId) => {
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  return {
    customerId: customer._id,
    name: customer.name,
    email: customer.email,
    loyaltyPoints: customer.loyaltyPoints || 0,
    totalEarned: customer.totalLoyaltyEarned || 0,
    totalRedeemed: customer.totalLoyaltyRedeemed || 0
  };
};

/**
 * Earn loyalty points
 */
const earnPoints = async (data, tenantId) => {
  const { customerId, orderId, outletId, amount, reason } = data;
  
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  // Get loyalty rules
  const rules = await getLoyaltyRules(outletId, tenantId);
  
  // Calculate points based on amount and earning rate
  let points = 0;
  
  if (reason === 'order') {
    points = Math.floor(amount * rules.earningRate);
  } else if (reason === 'feedback') {
    points = rules.feedbackBonus;
  } else if (reason === 'signup') {
    points = rules.signupBonus;
  } else {
    points = amount; // Direct points
  }
  
  // Create transaction
  const transaction = new LoyaltyTransaction({
    customerId,
    tenantId,
    outletId,
    orderId,
    type: 'earn',
    points,
    reason,
    balanceBefore: customer.loyaltyPoints || 0,
    balanceAfter: (customer.loyaltyPoints || 0) + points
  });
  
  await transaction.save();
  
  // Update customer balance
  customer.loyaltyPoints = (customer.loyaltyPoints || 0) + points;
  customer.totalLoyaltyEarned = (customer.totalLoyaltyEarned || 0) + points;
  await customer.save();
  
  return {
    transaction,
    newBalance: customer.loyaltyPoints
  };
};

/**
 * Redeem loyalty points
 */
const redeemPoints = async (data, tenantId) => {
  const { customerId, orderId, outletId, points } = data;
  
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  // Get loyalty rules
  const rules = await getLoyaltyRules(outletId, tenantId);
  
  // Validate redemption
  if (points < rules.minimumRedemption) {
    throw new ValidationError(`Minimum ${rules.minimumRedemption} points required for redemption`);
  }
  
  if ((customer.loyaltyPoints || 0) < points) {
    throw new ValidationError('Insufficient loyalty points');
  }
  
  // Calculate discount amount
  const discountAmount = points * rules.redemptionRate;
  
  // Create transaction
  const transaction = new LoyaltyTransaction({
    customerId,
    tenantId,
    outletId,
    orderId,
    type: 'redeem',
    points: -points,
    reason: 'redemption',
    balanceBefore: customer.loyaltyPoints,
    balanceAfter: customer.loyaltyPoints - points,
    metadata: {
      discountAmount
    }
  });
  
  await transaction.save();
  
  // Update customer balance
  customer.loyaltyPoints -= points;
  customer.totalLoyaltyRedeemed = (customer.totalLoyaltyRedeemed || 0) + points;
  await customer.save();
  
  return {
    transaction,
    discountAmount,
    newBalance: customer.loyaltyPoints
  };
};

/**
 * Get loyalty transaction history
 */
const getLoyaltyHistory = async (customerId, query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const filter = { customerId, tenantId };
  
  if (query.type) {
    filter.type = query.type;
  }
  
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }
  
  const transactions = await LoyaltyTransaction.find(filter)
    .populate('orderId', 'orderNumber total')
    .populate('outletId', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await LoyaltyTransaction.countDocuments(filter);
  
  return {
    transactions,
    pagination: buildPaginationMeta(page, limit, total),
    currentBalance: customer.loyaltyPoints || 0
  };
};

/**
 * Process order loyalty points (called after order completion)
 */
const processOrderLoyalty = async (orderId, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId });
  
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  if (!order.customerId) {
    return { message: 'No customer associated with order' };
  }
  
  // Check if points already earned
  const existingTransaction = await LoyaltyTransaction.findOne({
    orderId,
    tenantId,
    type: 'earn',
    reason: 'order'
  });
  
  if (existingTransaction) {
    return { message: 'Loyalty points already processed for this order' };
  }
  
  // Earn points for order
  const result = await earnPoints({
    customerId: order.customerId,
    orderId: order._id,
    outletId: order.outletId,
    amount: order.total,
    reason: 'order'
  }, tenantId);
  
  return result;
};

module.exports = {
  getLoyaltyRules,
  updateLoyaltyRules,
  getCustomerLoyalty,
  earnPoints,
  redeemPoints,
  getLoyaltyHistory,
  processOrderLoyalty
};
