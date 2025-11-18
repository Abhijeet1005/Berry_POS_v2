/**
 * DynoAPI Integration Unit Tests
 */

const orderSyncService = require('../../src/modules/integrations/dynoapi/orderSyncService');
const itemSyncService = require('../../src/modules/integrations/dynoapi/itemSyncService');
const PlatformIntegration = require('../../src/models/PlatformIntegration');
const Dish = require('../../src/models/Dish');
const testData = require('../helpers/testData');

// Mock DynoAPI client
jest.mock('../../src/modules/integrations/dynoapi/dynoApiClient');

describe('DynoAPI Integration', () => {
  let outlet, integration;
  
  beforeEach(async () => {
    outlet = await global.testUtils.createTestTenant('outlet');
    
    integration = await PlatformIntegration.create({
      ...testData.validPlatformIntegration,
      outletId: outlet._id
    });
  });
  
  describe('Order Synchronization', () => {
    it('should parse Swiggy order correctly', () => {
      const swiggyOrder = {
        order_id: 'swiggy-123',
        order_number: 'SW123',
        customer: {
          name: 'John Doe',
          phone: '9876543210'
        },
        order_items: [
          {
            name: 'Paneer Tikka',
            quantity: 2,
            price: 250,
            id: 'item-123'
          }
        ],
        order_total: 500,
        delivery_charge: 50,
        payment_method: 'online'
      };
      
      const parsed = orderSyncService.parseSwiggyOrder(swiggyOrder);
      
      expect(parsed.platformOrderId).toBe('swiggy-123');
      expect(parsed.customer.name).toBe('John Doe');
      expect(parsed.items.length).toBe(1);
      expect(parsed.total).toBe(500);
    });
    
    it('should parse Zomato order correctly', () => {
      const zomatoOrder = {
        order_id: 'zomato-456',
        order_number: 'ZO456',
        customer: {
          name: 'Jane Smith',
          phone: '9876543211'
        },
        order_items: [
          {
            name: 'Butter Chicken',
            quantity: 1,
            price: 350,
            id: 'item-456'
          }
        ],
        order_total: 350,
        delivery_charge: 40,
        payment_method: 'cod'
      };
      
      const parsed = orderSyncService.parseZomatoOrder(zomatoOrder);
      
      expect(parsed.platformOrderId).toBe('zomato-456');
      expect(parsed.customer.name).toBe('Jane Smith');
      expect(parsed.items.length).toBe(1);
      expect(parsed.total).toBe(350);
    });
    
    it('should handle missing customer data gracefully', () => {
      const orderWithoutCustomer = {
        order_id: 'test-123',
        order_items: [],
        order_total: 0
      };
      
      const parsed = orderSyncService.parseSwiggyOrder(orderWithoutCustomer);
      
      expect(parsed.customer).toBeDefined();
      expect(parsed.customer.name).toBeUndefined();
    });
  });
  
  describe('Item Synchronization', () => {
    let dish, category;
    
    beforeEach(async () => {
      category = await require('../../src/models/Category').create({
        name: 'Test Category',
        outletId: outlet._id
      });
      
      dish = await Dish.create({
        ...testData.validDish,
        categoryId: category._id,
        outletId: outlet._id
      });
      
      // Create platform item mapping
      await require('../../src/models/PlatformIntegration').findByIdAndUpdate(
        integration._id,
        {
          $push: {
            itemMappings: {
              dishId: dish._id,
              platformItemId: 'platform-item-123',
              platformItemName: dish.name
            }
          }
        }
      );
    });
    
    it('should sync item availability to platform', async () => {
      const result = await itemSyncService.syncItemAvailability(
        dish._id,
        true,
        outlet._id
      );
      
      expect(result).toBeDefined();
    });
    
    it('should mark item out of stock on platform', async () => {
      const result = await itemSyncService.markItemOutOfStock(
        dish._id,
        outlet._id
      );
      
      expect(result).toBeDefined();
    });
    
    it('should mark item in stock on platform', async () => {
      const result = await itemSyncService.markItemInStock(
        dish._id,
        outlet._id
      );
      
      expect(result).toBeDefined();
    });
  });
  
  describe('Platform Integration Management', () => {
    it('should create platform integration', async () => {
      const newOutlet = await global.testUtils.createTestTenant('outlet');
      
      const integrationData = {
        ...testData.validPlatformIntegration,
        outletId: newOutlet._id,
        platform: 'zomato'
      };
      
      const newIntegration = await PlatformIntegration.create(integrationData);
      
      expect(newIntegration).toBeDefined();
      expect(newIntegration.platform).toBe('zomato');
      expect(newIntegration.isActive).toBe(true);
    });
    
    it('should not allow duplicate platform integration for same outlet', async () => {
      const duplicateData = {
        ...testData.validPlatformIntegration,
        outletId: outlet._id
      };
      
      await expect(
        PlatformIntegration.create(duplicateData)
      ).rejects.toThrow();
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
  
  describe('Auto-Mapping', () => {
    let dishes;
    
    beforeEach(async () => {
      const category = await require('../../src/models/Category').create({
        name: 'Test Category',
        outletId: outlet._id
      });
      
      dishes = await Dish.insertMany([
        {
          name: 'Paneer Tikka',
          price: 250,
          categoryId: category._id,
          outletId: outlet._id
        },
        {
          name: 'Butter Chicken',
          price: 350,
          categoryId: category._id,
          outletId: outlet._id
        },
        {
          name: 'Veg Biryani',
          price: 200,
          categoryId: category._id,
          outletId: outlet._id
        }
      ]);
    });
    
    it('should auto-map items by exact name match', () => {
      const platformItems = [
        { id: 'p1', name: 'Paneer Tikka' },
        { id: 'p2', name: 'Butter Chicken' }
      ];
      
      const mappings = itemSyncService.autoMapItems(dishes, platformItems);
      
      expect(mappings.length).toBe(2);
      expect(mappings[0].platformItemName).toBe('Paneer Tikka');
    });
    
    it('should handle case-insensitive matching', () => {
      const platformItems = [
        { id: 'p1', name: 'paneer tikka' },
        { id: 'p2', name: 'BUTTER CHICKEN' }
      ];
      
      const mappings = itemSyncService.autoMapItems(dishes, platformItems);
      
      expect(mappings.length).toBeGreaterThan(0);
    });
  });
});
