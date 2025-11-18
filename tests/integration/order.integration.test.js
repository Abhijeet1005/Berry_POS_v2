/**
 * Order Management Integration Tests
 * Tests complete order workflows via API
 */

const app = require('../../src/app');
const testData = require('../helpers/testData');
const ApiHelper = require('../helpers/apiHelper');
const Dish = require('../../src/models/Dish');
const Category = require('../../src/models/Category');
const Customer = require('../../src/models/Customer');
const InventoryItem = require('../../src/models/InventoryItem');
const Recipe = require('../../src/models/Recipe');

describe('Order Management API Integration', () => {
  let api, token, userId, outlet, category, dish, customer;
  
  beforeEach(async () => {
    api = new ApiHelper(app);
    
    // Create user and get token
    const user = await global.testUtils.createTestUser({ role: 'admin' });
    token = api.generateToken(user._id, user.role);
    userId = user._id;
    api.setAuth(token, userId);
    
    // Create outlet
    outlet = await global.testUtils.createTestTenant('outlet');
    
    // Create category
    category = await Category.create({
      name: 'Test Category',
      outletId: outlet._id
    });
    
    // Create dish
    dish = await Dish.create({
      ...testData.validDish,
      categoryId: category._id,
      outletId: outlet._id
    });
    
    // Create customer
    customer = await Customer.create({
      ...testData.validCustomer,
      outletId: outlet._id
    });
  });
  
  describe('POST /api/v1/orders', () => {
    it('should create order successfully', async () => {
      const orderData = {
        outletId: outlet._id,
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 2,
            price: dish.price,
            subtotal: dish.price * 2
          }
        ],
        subtotal: dish.price * 2,
        tax: (dish.price * 2) * 0.05,
        total: (dish.price * 2) * 1.05
      };
      
      const response = await api.post('/api/v1/orders', orderData);
      
      api.expectSuccess(response, 201);
      expect(response.body.data).toHaveProperty('orderNumber');
      expect(response.body.data.items.length).toBe(1);
    });
    
    it('should deduct inventory when order is created', async () => {
      // Create ingredient and recipe
      const ingredient = await InventoryItem.create({
        name: 'Paneer',
        unit: 'kg',
        currentStock: 10,
        unitPrice: 300,
        outletId: outlet._id
      });
      
      await Recipe.create({
        dishId: dish._id,
        outletId: outlet._id,
        servingSize: 1,
        ingredients: [
          { itemId: ingredient._id, quantity: 0.2, cost: 60 }
        ],
        totalCost: 60
      });
      
      const orderData = {
        outletId: outlet._id,
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 2,
            price: dish.price,
            subtotal: dish.price * 2
          }
        ],
        subtotal: dish.price * 2,
        tax: 0,
        total: dish.price * 2
      };
      
      await api.post('/api/v1/orders', orderData);
      
      const updatedIngredient = await InventoryItem.findById(ingredient._id);
      expect(updatedIngredient.currentStock).toBe(9.6); // 10 - (0.2 * 2)
    });
    
    it('should return 400 for invalid order data', async () => {
      const response = await api.post('/api/v1/orders', { invalid: 'data' });
      
      api.expectError(response, 400);
    });
  });
  
  describe('GET /api/v1/orders', () => {
    beforeEach(async () => {
      // Create multiple orders
      for (let i = 0; i < 3; i++) {
        await api.post('/api/v1/orders', {
          outletId: outlet._id,
          customerId: customer._id,
          orderType: 'dine-in',
          items: [
            {
              dishId: dish._id,
              quantity: 1,
              price: dish.price,
              subtotal: dish.price
            }
          ],
          subtotal: dish.price,
          tax: 0,
          total: dish.price
        });
      }
    });
    
    it('should get all orders', async () => {
      const response = await api.get(`/api/v1/orders?outletId=${outlet._id}`);
      
      api.expectSuccess(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });
    
    it('should filter orders by status', async () => {
      const response = await api.get(
        `/api/v1/orders?outletId=${outlet._id}&status=pending`
      );
      
      api.expectSuccess(response, 200);
    });
  });
  
  describe('PATCH /api/v1/orders/:id/status', () => {
    let orderId;
    
    beforeEach(async () => {
      const orderResponse = await api.post('/api/v1/orders', {
        outletId: outlet._id,
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 1,
            price: dish.price,
            subtotal: dish.price
          }
        ],
        subtotal: dish.price,
        tax: 0,
        total: dish.price
      });
      
      orderId = orderResponse.body.data._id;
    });
    
    it('should update order status', async () => {
      const response = await api.patch(`/api/v1/orders/${orderId}/status`, {
        status: 'confirmed'
      });
      
      api.expectSuccess(response, 200);
      expect(response.body.data.status).toBe('confirmed');
    });
    
    it('should return 400 for invalid status', async () => {
      const response = await api.patch(`/api/v1/orders/${orderId}/status`, {
        status: 'invalid-status'
      });
      
      api.expectError(response, 400);
    });
  });
  
  describe('POST /api/v1/orders/:id/cancel', () => {
    let orderId;
    
    beforeEach(async () => {
      const orderResponse = await api.post('/api/v1/orders', {
        outletId: outlet._id,
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 1,
            price: dish.price,
            subtotal: dish.price
          }
        ],
        subtotal: dish.price,
        tax: 0,
        total: dish.price
      });
      
      orderId = orderResponse.body.data._id;
    });
    
    it('should cancel order', async () => {
      const response = await api.post(`/api/v1/orders/${orderId}/cancel`, {
        reason: 'Customer request'
      });
      
      api.expectSuccess(response, 200);
      expect(response.body.data.status).toBe('cancelled');
    });
  });
});
