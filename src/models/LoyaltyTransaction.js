const mongoose = require('mongoose');
const { LOYALTY_TRANSACTION_TYPES } = require('../config/constants');

const loyaltyTransactionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(LOYALTY_TRANSACTION_TYPES),
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  reason: String,
  balance: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

loyaltyTransactionSchema.index({ tenantId: 1, customerId: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ type: 1 });

const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);

module.exports = LoyaltyTransaction;
