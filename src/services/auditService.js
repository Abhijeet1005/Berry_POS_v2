const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Audit service for logging critical operations
 */
class AuditService {
  /**
   * Create audit log entry
   */
  async log(auditData) {
    try {
      const {
        tenantId,
        userId,
        action,
        entity,
        entityId,
        changes,
        metadata,
        ipAddress,
        userAgent
      } = auditData;

      const auditLog = new AuditLog({
        tenantId,
        userId,
        action,
        entity,
        entityId,
        changes,
        metadata,
        ipAddress,
        userAgent,
        timestamp: new Date()
      });

      await auditLog.save();
      
      return auditLog;
    } catch (error) {
      logger.error('Audit log creation failed:', error);
      // Don't throw error - audit logging should not break the main flow
      return null;
    }
  }

  /**
   * Log data creation
   */
  async logCreate(entity, entityId, data, context) {
    return await this.log({
      tenantId: context.tenantId,
      userId: context.userId,
      action: 'create',
      entity,
      entityId,
      changes: { new: data },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });
  }

  /**
   * Log data update
   */
  async logUpdate(entity, entityId, oldData, newData, context) {
    return await this.log({
      tenantId: context.tenantId,
      userId: context.userId,
      action: 'update',
      entity,
      entityId,
      changes: {
        old: oldData,
        new: newData
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });
  }

  /**
   * Log data deletion
   */
  async logDelete(entity, entityId, data, context) {
    return await this.log({
      tenantId: context.tenantId,
      userId: context.userId,
      action: 'delete',
      entity,
      entityId,
      changes: { old: data },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });
  }

  /**
   * Log authentication event
   */
  async logAuth(action, userId, metadata, context) {
    return await this.log({
      tenantId: context.tenantId,
      userId,
      action: `auth_${action}`,
      entity: 'user',
      entityId: userId,
      metadata,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });
  }

  /**
   * Log permission change
   */
  async logPermissionChange(userId, oldRole, newRole, context) {
    return await this.log({
      tenantId: context.tenantId,
      userId: context.userId,
      action: 'permission_change',
      entity: 'user',
      entityId: userId,
      changes: {
        old: { role: oldRole },
        new: { role: newRole }
      },
      metadata: { type: 'role_change' },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(eventType, metadata, context) {
    return await this.log({
      tenantId: context.tenantId,
      userId: context.userId,
      action: 'security_event',
      entity: 'system',
      metadata: {
        eventType,
        ...metadata
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    });
  }

  /**
   * Query audit logs
   */
  async query(filters, options = {}) {
    try {
      const {
        tenantId,
        userId,
        entity,
        entityId,
        action,
        startDate,
        endDate
      } = filters;

      const {
        page = 1,
        limit = 50,
        sort = { timestamp: -1 }
      } = options;

      const query = {};

      if (tenantId) query.tenantId = tenantId;
      if (userId) query.userId = userId;
      if (entity) query.entity = entity;
      if (entityId) query.entityId = entityId;
      if (action) query.action = action;

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('userId', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        AuditLog.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Audit log query failed:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(tenantId, startDate, endDate) {
    try {
      const query = { tenantId };

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const logs = await AuditLog.find(query);

      const stats = {
        total: logs.length,
        byAction: {},
        byEntity: {},
        byUser: {},
        timeline: []
      };

      logs.forEach(log => {
        // Count by action
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

        // Count by entity
        stats.byEntity[log.entity] = (stats.byEntity[log.entity] || 0) + 1;

        // Count by user
        if (log.userId) {
          const userId = log.userId.toString();
          stats.byUser[userId] = (stats.byUser[userId] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Audit statistics failed:', error);
      throw error;
    }
  }

  /**
   * Export audit logs
   */
  async export(filters, format = 'json') {
    try {
      const result = await this.query(filters, { limit: 10000 });
      
      if (format === 'csv') {
        return this.convertToCSV(result.logs);
      }

      return result.logs;
    } catch (error) {
      logger.error('Audit log export failed:', error);
      throw error;
    }
  }

  /**
   * Convert logs to CSV format
   */
  convertToCSV(logs) {
    const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address'];
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.userId?.email || 'System',
      log.action,
      log.entity,
      log.entityId || '',
      log.ipAddress || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }
}

module.exports = new AuditService();
