/**
 * Order Management Unit Tests
 */

const orderService = require('../../src/modules/order/orderService');
const Order = require('../../src/models/Order');
const Dish = require('../../src/models/Dish');
const Category = require('../../src/models/Category');
const Customer = require('../../src/models/Customer');

describe('Order Management', () => {
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
  
  describe('Order Creation', () => {
    it('should create order successfully', async () => {
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
      
      expect(order).toBeDefined();
      expect(order.items.length).toBe(1);
      expect(order.status).toBe('pending');
    });
    
    it('should calculate totals correctly', async () => {
      const orderData = {
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 2,
            price: 250
          }
        ],
        source: 'pos'
      };
      
      const order = await orderService.createOrder(orderData, outlet._id, 'test-user-id');
      
      expect(order.subtotal).toBeGreaterThan(0);
      expect(order.total).toBeGreaterThan(0);
    });
  });
  
  describe('Order Status Management', () => {
    let order;
    
    beforeEach(async () => {
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
      
      order = await orderService.createOrder(orderData, outlet._id, 'test-user-id');
    });
    
    it('should update order status', async () => {
      await orderService.updateOrderStatus(order._id, 'confirmed', outlet._id);
      
      const updated = await Order.findById(order._id);
      expect(updated.status).toBe('confirmed');
    });
  });
  
  describe('Order Queries', () => {
    beforeEach(async () => {
      // Create multiple orders
      for (let i = 0; i < 3; i++) {
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
    
    it('should get orders by outlet', async () => {
      const orders = await orderService.getOrders({ outletId: outlet._id }, outlet._id);
      expect(orders.data.length).toBeGreaterThanOrEqual(3);
    });
  });
});
