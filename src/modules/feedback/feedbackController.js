const feedbackService = require('./feedbackService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Create feedback
 * POST /api/v1/feedback
 */
const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.createFeedback(req.body, req.tenantId);
  
  res.status(201).json(successResponse(feedback, 'Feedback submitted successfully'));
});

/**
 * Get feedback by ID
 * GET /api/v1/feedback/:id
 */
const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.getFeedbackById(req.params.id, req.tenantId);
  
  res.json(successResponse(feedback, 'Feedback retrieved successfully'));
});

/**
 * Get feedback by order
 * GET /api/v1/feedback/order/:orderId
 */
const getFeedbackByOrder = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.getFeedbackByOrder(req.params.orderId, req.tenantId);
  
  res.json(successResponse(feedback, 'Feedback retrieved successfully'));
});

/**
 * Respond to feedback
 * POST /api/v1/feedback/:id/respond
 */
const respondToFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.respondToFeedback(
    req.params.id,
    req.body,
    req.tenantId,
    req.user._id
  );
  
  res.json(successResponse(feedback, 'Response submitted successfully'));
});

/**
 * Get feedback analytics
 * GET /api/v1/feedback/analytics
 */
const getFeedbackAnalytics = asyncHandler(async (req, res) => {
  const analytics = await feedbackService.getFeedbackAnalytics(req.query, req.tenantId);
  
  res.json(successResponse(analytics, 'Analytics retrieved successfully'));
});

/**
 * Get all feedback
 * GET /api/v1/feedback
 */
const getAllFeedback = asyncHandler(async (req, res) => {
  const result = await feedbackService.getAllFeedback(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.feedback,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

module.exports = {
  createFeedback,
  getFeedbackById,
  getFeedbackByOrder,
  respondToFeedback,
  getFeedbackAnalytics,
  getAllFeedback
};
