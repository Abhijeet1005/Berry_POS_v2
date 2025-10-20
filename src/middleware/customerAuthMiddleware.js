const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Customer authentication middleware
 */
const customerAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'No token provided')
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a customer token
    if (decoded.type !== 'customer') {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Invalid token type')
      );
    }

    // Get customer
    const customer = await Customer.findById(decoded.customerId);

    if (!customer) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Customer not found')
      );
    }

    if (!customer.isVerified) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Customer not verified')
      );
    }

    // Attach customer to request
    req.customer = customer;
    req.tenantId = decoded.tenantId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Invalid token')
      );
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Token expired')
      );
    }

    logger.error('Customer auth middleware error:', error);
    return res.status(500).json(
      errorResponse('INTERNAL_ERROR', 'Authentication failed')
    );
  }
};

module.exports = {
  customerAuthMiddleware
};
