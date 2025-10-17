const { verifyAccessToken } = require('../utils/jwtService');
const { AuthenticationError } = require('../utils/errorHandler');
const { asyncHandler } = require('./errorMiddleware');

/**
 * Authenticate user with JWT token
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No token provided');
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    req.userRole = decoded.role;
    req.outletId = decoded.outletId;
    
    next();
  } catch (error) {
    throw new AuthenticationError(error.message);
  }
});

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyAccessToken(token);
      req.userId = decoded.userId;
      req.tenantId = decoded.tenantId;
      req.userRole = decoded.role;
      req.outletId = decoded.outletId;
    } catch (error) {
      // Silently fail for optional auth
    }
  }
  
  next();
});

module.exports = {
  authenticate,
  optionalAuth
};
