const Joi = require('joi');
const { ValidationError } = require('../utils/errorHandler');

/**
 * Validate request data against Joi schema
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      throw new ValidationError('Validation failed', details);
    }
    
    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  const schema = Joi.object({
    [paramName]: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  });
  
  return validate(schema, 'params');
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),
  
  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }),
  
  // ObjectId
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  
  // Email
  email: Joi.string().email().lowercase().trim(),
  
  // Phone
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  
  // Password
  password: Joi.string().min(8).max(128),
  
  // URL
  url: Joi.string().uri()
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/[<>]/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  
  next();
};

module.exports = {
  validate,
  validateObjectId,
  commonSchemas,
  sanitizeInput
};
