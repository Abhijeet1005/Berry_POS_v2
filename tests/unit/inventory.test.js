/**
 * Inventory Management Unit Tests
 */

const inventoryItemService = require('../../src/modules/inventory/inventoryItemService');
const InventoryItem = require('../../src/models/InventoryItem');

describe('Inventory Management', () => {
  let outlet;
  
  beforeEach(async () => {
    outlet = await global.testUtils.createTestTenant('outlet');
  });
  
  describe('Inventory Item Management', () => {
    it('should create inventory item', async () => {
      const itemData = {
        name: 'Paneer',
        unit: 'kg',
        currentStock: 10,
        minStockLevel: 2,
        maxStockLevel: 50,
        unitPrice: 300,
        unitCost: 280,
        category: 'dairy',
        outletId: outlet._id
      };
      
      const item = await inventoryItemService.createInventoryItem(itemData, outlet._id);
      
      expect(item).toBeDefined();
      expect(item.name).toBe(itemData.name);
      expect(item.currentStock).toBe(itemData.currentStock);
    });
    
    it('should update stock correctly', async () => {
      const item = await InventoryItem.create({
        name: 'Test Item',
        unit: 'kg',
        currentStock: 10,
        minStockLevel: 2,
        unitPrice: 100,
        unitCost: 90,
        category: 'other',
        outletId: outlet._id,
        tenantId: outlet._id
      });
      
      await inventoryItemService.updateStock(item._id, 5, 'add', outlet._id);
      const updated = await InventoryItem.findById(item._id);
      
      expect(updated.currentStock).toBe(15); // 10 + 5
    });
    
    it('should deduct stock correctly', async () => {
      const item = await InventoryItem.create({
        name: 'Test Item 2',
        unit: 'kg',
        currentStock: 10,
        minStockLevel: 2,
        unitPrice: 100,
        unitCost: 90,
        category: 'other',
        outletId: outlet._id,
        tenantId: outlet._id
      });
      
      await inventoryItemService.updateStock(item._id, 3, 'deduct', outlet._id);
      const updated = await InventoryItem.findById(item._id);
      
      expect(updated.currentStock).toBe(7); // 10 - 3
    });
    
    it('should identify low stock items', async () => {
      await InventoryItem.create({
        name: 'Low Stock Item',
        unit: 'kg',
        currentStock: 1, // Below minStockLevel of 2
        minStockLevel: 2,
        unitPrice: 100,
        unitCost: 90,
        category: 'other',
        outletId: outlet._id,
        tenantId: outlet._id
      });
      
      const lowStockItems = await inventoryItemService.getLowStockItems(outlet._id);
      
      expect(lowStockItems.length).toBeGreaterThan(0);
    });
  });
});
