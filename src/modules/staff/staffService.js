const User = require('../../models/User');
const StaffPerformance = require('../../models/StaffPerformance');
const Order = require('../../models/Order');
const Feedback = require('../../models/Feedback');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');
const { getStartOfDay, getEndOfDay } = require('../../utils/dateHelper');

/**
 * Create staff member
 */
const createStaff = async (staffData, tenantId) => {
  const { email, password, firstName, lastName, phone, role, outletId } = staffData;
  
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }
  
  const staff = new User({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    tenantId,
    outletId
  });
  
  await staff.save();
  
  return staff;
};

/**
 * Get all staff members
 */
const getStaff = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.role) {
    filter.role = query.role;
  }
  
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  
  const staff = await User.find(filter)
    .select('-password -twoFactorSecret')
    .skip(skip)
    .limit(limit)
    .sort({ firstName: 1 });
  
  const total = await User.countDocuments(filter);
  
  return {
    staff,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get staff by ID
 */
const getStaffById = async (staffId, tenantId) => {
  const staff = await User.findOne({ _id: staffId, tenantId })
    .select('-password -twoFactorSecret')
    .populate('outletId', 'name');
  
  if (!staff) {
    throw new NotFoundError('Staff member');
  }
  
  return staff;
};

/**
 * Update staff
 */
const updateStaff = async (staffId, updateData, tenantId) => {
  const staff = await User.findOne({ _id: staffId, tenantId });
  
  if (!staff) {
    throw new NotFoundError('Staff member');
  }
  
  // Prevent updating sensitive fields
  delete updateData.password;
  delete updateData.email;
  delete updateData.tenantId;
  delete updateData.twoFactorSecret;
  
  Object.assign(staff, updateData);
  await staff.save();
  
  return staff;
};

/**
 * Delete staff (deactivate)
 */
const deleteStaff = async (staffId, tenantId) => {
  const staff = await User.findOne({ _id: staffId, tenantId });
  
  if (!staff) {
    throw new NotFoundError('Staff member');
  }
  
  staff.isActive = false;
  await staff.save();
  
  return { message: 'Staff member deactivated successfully' };
};

/**
 * Get staff performance
 */
const getStaffPerformance = async (staffId, startDate, endDate, tenantId) => {
  const staff = await User.findOne({ _id: staffId, tenantId });
  
  if (!staff) {
    throw new NotFoundError('Staff member');
  }
  
  const start = startDate ? new Date(startDate) : getStartOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const end = endDate ? new Date(endDate) : getEndOfDay();
  
  // Get performance records
  const performanceRecords = await StaffPerformance.find({
    staffId,
    tenantId,
    date: { $gte: start, $lte: end }
  }).sort({ date: -1 });
  
  // Calculate aggregated metrics
  const totalOrders = performanceRecords.reduce((sum, r) => sum + r.metrics.ordersProcessed, 0);
  const totalSales = performanceRecords.reduce((sum, r) => sum + r.metrics.totalSales, 0);
  const totalUpsells = performanceRecords.reduce((sum, r) => sum + r.metrics.upsellCount, 0);
  const totalFeedbackCount = performanceRecords.reduce((sum, r) => sum + r.metrics.feedbackCount, 0);
  const avgFeedbackRating = totalFeedbackCount > 0
    ? performanceRecords.reduce((sum, r) => sum + (r.metrics.feedbackRating * r.metrics.feedbackCount), 0) / totalFeedbackCount
    : 0;
  
  // Get recent orders
  const recentOrders = await Order.find({
    staffId,
    tenantId,
    createdAt: { $gte: start, $lte: end }
  })
    .select('orderNumber total status createdAt')
    .sort({ createdAt: -1 })
    .limit(10);
  
  // Get recent feedback
  const recentFeedback = await Feedback.find({
    tenantId,
    createdAt: { $gte: start, $lte: end }
  })
    .populate({
      path: 'orderId',
      match: { staffId },
      select: 'orderNumber'
    })
    .sort({ createdAt: -1 })
    .limit(10);
  
  const filteredFeedback = recentFeedback.filter(f => f.orderId !== null);
  
  return {
    staff: {
      _id: staff._id,
      name: staff.fullName,
      email: staff.email,
      role: staff.role
    },
    period: {
      startDate: start,
      endDate: end
    },
    summary: {
      totalOrders,
      totalSales,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      totalUpsells,
      averageFeedbackRating: avgFeedbackRating.toFixed(2),
      totalFeedbackCount
    },
    dailyPerformance: performanceRecords,
    recentOrders,
    recentFeedback: filteredFeedback
  };
};

/**
 * Get staff by outlet
 */
const getStaffByOutlet = async (outletId, tenantId) => {
  const staff = await User.find({
    tenantId,
    outletId,
    isActive: true
  })
    .select('-password -twoFactorSecret')
    .sort({ role: 1, firstName: 1 });
  
  return staff;
};

/**
 * Update staff performance (called by background worker)
 */
const updateStaffPerformance = async (staffId, date, metrics, tenantId) => {
  const performance = await StaffPerformance.findOneAndUpdate(
    {
      staffId,
      tenantId,
      date: getStartOfDay(date)
    },
    {
      $set: { metrics }
    },
    {
      upsert: true,
      new: true
    }
  );
  
  return performance;
};

module.exports = {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffPerformance,
  getStaffByOutlet,
  updateStaffPerformance
};
