const Feedback = require('../../models/Feedback');
const Order = require('../../models/Order');
const Customer = require('../../models/Customer');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');
const loyaltyService = require('../loyalty/loyaltyService');
const logger = require('../../utils/logger');

/**
 * Analyze sentiment from feedback text
 */
const analyzeSentiment = (text, rating) => {
  if (!text) {
    return rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
  }
  
  const positiveWords = ['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect', 'delicious', 'awesome'];
  const negativeWords = ['bad', 'terrible', 'horrible', 'worst', 'poor', 'disappointing', 'awful', 'disgusting', 'slow', 'cold'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  
  return rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
};

/**
 * Create feedback
 */
const createFeedback = async (feedbackData, tenantId) => {
  const { orderId, customerId, rating, comment, categories } = feedbackData;
  
  // Validate order exists
  const order = await Order.findOne({ _id: orderId, tenantId });
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  // Check if feedback already exists for this order
  const existingFeedback = await Feedback.findOne({ orderId, tenantId });
  if (existingFeedback) {
    throw new ValidationError('Feedback already submitted for this order');
  }
  
  // Analyze sentiment
  const sentiment = analyzeSentiment(comment, rating);
  
  const feedback = new Feedback({
    orderId,
    customerId,
    tenantId,
    outletId: order.outletId,
    rating,
    comment,
    categories: categories || [],
    sentiment
  });
  
  await feedback.save();
  
  // Award loyalty points for feedback
  try {
    await loyaltyService.earnPoints({
      customerId,
      outletId: order.outletId,
      amount: 0,
      reason: 'feedback'
    }, tenantId);
  } catch (error) {
    logger.error('Failed to award loyalty points for feedback:', error);
  }
  
  // Send alert for negative feedback
  if (rating < 3) {
    logger.warn('Negative feedback received', {
      feedbackId: feedback._id,
      orderId,
      rating,
      sentiment
    });
    // TODO: Send notification to owner
  }
  
  // Send Google review request for positive feedback
  if (rating >= 4) {
    logger.info('Positive feedback received - send Google review request', {
      feedbackId: feedback._id,
      customerId
    });
    // TODO: Send Google review link via WhatsApp/SMS
  }
  
  return feedback;
};

/**
 * Get feedback by ID
 */
const getFeedbackById = async (feedbackId, tenantId) => {
  const feedback = await Feedback.findOne({ _id: feedbackId, tenantId })
    .populate('orderId', 'orderNumber total createdAt')
    .populate('customerId', 'name email phone')
    .populate('outletId', 'name');
  
  if (!feedback) {
    throw new NotFoundError('Feedback');
  }
  
  return feedback;
};

/**
 * Get feedback for an order
 */
const getFeedbackByOrder = async (orderId, tenantId) => {
  const feedback = await Feedback.findOne({ orderId, tenantId })
    .populate('customerId', 'name email phone')
    .populate('outletId', 'name');
  
  if (!feedback) {
    throw new NotFoundError('Feedback for this order');
  }
  
  return feedback;
};

/**
 * Respond to feedback
 */
const respondToFeedback = async (feedbackId, responseData, tenantId, userId) => {
  const { response, couponCode, loyaltyBonus } = responseData;
  
  const feedback = await Feedback.findOne({ _id: feedbackId, tenantId });
  
  if (!feedback) {
    throw new NotFoundError('Feedback');
  }
  
  if (feedback.response) {
    throw new ValidationError('Feedback already has a response');
  }
  
  feedback.response = response;
  feedback.respondedBy = userId;
  feedback.respondedAt = new Date();
  
  if (couponCode) {
    feedback.couponOffered = couponCode;
  }
  
  await feedback.save();
  
  // Award bonus loyalty points if specified
  if (loyaltyBonus && feedback.customerId) {
    try {
      await loyaltyService.earnPoints({
        customerId: feedback.customerId,
        outletId: feedback.outletId,
        amount: loyaltyBonus,
        reason: 'bonus'
      }, tenantId);
    } catch (error) {
      logger.error('Failed to award bonus loyalty points:', error);
    }
  }
  
  return feedback;
};

/**
 * Get feedback analytics
 */
const getFeedbackAnalytics = async (query, tenantId) => {
  const { outletId, startDate, endDate } = query;
  
  const filter = { tenantId };
  
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
  
  // Get all feedback
  const allFeedback = await Feedback.find(filter);
  
  if (allFeedback.length === 0) {
    return {
      totalFeedback: 0,
      averageRating: 0,
      ratingDistribution: {},
      sentimentDistribution: {},
      responseRate: 0,
      categoryBreakdown: {}
    };
  }
  
  // Calculate metrics
  const totalFeedback = allFeedback.length;
  const totalRating = allFeedback.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = (totalRating / totalFeedback).toFixed(2);
  
  // Rating distribution
  const ratingDistribution = {
    1: allFeedback.filter(f => f.rating === 1).length,
    2: allFeedback.filter(f => f.rating === 2).length,
    3: allFeedback.filter(f => f.rating === 3).length,
    4: allFeedback.filter(f => f.rating === 4).length,
    5: allFeedback.filter(f => f.rating === 5).length
  };
  
  // Sentiment distribution
  const sentimentDistribution = {
    positive: allFeedback.filter(f => f.sentiment === 'positive').length,
    neutral: allFeedback.filter(f => f.sentiment === 'neutral').length,
    negative: allFeedback.filter(f => f.sentiment === 'negative').length
  };
  
  // Response rate
  const respondedCount = allFeedback.filter(f => f.response).length;
  const responseRate = ((respondedCount / totalFeedback) * 100).toFixed(2);
  
  // Category breakdown
  const categoryBreakdown = {};
  allFeedback.forEach(f => {
    if (f.categories && f.categories.length > 0) {
      f.categories.forEach(cat => {
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      });
    }
  });
  
  return {
    totalFeedback,
    averageRating: parseFloat(averageRating),
    ratingDistribution,
    sentimentDistribution,
    responseRate: parseFloat(responseRate),
    categoryBreakdown
  };
};

/**
 * Get all feedback with filters
 */
const getAllFeedback = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.rating) {
    filter.rating = parseInt(query.rating);
  }
  
  if (query.sentiment) {
    filter.sentiment = query.sentiment;
  }
  
  if (query.hasResponse !== undefined) {
    if (query.hasResponse === 'true') {
      filter.response = { $exists: true, $ne: null };
    } else {
      filter.response = { $exists: false };
    }
  }
  
  const feedback = await Feedback.find(filter)
    .populate('orderId', 'orderNumber total')
    .populate('customerId', 'name email')
    .populate('outletId', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await Feedback.countDocuments(filter);
  
  return {
    feedback,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

module.exports = {
  createFeedback,
  getFeedbackById,
  getFeedbackByOrder,
  respondToFeedback,
  getFeedbackAnalytics,
  getAllFeedback
};
