const auditService = require('../services/auditService');
const logger = require('../utils/logger');

/**
 * Audit middleware for logging critical operations
 */
const auditMiddleware = (options = {}) => {
  const {
    entity,
    action,
    entityIdExtractor = null,
    dataExtractor = null
  } = options;

  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to log after successful response
    res.json = async (data) => {
      try {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const context = {
            tenantId: req.tenantId,
            userId: req.user?._id,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          };

          const entityId = entityIdExtractor 
            ? entityIdExtractor(req, data) 
            : req.params.id;

          const extractedData = dataExtractor 
            ? dataExtractor(req, data) 
            : req.body;

          // Determine action from HTTP method if not specified
          let auditAction = action;
          if (!auditAction) {
            switch (req.method) {
              case 'POST':
                auditAction = 'create';
                break;
              case 'PUT':
              case 'PATCH':
                auditAction = 'update';
                break;
              case 'DELETE':
                auditAction = 'delete';
                break;
              default:
                auditAction = 'read';
            }
          }

          // Log the operation
          await auditService.log({
            ...context,
            action: auditAction,
            entity: entity || req.baseUrl.split('/').pop(),
            entityId,
            changes: { new: extractedData },
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode
            }
          });
        }
      } catch (error) {
        logger.error('Audit middleware error:', error);
        // Don't fail the request if audit logging fails
      }

      // Send response
      return originalJson(data);
    };

    next();
  };
};

/**
 * Audit authentication events
 */
const auditAuth = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const context = {
            tenantId: req.tenantId,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          };

          await auditService.logAuth(
            action,
            req.user?._id || req.body.email,
            {
              success: true,
              email: req.body.email
            },
            context
          );
        }
      } catch (error) {
        logger.error('Auth audit error:', error);
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Audit permission changes
 */
const auditPermissionChange = async (req, res, next) => {
  // Store old data before update
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.params.id);
      
      if (user && req.body.role && user.role !== req.body.role) {
        req.oldRole = user.role;
        req.newRole = req.body.role;
      }
    } catch (error) {
      logger.error('Permission audit preparation error:', error);
    }
  }

  const originalJson = res.json.bind(res);

  res.json = async (data) => {
    try {
      if (req.oldRole && req.newRole && res.statusCode >= 200 && res.statusCode < 300) {
        const context = {
          tenantId: req.tenantId,
          userId: req.user?._id,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        };

        await auditService.logPermissionChange(
          req.params.id,
          req.oldRole,
          req.newRole,
          context
        );
      }
    } catch (error) {
      logger.error('Permission change audit error:', error);
    }

    return originalJson(data);
  };

  next();
};

module.exports = {
  auditMiddleware,
  auditAuth,
  auditPermissionChange
};
