const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    tenantId: req.tenantId,
    userId: req.userId
  });

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Validation failed', details)
    );
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    return res.status(400).json(
      errorResponse('INVALID_ID', `Invalid ${err.path}: ${err.value}`)
    );
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json(
      errorResponse('DUPLICATE_ERROR', `${field} already exists`)
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      errorResponse('INVALID_TOKEN', 'Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      errorResponse('TOKEN_EXPIRED', 'Token expired')
    );
  }

  // Handle unknown errors
  return res.status(500).json(
    errorResponse('INTERNAL_ERROR', 'An unexpected error occurred')
  );
};

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res) => {
  res.status(404).json(
    errorResponse('NOT_FOUND', 'Route not found')
  );
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
