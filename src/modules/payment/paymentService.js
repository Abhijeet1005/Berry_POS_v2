const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../../config/constants');

/**
 * Create a payment
 */
const createPayment = async (paymentData, tenantId) => {
  const { orderId, amount, paymentMethods } = paymentData;
  
  // Validate order
  const order = await Order.findOne({ _id: orderId, tenantId });
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  // Check if order is already paid
  const existingPayment = await Payment.findOne({
    orderId,
    status: PAYMENT_STATUS.COMPLETED
  });
  
  if (existingPayment) {
    throw new ValidationError('Order is already paid');
  }
  
  // Validate payment amount matches order total
  const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  if (Math.abs(totalPaid - amount) > 0.01) {
    throw new ValidationError('Payment methods total does not match payment amount');
  }
  
  if (Math.abs(amount - order.total) > 0.01) {
    throw new ValidationError('Payment amount does not match order total');
  }
  
  // Create payment
  const payment = new Payment({
    tenantId,
    outletId: order.outletId,
    orderId,
    amount,
    paymentMethods: paymentMethods.map(pm => ({
      ...pm,
      status: pm.method === 'cash' ? PAYMENT_STATUS.COMPLETED : PAYMENT_STATUS.PENDING
    })),
    status: paymentMethods.every(pm => pm.method === 'cash') 
      ? PAYMENT_STATUS.COMPLETED 
      : PAYMENT_STATUS.PENDING
  });
  
  await payment.save();
  
  // Update order status if payment is completed
  if (payment.status === PAYMENT_STATUS.COMPLETED) {
    order.status = ORDER_STATUS.COMPLETED;
    order.completedAt = new Date();
    await order.save();
  }
  
  return payment;
};

/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId, tenantId) => {
  const payment = await Payment.findOne({ _id: paymentId, tenantId })
    .populate('orderId', 'orderNumber total items');
  
  if (!payment) {
    throw new NotFoundError('Payment');
  }
  
  return payment;
};

/**
 * Get payments by order
 */
const getPaymentsByOrder = async (orderId, tenantId) => {
  const payments = await Payment.find({ orderId, tenantId })
    .sort({ createdAt: -1 });
  
  return payments;
};

/**
 * Process split payment
 */
const processSplitPayment = async (orderId, paymentMethods, tenantId) => {
  const order = await Order.findOne({ _id: orderId, tenantId });
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  // Validate total
  const totalPaid = paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  if (Math.abs(totalPaid - order.total) > 0.01) {
    throw new ValidationError('Split payment total does not match order total');
  }
  
  return createPayment({
    orderId,
    amount: order.total,
    paymentMethods
  }, tenantId);
};

/**
 * Update payment status
 */
const updatePaymentStatus = async (paymentId, status, transactionDetails, tenantId) => {
  const payment = await Payment.findOne({ _id: paymentId, tenantId });
  
  if (!payment) {
    throw new NotFoundError('Payment');
  }
  
  payment.status = status;
  
  // Update payment method status if transaction details provided
  if (transactionDetails) {
    const paymentMethod = payment.paymentMethods.find(
      pm => pm.method === transactionDetails.method
    );
    
    if (paymentMethod) {
      paymentMethod.status = status;
      paymentMethod.transactionId = transactionDetails.transactionId;
    }
  }
  
  await payment.save();
  
  // Update order status if payment is completed
  if (status === PAYMENT_STATUS.COMPLETED) {
    const order = await Order.findById(payment.orderId);
    if (order && order.status !== ORDER_STATUS.COMPLETED) {
      order.status = ORDER_STATUS.COMPLETED;
      order.completedAt = new Date();
      await order.save();
    }
  }
  
  return payment;
};

/**
 * Process refund
 */
const processRefund = async (paymentId, reason, tenantId) => {
  const payment = await Payment.findOne({ _id: paymentId, tenantId });
  
  if (!payment) {
    throw new NotFoundError('Payment');
  }
  
  if (payment.status !== PAYMENT_STATUS.COMPLETED) {
    throw new ValidationError('Can only refund completed payments');
  }
  
  payment.status = PAYMENT_STATUS.REFUNDED;
  
  // Update all payment methods to refunded
  payment.paymentMethods.forEach(pm => {
    pm.status = PAYMENT_STATUS.REFUNDED;
  });
  
  await payment.save();
  
  // Update order status
  const order = await Order.findById(payment.orderId);
  if (order) {
    order.status = ORDER_STATUS.CANCELLED;
    await order.save();
  }
  
  return payment;
};

/**
 * Get receipt
 */
const getReceipt = async (paymentId, tenantId) => {
  const payment = await Payment.findOne({ _id: paymentId, tenantId })
    .populate({
      path: 'orderId',
      populate: [
        { path: 'customerId', select: 'name phone email' },
        { path: 'tableId', select: 'tableNumber' },
        { path: 'items.dishId', select: 'name' }
      ]
    });
  
  if (!payment) {
    throw new NotFoundError('Payment');
  }
  
  if (payment.status !== PAYMENT_STATUS.COMPLETED) {
    throw new ValidationError('Receipt only available for completed payments');
  }
  
  const order = payment.orderId;
  
  const receipt = {
    receiptNumber: payment.receiptNumber,
    orderNumber: order.orderNumber,
    date: payment.createdAt,
    customer: order.customerId ? {
      name: order.customerId.name,
      phone: order.customerId.phone,
      email: order.customerId.email
    } : null,
    table: order.tableId?.tableNumber,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    })),
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    total: order.total,
    paymentMethods: payment.paymentMethods.map(pm => ({
      method: pm.method,
      amount: pm.amount
    })),
    paidAmount: payment.amount
  };
  
  return receipt;
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByOrder,
  processSplitPayment,
  updatePaymentStatus,
  processRefund,
  getReceipt
};
