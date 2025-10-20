const staffService = require('./staffService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Create staff member
 * POST /api/v1/staff
 */
const createStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.createStaff(req.body, req.tenantId);
  
  res.status(201).json(successResponse(staff, 'Staff member created successfully'));
});

/**
 * Get all staff
 * GET /api/v1/staff
 */
const getStaff = asyncHandler(async (req, res) => {
  const result = await staffService.getStaff(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.staff,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

/**
 * Get staff by ID
 * GET /api/v1/staff/:id
 */
const getStaffMember = asyncHandler(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id, req.tenantId);
  
  res.json(successResponse(staff, 'Staff member retrieved successfully'));
});

/**
 * Update staff
 * PUT /api/v1/staff/:id
 */
const updateStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.updateStaff(req.params.id, req.body, req.tenantId);
  
  res.json(successResponse(staff, 'Staff member updated successfully'));
});

/**
 * Delete staff (deactivate)
 * DELETE /api/v1/staff/:id
 */
const deleteStaff = asyncHandler(async (req, res) => {
  const result = await staffService.deleteStaff(req.params.id, req.tenantId);
  
  res.json(successResponse(result, 'Staff member deactivated successfully'));
});

/**
 * Get staff performance
 * GET /api/v1/staff/:id/performance
 */
const getStaffPerformance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const performance = await staffService.getStaffPerformance(
    req.params.id,
    startDate,
    endDate,
    req.tenantId
  );
  
  res.json(successResponse(performance, 'Performance retrieved successfully'));
});

/**
 * Get staff by outlet
 * GET /api/v1/staff/outlet/:outletId
 */
const getStaffByOutlet = asyncHandler(async (req, res) => {
  const staff = await staffService.getStaffByOutlet(req.params.outletId, req.tenantId);
  
  res.json(successResponse(staff, 'Staff retrieved successfully'));
});

module.exports = {
  createStaff,
  getStaff,
  getStaffMember,
  updateStaff,
  deleteStaff,
  getStaffPerformance,
  getStaffByOutlet
};
