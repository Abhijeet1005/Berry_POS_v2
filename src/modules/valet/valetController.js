const valetService = require('./valetService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Create valet request
 * POST /api/v1/valet/requests
 */
const createValetRequest = asyncHandler(async (req, res) => {
  const request = await valetService.createValetRequest(req.body, req.tenantId);
  
  res.status(201).json(successResponse(request, 'Valet request created successfully'));
});

/**
 * Get valet request by ID
 * GET /api/v1/valet/requests/:id
 */
const getValetRequestById = asyncHandler(async (req, res) => {
  const request = await valetService.getValetRequestById(req.params.id, req.tenantId);
  
  res.json(successResponse(request, 'Valet request retrieved successfully'));
});

/**
 * Update valet status
 * PATCH /api/v1/valet/requests/:id/status
 */
const updateValetStatus = asyncHandler(async (req, res) => {
  const request = await valetService.updateValetStatus(
    req.params.id,
    req.body,
    req.tenantId,
    req.user._id
  );
  
  res.json(successResponse(request, 'Valet status updated successfully'));
});

/**
 * Get customer valet requests
 * GET /api/v1/valet/requests/customer/:customerId
 */
const getCustomerRequests = asyncHandler(async (req, res) => {
  const result = await valetService.getCustomerRequests(
    req.params.customerId,
    req.query,
    req.tenantId
  );
  
  res.json(paginatedResponse(
    result.requests,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

/**
 * Get valet performance
 * GET /api/v1/valet/performance
 */
const getValetPerformance = asyncHandler(async (req, res) => {
  const performance = await valetService.getValetPerformance(req.query, req.tenantId);
  
  res.json(successResponse(performance, 'Performance metrics retrieved successfully'));
});

/**
 * Get active valet requests
 * GET /api/v1/valet/requests
 */
const getActiveRequests = asyncHandler(async (req, res) => {
  const result = await valetService.getActiveRequests(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.requests,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

module.exports = {
  createValetRequest,
  getValetRequestById,
  updateValetStatus,
  getCustomerRequests,
  getValetPerformance,
  getActiveRequests
};
