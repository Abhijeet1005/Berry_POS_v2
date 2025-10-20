const loyaltyService = require('./loyaltyService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Get customer loyalty balance
 * GET /api/v1/loyalty/customer/:customerId
 */
const getCustomerLoyalty = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getCustomerLoyalty(req.params.customerId, req.tenantId);
  
  res.json(successResponse(result, 'Loyalty balance retrieved successfully'));
});

/**
 * Earn loyalty points
 * POST /api/v1/loyalty/earn
 */
const earnPoints = asyncHandler(async (req, res) => {
  const result = await loyaltyService.earnPoints(req.body, req.tenantId);
  
  res.json(successResponse(result, 'Loyalty points earned successfully'));
});

/**
 * Redeem loyalty points
 * POST /api/v1/loyalty/redeem
 */
const redeemPoints = asyncHandler(async (req, res) => {
  const result = await loyaltyService.redeemPoints(req.body, req.tenantId);
  
  res.json(successResponse(result, 'Loyalty points redeemed successfully'));
});

/**
 * Get loyalty rules
 * GET /api/v1/loyalty/rules
 */
const getLoyaltyRules = asyncHandler(async (req, res) => {
  const { outletId } = req.query;
  const rules = await loyaltyService.getLoyaltyRules(outletId, req.tenantId);
  
  res.json(successResponse(rules, 'Loyalty rules retrieved successfully'));
});

/**
 * Update loyalty rules
 * PUT /api/v1/loyalty/rules/:outletId
 */
const updateLoyaltyRules = asyncHandler(async (req, res) => {
  const rules = await loyaltyService.updateLoyaltyRules(req.params.outletId, req.body, req.tenantId);
  
  res.json(successResponse(rules, 'Loyalty rules updated successfully'));
});

/**
 * Get loyalty transaction history
 * GET /api/v1/loyalty/history/:customerId
 */
const getLoyaltyHistory = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getLoyaltyHistory(req.params.customerId, req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.transactions,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    { currentBalance: result.currentBalance }
  ));
});

module.exports = {
  getCustomerLoyalty,
  earnPoints,
  redeemPoints,
  getLoyaltyRules,
  updateLoyaltyRules,
  getLoyaltyHistory
};
