const couponService = require('./couponService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Create coupon
 * POST /api/v1/coupons
 */
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body, req.tenantId);
  
  res.status(201).json(successResponse(coupon, 'Coupon created successfully'));
});

/**
 * Get all coupons
 * GET /api/v1/coupons
 */
const getCoupons = asyncHandler(async (req, res) => {
  const result = await couponService.getCoupons(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.coupons,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

/**
 * Get coupon by code
 * GET /api/v1/coupons/:code
 */
const getCouponByCode = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponByCode(req.params.code, req.tenantId);
  
  res.json(successResponse(coupon, 'Coupon retrieved successfully'));
});

/**
 * Update coupon
 * PUT /api/v1/coupons/:id
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body, req.tenantId);
  
  res.json(successResponse(coupon, 'Coupon updated successfully'));
});

/**
 * Delete coupon
 * DELETE /api/v1/coupons/:id
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const result = await couponService.deleteCoupon(req.params.id, req.tenantId);
  
  res.json(successResponse(result, 'Coupon deleted successfully'));
});

/**
 * Validate coupon
 * POST /api/v1/coupons/validate
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const result = await couponService.validateCoupon(req.body, req.tenantId);
  
  res.json(successResponse(result, 'Coupon validated successfully'));
});

/**
 * Get coupon usage
 * GET /api/v1/coupons/:id/usage
 */
const getCouponUsage = asyncHandler(async (req, res) => {
  const result = await couponService.getCouponUsage(req.params.id, req.tenantId);
  
  res.json(successResponse(result, 'Usage statistics retrieved successfully'));
});

module.exports = {
  createCoupon,
  getCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponUsage
};
