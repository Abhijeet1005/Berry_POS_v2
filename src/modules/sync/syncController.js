const syncService = require('./syncService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Push sync
 * POST /api/v1/sync/push
 */
const pushSync = asyncHandler(async (req, res) => {
  const result = await syncService.pushSync(req.body, req.tenantId, req.user._id);
  
  res.json(successResponse(result, 'Push sync completed'));
});

/**
 * Pull sync
 * POST /api/v1/sync/pull
 */
const pullSync = asyncHandler(async (req, res) => {
  const result = await syncService.pullSync(req.body, req.tenantId, req.user._id);
  
  res.json(successResponse(result, 'Pull sync completed'));
});

/**
 * Get sync status
 * GET /api/v1/sync/status
 */
const getSyncStatus = asyncHandler(async (req, res) => {
  const result = await syncService.getSyncStatus(req.query, req.tenantId, req.user._id);
  
  res.json(successResponse(result, 'Sync status retrieved'));
});

/**
 * Resolve conflict
 * POST /api/v1/sync/resolve-conflict
 */
const resolveConflict = asyncHandler(async (req, res) => {
  const result = await syncService.resolveConflict(req.body, req.tenantId, req.user._id);
  
  res.json(successResponse(result, 'Conflict resolved'));
});

/**
 * Retry failed sync
 * POST /api/v1/sync/retry/:syncId
 */
const retrySync = asyncHandler(async (req, res) => {
  const result = await syncService.retrySync(req.params.syncId, req.tenantId, req.user._id);
  
  res.json(successResponse(result, 'Sync retried'));
});

module.exports = {
  pushSync,
  pullSync,
  getSyncStatus,
  resolveConflict,
  retrySync
};
