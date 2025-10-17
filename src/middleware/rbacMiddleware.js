const { ROLES } = require('../config/constants');
const { AuthorizationError } = require('../utils/errorHandler');

/**
 * Permission matrix defining what each role can do
 */
const permissions = {
  [ROLES.ADMIN]: ['*'], // Admin has all permissions
  
  [ROLES.MANAGER]: [
    'orders.*',
    'menu.*',
    'dishes.*',
    'categories.*',
    'tables.*',
    'staff.read',
    'staff.create',
    'staff.update',
    'reports.*',
    'analytics.*',
    'coupons.*',
    'campaigns.*',
    'feedback.*',
    'reservations.*',
    'valet.*'
  ],
  
  [ROLES.CAPTAIN]: [
    'orders.create',
    'orders.read',
    'orders.update',
    'tables.*',
    'dishes.read',
    'categories.read',
    'customers.read',
    'feedback.create',
    'reservations.read',
    'reservations.update',
    'valet.create',
    'valet.read'
  ],
  
  [ROLES.CASHIER]: [
    'orders.read',
    'payments.*',
    'dishes.read',
    'coupons.validate',
    'loyalty.read',
    'loyalty.redeem'
  ],
  
  [ROLES.KITCHEN]: [
    'kot.read',
    'kot.update',
    'orders.read',
    'dishes.read'
  ]
};

/**
 * Check if user has permission
 */
const hasPermission = (userRole, requiredPermission) => {
  const userPermissions = permissions[userRole] || [];
  
  // Admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Check exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check wildcard match (e.g., 'orders.*' matches 'orders.create')
  const wildcardPermissions = userPermissions.filter(p => p.endsWith('.*'));
  for (const wildcardPerm of wildcardPermissions) {
    const prefix = wildcardPerm.slice(0, -2); // Remove '.*'
    if (requiredPermission.startsWith(prefix + '.')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Middleware to check if user has required permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.userRole) {
      throw new AuthorizationError('User role not found');
    }
    
    if (!hasPermission(req.userRole, permission)) {
      throw new AuthorizationError('Insufficient permissions');
    }
    
    next();
  };
};

/**
 * Middleware to check if user has any of the required roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      throw new AuthorizationError('User role not found');
    }
    
    if (!roles.includes(req.userRole)) {
      throw new AuthorizationError('Insufficient permissions');
    }
    
    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Middleware to check if user is manager or admin
 */
const requireManager = requireRole(ROLES.ADMIN, ROLES.MANAGER);

module.exports = {
  hasPermission,
  requirePermission,
  requireRole,
  requireAdmin,
  requireManager
};
