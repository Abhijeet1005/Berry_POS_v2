const Order = require('../../models/Order');
const Customer = require('../../models/Customer');
const Dish = require('../../models/Dish');
const StaffPerformance = require('../../models/StaffPerformance');
const Campaign = require('../../models/Campaign');
const { ValidationError } = require('../../utils/errorHandler');
const { getStartOfDay, getEndOfDay } = require('../../utils/dateHelper');

/**
 * Get sales analytics
 */
const getSalesAnalytics = async (query, tenantId) => {
  const { outletId, startDate, endDate, groupBy } = query;
  
  const filter = { tenantId, status: 'completed' };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  const start = startDate ? new Date(startDate) : getStartOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const end = endDate ? new Date(endDate) : getEndOfDay();
  
  filter.createdAt = { $gte: start, $lte: end };
  
  // Get all orders
  const orders = await Order.find(filter);
  
  if (orders.length === 0) {
    return {
      summary: {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalDiscount: 0
      },
      breakdown: []
    };
  }
  
  // Calculate summary
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
  const averageOrderValue = totalRevenue / totalOrders;
  
  // Order type breakdown
  const orderTypeBreakdown = {
    'dine-in': orders.filter(o => o.orderType === 'dine-in').length,
    'takeaway': orders.filter(o => o.orderType === 'takeaway').length,
    'delivery': orders.filter(o => o.orderType === 'delivery').length
  };
  
  // Payment method breakdown
  const paymentMethods = {};
  orders.forEach(order => {
    if (order.paymentMethod) {
      paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
    }
  });
  
  // Time-based breakdown
  let timeBreakdown = [];
  if (groupBy === 'day') {
    const dayMap = {};
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!dayMap[day]) {
        dayMap[day] = { date: day, orders: 0, revenue: 0 };
      }
      dayMap[day].orders += 1;
      dayMap[day].revenue += order.total;
    });
    timeBreakdown = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  } else if (groupBy === 'hour') {
    const hourMap = {};
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      if (!hourMap[hour]) {
        hourMap[hour] = { hour, orders: 0, revenue: 0 };
      }
      hourMap[hour].orders += 1;
      hourMap[hour].revenue += order.total;
    });
    timeBreakdown = Object.values(hourMap).sort((a, b) => a.hour - b.hour);
  }
  
  return {
    summary: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100
    },
    orderTypeBreakdown,
    paymentMethods,
    timeBreakdown
  };
};

/**
 * Get dish analytics
 */
const getDishAnalytics = async (query, tenantId) => {
  const { outletId, startDate, endDate, limit } = query;
  
  const filter = { tenantId, status: 'completed' };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }
  
  const orders = await Order.find(filter).populate('items.dishId', 'name price category');
  
  // Aggregate dish data
  const dishMap = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (item.dishId) {
        const dishId = item.dishId._id.toString();
        
        if (!dishMap[dishId]) {
          dishMap[dishId] = {
            dishId: item.dishId._id,
            name: item.dishId.name,
            category: item.dishId.category,
            totalOrders: 0,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        
        dishMap[dishId].totalOrders += 1;
        dishMap[dishId].totalQuantity += item.quantity;
        dishMap[dishId].totalRevenue += item.price * item.quantity;
      }
    });
  });
  
  // Convert to array and sort
  const dishAnalytics = Object.values(dishMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit ? parseInt(limit) : 50);
  
  // Get top performers
  const topByRevenue = [...dishAnalytics].slice(0, 10);
  const topByQuantity = [...dishAnalytics].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 10);
  
  return {
    topByRevenue,
    topByQuantity,
    allDishes: dishAnalytics
  };
};

/**
 * Get customer analytics
 */
