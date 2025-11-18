/**
 * Order Management Integration Tests
 * Tests complete order workflows
 */

const orderService = require('../../src/modules/order/orderService');
const Order = require('../../src/models/Order');
const Dish = require('../../src/models/Dish');
const Category = require('../../src/models/Category');
const Customer = require('../../src/models/Customer');

describe('Order Management Integration', () => {
  let outlet, category, dish, customer;
  
  beforeEach(async () => {
    outlet = await global.testUtils.createTestTenant('outlet');
    
    category = await Category.create({
      name: 'Test Category',
      outletId: outlet._id,
      tenantId: outlet._id
    });
    
    dish = await Dish.create({
      name: 'Paneer Tikka',
      price: 250,
      dietaryTag: 'veg',
      isAvailable: true,
      stock: 100, // Add stock
      categoryId: category._id,
      outletId: outlet._id,
      tenantId: outlet._id
    });
    
    customer = await Customer.create({
      name: 'Test Customer',
      phone: '9876543210',
      email: 'customer@example.com',
      outletId: outlet._id,
      tenantId: outlet._id
    });
  });
  
  describe('Complete Order Lifecycle', () => {
    it('should create, update, and complete order', async () => {
      // Create order
      const orderData = {
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 2,
            price: dish.price
          }
        ],
        source: 'pos'
      };
      
      const order = await orderService.createOrder(orderData, outlet._id, 'test-user-id');
      expect(order.status).toBe('pending');
      
      // Confirm order
      await orderService.updateOrderStatus(order._id, 'confirmed', outlet._id);
      let updated = await Order.findById(order._id);
      expect(updated.status).toBe('confirmed');
      
      // Mark as preparing
      await orderService.updateOrderStatus(order._id, 'preparing', outlet._id);
      updated = await Order.findById(order._id);
      expect(updated.status).toBe('preparing');
      
      // Mark as ready
      await orderService.updateOrderStatus(order._id, 'ready', outlet._id);
      updated = await Order.findById(order._id);
      expect(updated.status).toBe('ready');
      
      // Complete order
      await orderService.updateOrderStatus(order._id, 'completed', outlet._id);
      updated = await Order.findById(order._id);
      expect(updated.status).toBe('completed');
    });
  });
  
  describe('Order with Multiple Items', () => {
    let dish2;
    
    beforeEach(async () => {
      dish2 = await Dish.create({
        name: 'Butter Chicken',
        price: 350,
        dietaryTag: 'non-veg',
        isAvailable: true,
        stock: 100, // Add stock
        categoryId: category._id,
        outletId: outlet._id,
        tenantId: outlet._id
      });
    });
    
    it('should handle order with multiple dishes', async () => {
      const orderData = {
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 2,
            price: dish.price
          },
          {
            dishId: dish2._id,
            quantity: 1,
            price: dish2.price
          }
        ],
        source: 'pos'
      };
      
      const order = await orderService.createOrder(orderData, outlet._id, 'test-user-id');
      
      expect(order.items.length).toBe(2);
      expect(order.subtotal).toBeGreaterThan(0);
    });
  });
  
  describe('Order Queries', () => {
    beforeEach(async () => {
      // Create multiple orders
      for (let i = 0; i < 5; i++) {
        const orderData = {
          customerId: customer._id,
          orderType: 'dine-in',
          items: [
            {
              dishId: dish._id,
              quantity: 1,
              price: dish.price
            }
          ],
          source: 'pos'
        };
        
        await orderService.createOrder(orderData, outlet._id, 'test-user-id');
      }
    });
    
    it('should retrieve all orders for outlet', async () => {
      const result = await orderService.getOrders({ outletId: outlet._id }, outlet._id);
      expect(result.data.length).toBeGreaterThanOrEqual(5);
    });
    
    it('should filter orders by status', async () => {
      const result = await orderService.getOrders(
        { outletId: outlet._id, status: 'pending' },
        outlet._id
      );
      expect(result.data.length).toBeGreaterThan(0);
    });
  });
});
