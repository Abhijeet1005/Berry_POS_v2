/**
 * DynoAPI Integration Unit Tests
 */

const PlatformIntegration = require('../../src/models/PlatformIntegration');
const Dish = require('../../src/models/Dish');
const Category = require('../../src/models/Category');

describe('DynoAPI Integration', () => {
  let outlet, integration;
  
  beforeEach(async () => {
    outlet = await global.testUtils.createTestTenant('outlet');
    
    integration = await PlatformIntegration.create({
      platform: 'swiggy',
      platformRestaurantId: 'swiggy-123',
      isActive: true,
      outletId: outlet._id,
      tenantId: outlet._id,
      settings: {
        autoAcceptOrders: true,
        defaultPrepTime: 30,
        autoSyncItems: true
      }
    });
  });
  
  describe('Platform Integration Management', () => {
    it('should create platform integration', async () => {
      const newOutlet = await global.testUtils.createTestTenant('outlet');
      
      const integrationData = {
        platform: 'zomato',
        platformRestaurantId: 'zomato-456',
        isActive: true,
        outletId: newOutlet._id,
        tenantId: newOutlet._id,
        settings: {
          autoAcceptOrders: true,
          defaultPrepTime: 30,
          autoSyncItems: true
        }
      };
      
      const newIntegration = await PlatformIntegration.create(integrationData);
      
      expect(newIntegration).toBeDefined();
      expect(newIntegration.platform).toBe('zomato');
      expect(newIntegration.isActive).toBe(true);
    });
    
    it('should update integration settings', async () => {
      integration.settings.autoAcceptOrders = false;
      integration.settings.defaultPrepTime = 45;
      await integration.save();
      
      const updated = await PlatformIntegration.findById(integration._id);
      
      expect(updated.settings.autoAcceptOrders).toBe(false);
      expect(updated.settings.defaultPrepTime).toBe(45);
    });
  });
  
  describe('Item Mapping', () => {
    let dish, category;
    
    beforeEach(async () => {
      category = await Category.create({
        name: 'Test Category',
        outletId: outlet._id,
        tenantId: outlet._id
      });
      
      dish = await Dish.create({
        name: 'Paneer Tikka',
        price: 250,
        categoryId: category._id,
        outletId: outlet._id,
        tenantId: outlet._id
      });
    });
    
    it('should store item mappings', async () => {
      integration.itemMappings.push({
        dishId: dish._id,
        platformItemId: 'platform-item-123',
        platformItemName: dish.name
      });
      
      await integration.save();
      
      const updated = await PlatformIntegration.findById(integration._id);
      expect(updated.itemMappings.length).toBe(1);
      expect(updated.itemMappings[0].platformItemId).toBe('platform-item-123');
    });
  });
});