const getCustomerAnalytics = async (query, tenantId) => {
  const { outletId, startDate, endDate } = query;
  
  const filter = { tenantId };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  // Get all customers
  const customers = await Customer.find(filter);
  
  // Get orders for period
  const orderFilter = { tenantId, status: 'completed' };
  
  if (outletId) {
    orderFilter.outletId = outletId;
  }
  
  if (startDate || endDate) {
    orderFilter.createdAt = {};
    if (startDate) {
      orderFilter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      orderFilter.createdAt.$lte = new Date(endDate);
    }
  }
  
  const orders = await Order.find(orderFilter);
  
  // Calculate metrics
  const totalCustomers = customers.length;
  const activeCustomers = new Set(orders.map(o => o.customerId?.toString())).size;
  const newCustomers = customers.filter(c => {
    if (startDate) {
      return c.createdAt >= new Date(startDate);
    }
    return false;
  }).length;
  
  // Customer segmentation
  const customerSpending = {};
  orders.forEach(order => {
    if (order.customerId) {
      const customerId = order.customerId.toString();
      customerSpending[customerId] = (customerSpending[customerId] || 0) + order.total;
    }
  });
  
  const spendingValues = Object.values(customerSpending);
  const avgSpending = spendingValues.length > 0 
    ? spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length 
    : 0;
  
  // Segment customers
  const highValue = spendingValues.filter(v => v > avgSpending * 2).length;
  const mediumValue = spendingValues.filter(v => v > avgSpending && v <= avgSpending * 2).length;
  const lowValue = spendingValues.filter(v => v <= avgSpending).length;
  
  // Top customers
  const topCustomers = Object.entries(customerSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([customerId, spending]) => {
      const customer = customers.find(c => c._id.toString() === customerId);
      return {
        customerId,
        name: customer?.name || 'Unknown',
        email: customer?.email,
        totalSpending: Math.round(spending * 100) / 100,
        orderCount: orders.filter(o => o.customerId?.toString() === customerId).length
      };
    });
  
  return {
    summary: {
      totalCustomers,
      activeCustomers,
      newCustomers,
      averageSpending: Math.round(avgSpending * 100) / 100
    },
    segmentation: {
      highValue,
      mediumValue,
      lowValue
    },
    topCustomers
  };
};

/**
 * Get staff analytics
 */
const getStaffAnalytics = async (query, tenantId) => {
  const { outletId, startDate, endDate } = query;
  
  const filter = { tenantId };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.date.$lte = new Date(endDate);
    }
  }
  
  const performanceRecords = await StaffPerformance.find(filter)
    .populate('staffId', 'firstName lastName email role');
  
  // Aggregate by staff
  const staffMap = {};
  
  performanceRecords.forEach(record => {
    if (record.staffId) {
      const staffId = record.staffId._id.toString();
      
      if (!staffMap[staffId]) {
        staffMap[staffId] = {
          staffId: record.staffId._id,
          name: `${record.staffId.firstName} ${record.staffId.lastName}`,
          role: record.staffId.role,
          totalOrders: 0,
          totalSales: 0,
          totalUpsells: 0,
          feedbackCount: 0,
          totalFeedbackRating: 0
        };
      }
      
      staffMap[staffId].totalOrders += record.metrics.ordersProcessed || 0;
      staffMap[staffId].totalSales += record.metrics.totalSales || 0;
      staffMap[staffId].totalUpsells += record.metrics.upsellCount || 0;
      staffMap[staffId].feedbackCount += record.metrics.feedbackCount || 0;
      staffMap[staffId].totalFeedbackRating += (record.metrics.feedbackRating || 0) * (record.metrics.feedbackCount || 0);
    }
  });
  
  // Calculate averages and sort
  const staffAnalytics = Object.values(staffMap).map(staff => ({
    ...staff,
    averageOrderValue: staff.totalOrders > 0 ? Math.round((staff.totalSales / staff.totalOrders) * 100) / 100 : 0,
    averageFeedbackRating: staff.feedbackCount > 0 ? Math.round((staff.totalFeedbackRating / staff.feedbackCount) * 100) / 100 : 0
  })).sort((a, b) => b.totalSales - a.totalSales);
  
  return {
    topPerformers: staffAnalytics.slice(0, 10),
    allStaff: staffAnalytics
  };
};

/**
 * Get campaign analytics
 */
const getCampaignAnalytics = async (query, tenantId) => {
  const { campaignId, startDate, endDate } = query;
  
  const filter = { tenantId };
  
  if (campaignId) {
    filter._id = campaignId;
  }
  
  if (startDate || endDate) {
    filter.startDate = {};
    if (startDate) {
      filter.startDate.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.startDate.$lte = new Date(endDate);
    }
  }
  
  const campaigns = await Campaign.find(filter);
  
  const analytics = campaigns.map(campaign => ({
    campaignId: campaign._id,
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    targetAudience: campaign.targetAudience,
    metrics: campaign.metrics || {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    },
    conversionRate: campaign.metrics?.sent > 0 
      ? ((campaign.metrics.converted / campaign.metrics.sent) * 100).toFixed(2) 
      : 0
  }));
  
  return analytics;
};

module.exports = {
  getSalesAnalytics,
  getDishAnalytics,
  getCustomerAnalytics,
  getStaffAnalytics,
  getCampaignAnalytics
};
