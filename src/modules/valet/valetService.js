const ValetRequest = require('../../models/ValetRequest');
const Customer = require('../../models/Customer');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');
const { diffInMinutes } = require('../../utils/dateHelper');

/**
 * Create valet request
 */
const createValetRequest = async (requestData, tenantId) => {
  const { customerId, outletId, vehicleNumber, vehicleType, parkingSpot, requestType } = requestData;
  
  // Validate customer
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  // Check for active request
  if (requestType === 'park') {
    const activeRequest = await ValetRequest.findOne({
      customerId,
      tenantId,
      outletId,
      status: { $in: ['pending', 'assigned', 'parked'] }
    });
    
    if (activeRequest) {
      throw new ValidationError('Customer already has an active valet request');
    }
  }
  
  const request = new ValetRequest({
    customerId,
    tenantId,
    outletId,
    vehicleNumber: vehicleNumber.toUpperCase(),
    vehicleType,
    parkingSpot,
    requestType,
    status: 'pending'
  });
  
  await request.save();
  
  return request;
};

/**
 * Get valet request by ID
 */
const getValetRequestById = async (requestId, tenantId) => {
  const request = await ValetRequest.findOne({ _id: requestId, tenantId })
    .populate('customerId', 'name phone')
    .populate('outletId', 'name')
    .populate('assignedTo', 'firstName lastName phone');
  
  if (!request) {
    throw new NotFoundError('Valet request');
  }
  
  return request;
};

/**
 * Update valet request status
 */
const updateValetStatus = async (requestId, statusData, tenantId, userId) => {
  const { status, assignedTo, parkingSpot, notes } = statusData;
  
  const request = await ValetRequest.findOne({ _id: requestId, tenantId });
  
  if (!request) {
    throw new NotFoundError('Valet request');
  }
  
  // Validate status transitions
  const validTransitions = {
    'pending': ['assigned', 'cancelled'],
    'assigned': ['parked', 'retrieved', 'cancelled'],
    'parked': ['assigned', 'cancelled'],
    'retrieved': ['completed'],
    'completed': [],
    'cancelled': []
  };
  
  if (!validTransitions[request.status].includes(status)) {
    throw new ValidationError(`Cannot transition from ${request.status} to ${status}`);
  }
  
  // Update status
  request.status = status;
  
  // Handle status-specific updates
  if (status === 'assigned' && assignedTo) {
    request.assignedTo = assignedTo;
    request.assignedAt = new Date();
  }
  
  if (status === 'parked') {
    if (parkingSpot) {
      request.parkingSpot = parkingSpot;
    }
    request.parkedAt = new Date();
  }
  
  if (status === 'retrieved') {
    request.retrievedAt = new Date();
  }
  
  if (status === 'completed') {
    request.completedAt = new Date();
    
    // Calculate service time
    if (request.assignedAt && request.completedAt) {
      request.serviceTime = diffInMinutes(request.completedAt, request.assignedAt);
    }
  }
  
  if (notes) {
    request.notes = notes;
  }
  
  await request.save();
  
  return request;
};

/**
 * Get valet requests for customer
 */
const getCustomerRequests = async (customerId, query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { customerId, tenantId };
  
  if (query.status) {
    filter.status = query.status;
  }
  
  const requests = await ValetRequest.find(filter)
    .populate('outletId', 'name')
    .populate('assignedTo', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await ValetRequest.countDocuments(filter);
  
  return {
    requests,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get valet performance metrics
 */
const getValetPerformance = async (query, tenantId) => {
  const { outletId, valetId, startDate, endDate } = query;
  
  const filter = { tenantId, status: 'completed' };
  
  if (outletId) {
    filter.outletId = outletId;
  }
  
  if (valetId) {
    filter.assignedTo = valetId;
  }
  
  if (startDate || endDate) {
    filter.completedAt = {};
    if (startDate) {
      filter.completedAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.completedAt.$lte = new Date(endDate);
    }
  }
  
  const requests = await ValetRequest.find(filter);
  
  if (requests.length === 0) {
    return {
      totalRequests: 0,
      averageServiceTime: 0,
      fastestService: 0,
      slowestService: 0
    };
  }
  
  const serviceTimes = requests
    .filter(r => r.serviceTime)
    .map(r => r.serviceTime);
  
  const totalServiceTime = serviceTimes.reduce((sum, time) => sum + time, 0);
  const averageServiceTime = serviceTimes.length > 0 
    ? (totalServiceTime / serviceTimes.length).toFixed(2) 
    : 0;
  
  return {
    totalRequests: requests.length,
    averageServiceTime: parseFloat(averageServiceTime),
    fastestService: serviceTimes.length > 0 ? Math.min(...serviceTimes) : 0,
    slowestService: serviceTimes.length > 0 ? Math.max(...serviceTimes) : 0,
    requestsByType: {
      park: requests.filter(r => r.requestType === 'park').length,
      retrieve: requests.filter(r => r.requestType === 'retrieve').length
    }
  };
};

/**
 * Get active valet requests
 */
const getActiveRequests = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { 
    tenantId,
    status: { $in: ['pending', 'assigned', 'parked'] }
  };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }
  
  const requests = await ValetRequest.find(filter)
    .populate('customerId', 'name phone')
    .populate('outletId', 'name')
    .populate('assignedTo', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: 1 });
  
  const total = await ValetRequest.countDocuments(filter);
  
  return {
    requests,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

module.exports = {
  createValetRequest,
  getValetRequestById,
  updateValetStatus,
  getCustomerRequests,
  getValetPerformance,
  getActiveRequests
};
