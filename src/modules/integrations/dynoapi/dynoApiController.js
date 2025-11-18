const orderSyncService = require('./orderSyncService');
const itemSyncService = require('./itemSyncService');
const dynoApiService = require('./dynoApiService');
const PlatformIntegration = require('../../../models/PlatformIntegration');
const { successResponse } = require('../../../utils/responseFormatter');
const { asyncHandler } = require('../../../middleware/errorMiddleware');
const { ValidationError } = require('../../../utils/errorHandler');

/**
 * Manually sync orders from platforms
 */
const syncOrders = asyncHandler(async (req, res) => {
  const { outletId } = req.body;
  const { tenantId } = req;
  
  if (!outletId) {
    throw new ValidationError('outletId is required');
  }
  
  const results = await orderSyncService.pollAllPlatforms(outletId, tenantId);
  
  res.json(successResponse({
    swiggyOrders: results.swiggy.length,
    zomatoOrders: results.zomato.length,
    totalOrders: results.swiggy.length + results.zomato.length,
    orders: results
  }, 'Orders synced successfully'));
});

/**
 * Manually sync items to platforms
 */
const syncItems = asyncHandler(async (req, res) => {
  const { outletId } = req.body;
  
  if (!outletId) {
    throw new ValidationError('outletId is required');
  }
  
  const results = await itemSyncService.syncAllItems(outletId);
  
  res.json(successResponse(results, 'Items synced successfully'));
});

/**
 * Close outlet on platforms
 */
const closeOutlet = asyncHandler(async (req, res) => {
  const { outletId, platform, reopenTime } = req.body;
  
  if (!outletId || !platform) {
    throw new ValidationError('outletId and platform are required');
  }
  
  const integration = await PlatformIntegration.findOne({
    outletId,
    platform,
    isActive: true
  });
  
  if (!integration) {
    throw new ValidationError(`No integration found for ${platform}`);
  }
  
  await dynoApiService.closeOutlet(
    platform,
    reopenTime || {},
    integration.platformRestaurantId
  );
  
  res.json(successResponse(null, `Outlet closed on ${platform}`));
});

/**
 * Get integration status
 */
const getIntegrationStatus = asyncHandler(async (req, res) => {
  const { outletId } = req.query;
  const { tenantId } = req;
  
  if (!outletId) {
    throw new ValidationError('outletId is required');
  }
  
  const integrations = await PlatformIntegration.find({
    tenantId,
    outletId
  }).select('-credentials');
  
  const status = integrations.map(integration => ({
    platform: integration.platform,
    isActive: integration.isActive,
    platformRestaurantId: integration.platformRestaurantId,
    itemMappings: integration.itemMappings.length,
    lastSyncedAt: integration.lastSyncedAt,
    syncStatus: integration.syncStatus,
    settings: integration.settings
  }));
  
  res.json(successResponse(status, 'Integration status retrieved'));
});

/**
 * Update item mapping
 */
const updateItemMapping = asyncHandler(async (req, res) => {
  const { outletId, platform, dishId, platformItemId, platformItemName } = req.body;
  const { tenantId } = req;
  
  if (!outletId || !platform || !dishId || !platformItemId) {
    throw new ValidationError('outletId, platform, dishId, and platformItemId are required');
  }
  
  const integration = await PlatformIntegration.findOne({
    tenantId,
    outletId,
    platform,
    isActive: true
  });
  
  if (!integration) {
    throw new ValidationError(`No integration found for ${platform}`);
  }
  
  await integration.updateItemMapping(dishId, platformItemId, platformItemName);
  
  res.json(successResponse(null, 'Item mapping updated'));
});

/**
 * Auto-map items by name
 */
const autoMapItems = asyncHandler(async (req, res) => {
  const { outletId, platform } = req.body;
  
  if (!outletId || !platform) {
    throw new ValidationError('outletId and platform are required');
  }
  
  const results = await itemSyncService.autoMapItems(outletId, platform);
  
  res.json(successResponse(results, 'Auto-mapping completed'));
});

/**
 * Fetch platform items
 */
const fetchPlatformItems = asyncHandler(async (req, res) => {
  const { outletId, platform } = req.query;
  
  if (!outletId || !platform) {
    throw new ValidationError('outletId and platform are required');
  }
  
  const items = await itemSyncService.fetchPlatformItems(platform, outletId);
  
  res.json(successResponse(items, 'Platform items fetched'));
});

/**
 * Create or update platform integration
 */
const upsertIntegration = asyncHandler(async (req, res) => {
  const { outletId, platform, platformRestaurantId, settings } = req.body;
  const { tenantId } = req;
  
  if (!outletId || !platform || !platformRestaurantId) {
    throw new ValidationError('outletId, platform, and platformRestaurantId are required');
  }
  
  let integration = await PlatformIntegration.findOne({
    tenantId,
    outletId,
    platform
  });
  
  if (integration) {
    // Update existing
    integration.platformRestaurantId = platformRestaurantId;
    if (settings) {
      integration.settings = { ...integration.settings, ...settings };
    }
    integration.isActive = true;
    await integration.save();
  } else {
    // Create new
    integration = await PlatformIntegration.create({
      tenantId,
      outletId,
      platform,
      platformRestaurantId,
      settings: settings || {}
    });
  }
  
  res.json(successResponse(integration, 'Integration configured successfully'));
});

/**
 * Disable integration
 */
const disableIntegration = asyncHandler(async (req, res) => {
  const { outletId, platform } = req.body;
  const { tenantId } = req;
  
  if (!outletId || !platform) {
    throw new ValidationError('outletId and platform are required');
  }
  
  const integration = await PlatformIntegration.findOne({
    tenantId,
    outletId,
    platform
  });
  
  if (!integration) {
    throw new ValidationError('Integration not found');
  }
  
  integration.isActive = false;
  await integration.save();
  
  res.json(successResponse(null, 'Integration disabled'));
});

module.exports = {
  syncOrders,
  syncItems,
  closeOutlet,
  getIntegrationStatus,
  updateItemMapping,
  autoMapItems,
  fetchPlatformItems,
  upsertIntegration,
  disableIntegration
};
