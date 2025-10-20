const auditService = require('../../services/auditService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Get audit logs
 * GET /api/v1/audit/logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const filters = {
    tenantId: req.query.tenantId || req.tenantId,
    userId: req.query.userId,
    entity: req.query.entity,
    entityId: req.query.entityId,
    action: req.query.action,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50
  };

  const result = await auditService.query(filters, options);

  res.json(successResponse(result, 'Audit logs retrieved successfully'));
});

/**
 * Get audit statistics
 * GET /api/v1/audit/statistics
 */
const getAuditStatistics = asyncHandler(async (req, res) => {
  const stats = await auditService.getStatistics(
    req.query.tenantId || req.tenantId,
    req.query.startDate,
    req.query.endDate
  );

  res.json(successResponse(stats, 'Audit statistics retrieved successfully'));
});

/**
 * Export audit logs
 * GET /api/v1/audit/export
 */
const exportAuditLogs = asyncHandler(async (req, res) => {
  const filters = {
    tenantId: req.query.tenantId || req.tenantId,
    userId: req.query.userId,
    entity: req.query.entity,
    action: req.query.action,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };

  const format = req.query.format || 'json';
  const result = await auditService.export(filters, format);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(result);
  } else {
    res.json(successResponse(result, 'Audit logs exported successfully'));
  }
});

module.exports = {
  getAuditLogs,
  getAuditStatistics,
  exportAuditLogs
};
