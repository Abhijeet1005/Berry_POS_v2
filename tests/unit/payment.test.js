/**
 * Payment Processing Unit Tests
 */

const Payment = require('../../src/models/Payment');
const Order = require('../../src/models/Order');
const Customer = require('../../src/models/Customer');
const Dish = require('../../src/models/Dish');
const Category = require('../../src/models/Category');

describe('Payment Processing', () => {
  let outlet, customer, order, dish, category;
  
  beforeEach(async () => {
    outlet = await global.testUtils.createTestTenant('outlet');
    
    customer = await Customer.create({
      name: 'Test Customer',
      phone: '9876543210',
      email: 'customer@example.com',
      outletId: outlet._id,
      tenantId: outlet._id
    });
    
    category = await Category.create({
      name: 'Test Category',
      outletId: outlet._id,
      tenantId: outlet._id
    });
    
    dish = await Dish.create({
      name: 'Test Dish',
      price: 250,
      categoryId: category._id,
      outletId: outlet._id,
      tenantId: outlet._id
    });
    
    order = await Order.create({
      outletId: outlet._id,
      tenantId: outlet._id,
      customerId: customer._id,
      orderType: 'dine-in',
      items: [{
        dishId: dish._id,
        name: dish.name,
        quantity: 2,
        price: dish.price,
        subtotal: dish.price * 2
      }],
      subtotal: 500,
      tax: 50,
      total: 550,
      status: 'confirmed',
      source: 'pos'
    });
  });
  
  describe('Payment Creation', () => {
    it('should create cash payment', async () => {
      const payment = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 550,
        method: 'cash',
        status: 'completed'
      });
      
      expect(payment).toBeDefined();
      expect(payment.method).toBe('cash');
      expect(payment.status).toBe('completed');
    });
    
    it('should create card payment', async () => {
      const payment = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 550,
        method: 'card',
        status: 'completed',
        transactionId: 'txn_123456'
      });
      
      expect(payment).toBeDefined();
      expect(payment.method).toBe('card');
      expect(payment.transactionId).toBe('txn_123456');
    });
    
    it('should create online payment', async () => {
      const payment = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 550,
        method: 'online',
        status: 'pending',
        paymentGateway: 'razorpay',
        gatewayOrderId: 'order_123'
      });
      
      expect(payment).toBeDefined();
      expect(payment.paymentGateway).toBe('razorpay');
    });
  });
  
  describe('Payment Validation', () => {
    it('should validate payment amount matches order total', async () => {
      const payment = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 550,
        method: 'cash',
        status: 'completed'
      });
      
      expect(payment.amount).toBe(order.total);
    });
  });
  
  describe('Split Payments', () => {
    it('should handle split payment', async () => {
      const payment1 = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 300,
        method: 'cash',
        status: 'completed'
      });
      
      const payment2 = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 250,
        method: 'card',
        status: 'completed'
      });
      
      const totalPaid = payment1.amount + payment2.amount;
      expect(totalPaid).toBe(order.total);
    });
  });
  
  describe('Payment Status', () => {
    it('should update payment status', async () => {
      const payment = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 550,
        method: 'online',
        status: 'pending'
      });
      
      payment.status = 'completed';
      payment.transactionId = 'txn_completed';
      await payment.save();
      
      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('completed');
      expect(updated.transactionId).toBe('txn_completed');
    });
    
    it('should handle failed payments', async () => {
      const payment = await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 550,
        method: 'online',
        status: 'pending'
      });
      
      payment.status = 'failed';
      payment.failureReason = 'Insufficient funds';
      await payment.save();
      
      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('failed');
      expect(updated.failureReason).toBe('Insufficient funds');
    });
  });
  
  describe('Payment Queries', () => {
    beforeEach(async () => {
      await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 550,
        method: 'cash',
        status: 'completed'
      });
      
      await Payment.create({
        orderId: order._id,
        outletId: outlet._id,
        tenantId: outlet._id,
        amount: 300,
        method: 'card',
        status: 'completed'
      });
    });
    
    it('should get payments by order', async () => {
      const payments = await Payment.find({ orderId: order._id });
      expect(payments.length).toBe(2);
    });
    
    it('should get payments by method', async () => {
      const cashPayments = await Payment.find({ method: 'cash' });
      expect(cashPayments.length).toBeGreaterThan(0);
    });
    
    it('should get payments by status', async () => {
      const completedPayments = await Payment.find({ status: 'completed' });
      expect(completedPayments.length).toBe(2);
    });
  });
});
