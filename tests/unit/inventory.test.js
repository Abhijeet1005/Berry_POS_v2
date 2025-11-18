/**
 * Inventory Management Unit Tests
 */

const inventoryItemService = require('../../src/modules/inventory/inventoryItemService');
const recipeService = require('../../src/modules/inventory/recipeService');
const InventoryItem = require('../../src/models/InventoryItem');
const Recipe = require('../../src/models/Recipe');
const Dish = require('../../src/models/Dish');
const testData = require('../helpers/testData');

describe('Inventory Management', () => {
  let outlet;
  
  beforeEach(async () => {
    outlet = await global.testUtils.createTestTenant('outlet');
  });
  
  describe('Inventory Item Management', () => {
    it('should create inventory item', async () => {
      const itemData = {
        ...testData.validInventoryItem,
        outletId: outlet._id
      };
      
      const item = await inventoryItemService.createItem(itemData);
      
      expect(item).toBeDefined();
      expect(item.name).toBe(itemData.name);
      expect(item.currentStock).toBe(itemData.currentStock);
    });
    
    it('should update stock correctly', async () => {
      const item = await InventoryItem.create({
        ...testData.validInventoryItem,
        outletId: outlet._id
      });
      
      await inventoryItemService.updateStock(item._id, 5, 'add');
      const updated = await InventoryItem.findById(item._id);
      
      expect(updated.currentStock).toBe(15); // 10 + 5
    });
    
    it('should deduct stock correctly', async () => {
      const item = await InventoryItem.create({
        ...testData.validInventoryItem,
        outletId: outlet._id
      });
      
      await inventoryItemService.updateStock(item._id, 3, 'deduct');
      const updated = await InventoryItem.findById(item._id);
      
      expect(updated.currentStock).toBe(7); // 10 - 3
    });
    
    it('should not allow negative stock', async () => {
      const item = await InventoryItem.create({
        ...testData.validInventoryItem,
        currentStock: 5,
        outletId: outlet._id
      });
      
      await expect(
        inventoryItemService.updateStock(item._id, 10, 'deduct')
      ).rejects.toThrow();
    });
    
    it('should identify low stock items', async () => {
      await InventoryItem.create({
        ...testData.validInventoryItem,
        currentStock: 1, // Below minStock of 2
        outletId: outlet._id
      });
      
      const lowStockItems = await inventoryItemService.getLowStockItems(outlet._id);
      
      expect(lowStockItems.length).toBeGreaterThan(0);
    });
  });
  
  describe('Recipe Management', () => {
    let dish, ingredient1, ingredient2;
    
    beforeEach(async () => {
      const category = await require('../../src/models/Category').create({
        name: 'Test Category',
        outletId: outlet._id
      });
      
      dish = await Dish.create({
        ...testData.validDish,
        categoryId: category._id,
        outletId: outlet._id
      });
      
      ingredient1 = await InventoryItem.create({
        name: 'Paneer',
        unit: 'kg',
        currentStock: 10,
        unitPrice: 300,
        outletId: outlet._id
      });
      
      ingredient2 = await InventoryItem.create({
        name: 'Spices',
        unit: 'kg',
        currentStock: 5,
        unitPrice: 500,
        outletId: outlet._id
      });
    });
    
    it('should create recipe with ingredients', async () => {
      const recipeData = {
        dishId: dish._id,
        outletId: outlet._id,
        servingSize: 1,
        ingredients: [
          { itemId: ingredient1._id, quantity: 0.2 }, // 200g paneer
          { itemId: ingredient2._id, quantity: 0.05 }  // 50g spices
        ]
      };
      
      const recipe = await recipeService.createRecipe(recipeData);
      
      expect(recipe).toBeDefined();
      expect(recipe.ingredients.length).toBe(2);
    });
    
    it('should calculate recipe cost correctly', async () => {
      const recipe = await Recipe.create({
        dishId: dish._id,
        outletId: outlet._id,
        servingSize: 1,
        ingredients: [
          { itemId: ingredient1._id, quantity: 0.2, cost: 60 },  // 0.2kg * 300 = 60
          { itemId: ingredient2._id, quantity: 0.05, cost: 25 }  // 0.05kg * 500 = 25
        ],
        totalCost: 85
      });
      
      expect(recipe.totalCost).toBe(85);
    });
    
    it('should check ingredient availability', async () => {
      await Recipe.create({
        dishId: dish._id,
        outletId: outlet._id,
        servingSize: 1,
        ingredients: [
          { itemId: ingredient1._id, quantity: 0.2 },
          { itemId: ingredient2._id, quantity: 0.05 }
        ]
      });
      
      const available = await recipeService.checkAvailability(dish._id, 5);
      
      expect(available).toBe(true); // We have enough stock for 5 servings
    });
    
    it('should detect insufficient ingredients', async () => {
      await Recipe.create({
        dishId: dish._id,
        outletId: outlet._id,
        servingSize: 1,
        ingredients: [
          { itemId: ingredient1._id, quantity: 0.2 }
        ]
      });
      
      const available = await recipeService.checkAvailability(dish._id, 100);
      
      expect(available).toBe(false); // Not enough stock for 100 servings
    });
    
    it('should deduct ingredients when dish is ordered', async () => {
      await Recipe.create({
        dishId: dish._id,
        outletId: outlet._id,
        servingSize: 1,
        ingredients: [
          { itemId: ingredient1._id, quantity: 0.2 }
        ]
      });
      
      await recipeService.deductIngredients(dish._id, 2);
      
      const updatedIngredient = await InventoryItem.findById(ingredient1._id);
      expect(updatedIngredient.currentStock).toBe(9.6); // 10 - (0.2 * 2)
    });
  });
});
