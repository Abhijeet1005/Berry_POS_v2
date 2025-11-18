const express = require('express');
const router = express.Router();
const dynoApiController = require('./dynoApiController');
const { authenticate } = require('../../../middleware/authMiddleware');
const { injectTenantContext } = require('../../../middleware/tenantMiddleware');
const { requirePermission } = require('../../../middleware/rbacMiddleware');

// Apply authentication and tenant context to all routes
router.use(authenticate);
router.use(injectTenantContext);

/**
 * @route   POST /api/v1/integrations/dynoapi/sync-orders
 * @desc    Manually sync orders from platforms
 * @access  Private (Manager+)
 */
router.post(
  '/sync-orders',
  requirePermission('integrations.manage'),
  dynoApiController.syncOrders
);

/**
 * @route   POST /api/v1/integrations/dynoapi/sync-items
 * @desc    Manually sync items to platforms
 * @access  Private (Manager+)
 */
router.post(
  '/sync-items',
  requirePermission('integrations.manage'),
  dynoApiController.syncItems
);

/**
 * @route   POST /api/v1/integrations/dynoapi/close-outlet
 * @desc    Close outlet on platforms
 * @access  Private (Manager+)
 */
router.post(
  '/close-outlet',
  requirePermission('integrations.manage'),
  dynoApiController.closeOutlet
);

/**
 * @route   GET /api/v1/integrations/dynoapi/status
 * @desc    Get integration status
 * @access  Private (Manager+)
 */
router.get(
  '/status',
  requirePermission('integrations.read'),
  dynoApiController.getIntegrationStatus
);

/**
 * @route   POST /api/v1/integrations/dynoapi/item-mapping
 * @desc    Update item mapping
 * @access  Private (Manager+)
 */
router.post(
  '/item-mapping',
  requirePermission('integrations.manage'),
  dynoApiController.updateItemMapping
);

/**
 * @route   POST /api/v1/integrations/dynoapi/auto-map
 * @desc    Auto-map items by name
 * @access  Private (Manager+)
 */
router.post(
  '/auto-map',
  requirePermission('integrations.manage'),
  dynoApiController.autoMapItems
);

/**
 * @route   GET /api/v1/integrations/dynoapi/platform-items
 * @desc    Fetch items from platform
 * @access  Private (Manager+)
 */
router.get(
  '/platform-items',
  requirePermission('integrations.read'),
  dynoApiController.fetchPlatformItems
);

/**
 * @route   POST /api/v1/integrations/dynoapi/integration
 * @desc    Create or update integration
 * @access  Private (Manager+)
 */
router.post(
  '/integration',
  requirePermission('integrations.manage'),
  dynoApiController.upsertIntegration
);

/**
 * @route   POST /api/v1/integrations/dynoapi/disable
 * @desc    Disable integration
 * @access  Private (Manager+)
 */
router.post(
  '/disable',
  requirePermission('integrations.manage'),
  dynoApiController.disableIntegration
);

module.exports = router;
