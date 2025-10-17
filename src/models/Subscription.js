const mongoose = require('mongoose');
const { SUBSCRIPTION_TIERS, SUBSCRIPTION_STATUS } = require('../config/constants');

const subscriptionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true,
    index: true
  },
  tier: {
    type: String,
    enum: Object.values(SUBSCRIPTION_TIERS),
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(SUBSCRIPTION_STATUS),
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentHistory: [{
    amount: Number,
    invoiceNumber: String,
    paidAt: Date,
    paymentMethod: String
  }],
  features: [{
    type: String
  }]
}, {
  timestamps: true
});

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
