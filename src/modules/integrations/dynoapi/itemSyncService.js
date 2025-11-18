const dynoApiService = require('./dynoApiService');
const PlatformIntegration = require('../../../models/PlatformIntegration');
const Dish = require('../../../models/Dish');
const Category = require('../../../models/Category');
const { DYNOAPI_PLATFORMS } = require('../../../config/constants');
const logger = require('../../../utils/logger');

/**
 * Item Sync Service
 * Handles syncing item availability to Swiggy and Zomato
 */
class ItemSyncService {
  /**
   * Sync dish availability to platforms
   */
  async syncDishAvailability(dishId, isAvailable) {
    try {
      const dish = await Dish.findById(dishId);
      
      if (!dish) {
        logger.warn(`Dish ${dishId} not found`);
        return;
      }
      
      // Get all integrations for this outlet
      const integrations = await PlatformIntegration.find({
        outletId: dish.outletId,
        isActive: true,
        'settings.autoSyncItems': true
      });
      
      for (const integration of integrations) {
        try {
          await this.updatePlatformItemStock(
            integration.platform,
            dishId,
            isAvailable,
            integration
          );
        } catch (error) {
          logger.error(`Error syncing dish ${dishId} to ${integration.platform}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error syncing dish availability:', error);
    }
  }
  
  /**
   * Sync category availability to platforms
   */
  async syncCategoryAvailability(categoryId, isAvailable) {
    try {
      const category = await Category.findById(categoryId);
      
      if (!category) {
        logger.warn(`Category ${categoryId} not found`);
        return;
      }
      
      // Get all integrations for this outlet
      const integrations = await PlatformIntegration.find({
        outletId: category.outletId,
        isActive: true,
        'settings.autoSyncItems': true
      });
      
      for (const integration of integrations) {
        try {
          // Find platform category ID (would need mapping)
          // For now, sync all dishes in category
          const dishes = await Dish.find({
            categoryId: category._id,
            isActive: true
          });
          
          for (const dish of dishes) {
            await this.updatePlatformItemStock(
              integration.platform,
              dish._id,
              isAvailable,
              integration
            );
          }
        } catch (error) {
          logger.error(`Error syncing category ${categoryId} to ${integration.platform}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error syncing category availability:', error);
    }
  }
  
  /**
   * Update item stock on platform
   */
  async updatePlatformItemStock(platform, dishId, inStock, integration) {
    try {
      // Get platform item ID from mapping
      const platformItemId = integration.getPlatformItemId(dishId);
      
      if (!platformItemId) {
        logger.warn(`No platform mapping found for dish ${dishId} on ${platform}`);
        return;
      }
      
      // Update on platform
      if (inStock) {
        await dynoApiService.markItemInStock(
          platform,
          platformItemId,
          integration.platformRestaurantId
        );
        logger.info(`Marked item ${platformItemId} in stock on ${platform}`);
      } else {
        await dynoApiService.markItemOutOfStock(
          platform,
          platformItemId,
          integration.platformRestaurantId
        );
        logger.info(`Marked item ${platformItemId} out of stock on ${platform}`);
      }
      
      // Update last synced time
      const mapping = integration.getDishMapping(dishId);
      if (mapping) {
        mapping.lastSyncedAt = new Date();
        await integration.save();
      }
    } catch (error) {
      logger.error(`Error updating platform item stock:`, error);
      throw error;
    }
  }
  
  /**
   * Sync all items for an outlet
   */
  async syncAllItems(outletId) {
    try {
      // Get all integrations
      const integrations = await PlatformIntegration.find({
        outletId,
        isActive: true
      });
      
      if (integrations.length === 0) {
        logger.warn(`No integrations found for outlet ${outletId}`);
        return;
      }
      
      // Get all dishes for outlet
      const dishes = await Dish.find({
        outletId,
        isActive: true
      });
      
      const results = {
        total: dishes.length,
        synced: 0,
        failed: 0
      };
      
      for (const dish of dishes) {
        for (const integration of integrations) {
          try {
            await this.updatePlatformItemStock(
              integration.platform,
              dish._id,
              dish.isAvailable,
              integration
            );
            results.synced++;
          } catch (error) {
            logger.error(`Error syncing dish ${dish._id}:`, error);
            results.failed++;
          }
        }
      }
      
      logger.info(`Synced ${results.synced}/${results.total} items for outlet ${outletId}`);
      
      return results;
    } catch (error) {
      logger.error('Error syncing all items:', error);
      throw error;
    }
  }
  
  /**
   * Fetch and update item mappings from platform
   */
  async fetchPlatformItems(platform, outletId) {
    try {
      const integration = await PlatformIntegration.findOne({
        outletId,
        platform,
        isActive: true
      });
      
      if (!integration) {
        throw new Error(`No integration found for ${platform}`);
      }
      
      // Fetch items from platform
      const platformItems = await dynoApiService.getItems(
        platform,
        integration.platformRestaurantId
      );
      
      if (!platformItems || !Array.isArray(platformItems)) {
        throw new Error('Invalid response from platform');
      }
      
      logger.info(`Fetched ${platformItems.length} items from ${platform}`);
      
      return platformItems;
    } catch (error) {
      logger.error(`Error fetching platform items:`, error);
      throw error;
    }
  }
  
  /**
   * Auto-map items by name matching
   */
  async autoMapItems(outletId, platform) {
    try {
      // Get platform items
      const platformItems = await this.fetchPlatformItems(platform, outletId);
      
      // Get local dishes
      const dishes = await Dish.find({
        outletId,
        isActive: true
      });
      
      // Get integration
      const integration = await PlatformIntegration.findOne({
        outletId,
        platform,
        isActive: true
      });
      
      if (!integration) {
        throw new Error(`No integration found for ${platform}`);
      }
      
      const results = {
        total: dishes.length,
        mapped: 0,
        unmapped: 0
      };
      
      // Try to match by name
      for (const dish of dishes) {
        const platformItem = platformItems.find(
          item => this.normalizeString(item.name) === this.normalizeString(dish.name)
        );
        
        if (platformItem) {
          await integration.updateItemMapping(
            dish._id,
            platformItem.id || platformItem.item_id,
            platformItem.name
          );
          results.mapped++;
          logger.info(`Mapped dish "${dish.name}" to platform item "${platformItem.name}"`);
        } else {
          results.unmapped++;
          logger.warn(`No match found for dish "${dish.name}"`);
        }
      }
      
      logger.info(`Auto-mapping complete: ${results.mapped} mapped, ${results.unmapped} unmapped`);
      
      return results;
    } catch (error) {
      logger.error('Error auto-mapping items:', error);
      throw error;
    }
  }
  
  /**
   * Normalize string for comparison
   */
  normalizeString(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
  }
}

module.exports = new ItemSyncService();
