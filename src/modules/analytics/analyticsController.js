const analyticsService = require('./analyticsService');
const reportService = require('./reportService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Get sales analytics
 * GET /api/v1/analytics/sales
 */
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getSalesAnalytics(req.query, req.tenantId);
  
  res.json(successResponse(analytics, 'Sales analytics retrieved successfully'));
});

/**
 * Get dish analytics
 * GET /api/v1/analytics/dishes
 */
const getDishAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getDishAnalytics(req.query, req.tenantId);
  
  res.json(successResponse(analytics, 'Dish analytics retrieved successfully'));
});

/**
 * Get customer analytics
 * GET /api/v1/analytics/customers
 */
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getCustomerAnalytics(req.query, req.tenantId);
  
  res.json(successResponse(analytics, 'Customer analytics retrieved successfully'));
});

/**
 * Get staff analytics
 * GET /api/v1/analytics/staff
 */
const getStaffAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getStaffAnalytics(req.query, req.tenantId);
  
  res.json(successResponse(analytics, 'Staff analytics retrieved successfully'));
});

/**
 * Get campaign analytics
 * GET /api/v1/analytics/campaigns
 */
const getCampaignAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getCampaignAnalytics(req.query, req.tenantId);
  
  res.json(successResponse(analytics, 'Campaign analytics retrieved successfully'));
});

/**
 * Export report
 * POST /api/v1/analytics/reports/export
 */
const exportReport = asyncHandler(async (req, res) => {
  const { reportType, format, ...params } = req.body;
  
  const result = await reportService.exportReport(reportType, format, params, req.tenantId);
  
  if (format === 'json') {
    res.json(successResponse(result, 'Report generated successfully'));
  } else {
    // For file exports, send the file
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  }
});

module.exports = {
  getSalesAnalytics,
  getDishAnalytics,
  getCustomerAnalytics,
  getStaffAnalytics,
  getCampaignAnalytics,
  exportReport
};
