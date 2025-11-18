/**
 * Order Management Unit Tests
 */

const orderService = require('../../src/modules/order/orderService');
const Order = require('../../src/models/Order');
const Dish = require('../../src/models/Dish');
const Category = require('../../src/models/Category');
const testData = require('../helpers/testData');

describe('Order Management', () => {
  let outlet, category, dish, customer;
  
  beforeEach(async () => {
    outlet = await global.testUtils.createTestTenant('outlet');
    
    category = await Category.create({
      name: 'Test Category',
      outletId: outlet._id
    });
    
    dish = await Dish.create({
      ...testData.validDish,
      categoryId: category._id,
      outletId: outlet._id
    });
    
    customer = await require('../../src/models/Customer').create({
      ...testData.validCustomer,
      outletId: outlet._id
    });
  });
  
  describe('Order Creation', () => {
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
      
      const order = await orderService.createOrder(orderData);
      
      expect(order).toBeDefined();
      expect(order.items.length).toBe(1);
      expect(order.status).toBe('pending');
    });
    
    it('should calculate totals correctly', async () => {
      const orderData = {
        outletId: outlet._id,
        customerId: customer._id,
        orderType: 'dine-in',
        items: [
          {
            dishId: dish._id,
            quantity: 2,
            price: 250,
            subtotal: 500
          }
        ],
        subtotal: 500,
        tax: 25,
        total: 525
      };
      
      const order = await orderService.createOrder(orderData);
      
      expect(order.subtotal).toBe(500);
      expect(order.total).toBe(525);
    });
    
    it('should generate unique order number', async () => {
      const orderData = {
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
      };
      
      const order1 = await orderService.createOrder(orderData);
      const order2 = await orderService.createOrder(orderData);
      
      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });
  });
  
  describe('Order Status Management', () => {
    let order;
    
    beforeEach(async () => {
      order = await Order.create({
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
        total: dish.price,
        status: 'pending'
      });
    });
    
    it('should update order status', async () => {
      await orderService.updateOrderStatus(order._id, 'confirmed');
      
      const updated = await Order.findById(order._id);
      expect(updated.status).toBe('confirmed');
    });
    
    it('should track status history', async () => {
      await orderService.updateOrderStatus(order._id, 'confirmed');
      await orderService.updateOrderStatus(order._id, 'preparing');
      
      const updated = await Order.findById(order._id);
      expect(updated.statusHistory.length).toBeGreaterThan(0);
    });
    
    it('should not allow invalid status transitions', async () => {
      await orderService.updateOrderStatus(order._id, 'completed');
      
      await expect(
        orderService.updateOrderStatus(order._id, 'pending')
      ).rejects.toThrow();
    });
  });
  
  describe('Order Cancellation', () => {
    let order;
    
    beforeEach(async () => {
      order = await Order.create({
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
        total: dish.price,
        status: 'pending'
      });
    });
    
    it('should cancel order successfully', async () => {
      await orderService.cancelOrder(order._id, 'Customer request');
      
      const cancelled = await Order.findById(order._id);
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellationReason).toBe('Customer request');
    });
    
    it('should not cancel completed order', async () => {
      await orderService.updateOrderStatus(order._id, 'completed');
      
      await expect(
        orderService.cancelOrder(order._id, 'Too late')
      ).rejects.toThrow();
    });
  });
  
  describe('Order Queries', () => {
    beforeEach(async () => {
      // Create multiple orders
      for (let i = 0; i < 5; i++) {
        await Order.create({
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
          total: dish.price,
          status: i % 2 === 0 ? 'pending' : 'completed'
        });
      }
    });
    
    it('should get orders by outlet', async () => {
      const orders = await orderService.getOrdersByOutlet(outlet._id);
      expect(orders.length).toBe(5);
    });
    
    it('should filter orders by status', async () => {
      const pendingOrders = await orderService.getOrdersByStatus(outlet._id, 'pending');
      expect(pendingOrders.length).toBe(3);
    });
    
    it('should get orders by customer', async () => {
      const customerOrders = await orderService.getOrdersByCustomer(customer._id);
      expect(customerOrders.length).toBe(5);
    });
  });
});
