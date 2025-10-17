const mongoose = require('mongoose');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethods: [{
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionId: String,
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: 'pending'
  },
  receiptNumber: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ tenantId: 1, orderId: 1 });
paymentSchema.index({ status: 1 });

// Generate receipt number
paymentSchema.pre('save', async function(next) {
  if (this.status === 'completed' && !this.receiptNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Payment').countDocuments({
      status: 'completed',
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.receiptNumber = `RCP-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
