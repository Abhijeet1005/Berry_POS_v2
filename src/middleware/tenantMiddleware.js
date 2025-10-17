const { AuthorizationError } = require('../utils/errorHandler');
const { asyncHandler } = require('./errorMiddleware');

/**
 * Inject tenant context into request
 * Requires authentication middleware to run first
 */
const injectTenantContext = asyncHandler(async (req, res, next) => {
  if (!req.tenantId) {
    throw new AuthorizationError('Tenant context not found');
  }
  
  // Tenant ID is already set by auth middleware
  // This middleware can be extended to fetch tenant details if needed
  
  next();
});

/**
 * Validate tenant access for specific resource
 */
const validateTenantAccess = (resourceTenantIdField = 'tenantId') => {
  return asyncHandler(async (req, res, next) => {
    const resourceTenantId = req.body[resourceTenantIdField] || 
                            req.params[resourceTenantIdField] ||
                            req.query[resourceTenantIdField];
    
    if (resourceTenantId && resourceTenantId.toString() !== req.tenantId.toString()) {
      throw new AuthorizationError('Access denied to this tenant resource');
    }
    
    next();
  });
};

/**
 * Add tenant filter to query
 */
const addTenantFilter = (req, res, next) => {
  if (!req.tenantId) {
    throw new AuthorizationError('Tenant context not found');
  }
  
  // Add tenant filter to query params
  req.tenantFilter = { tenantId: req.tenantId };
  
  next();
};

module.exports = {
  injectTenantContext,
  validateTenantAccess,
  addTenantFilter
};
