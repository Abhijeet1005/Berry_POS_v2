const mongoose = require('mongoose');
const { CAMPAIGN_TYPES, CAMPAIGN_STATUS } = require('../config/constants');

const campaignSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: Object.values(CAMPAIGN_TYPES),
    required: true
  },
  targetAudience: {
    segment: [{
      type: String
    }],
    minOrders: Number,
    minSpent: Number
  },
  couponIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }],
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  metrics: {
    reach: {
      type: Number,
      default: 0
    },
    redemptions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: Object.values(CAMPAIGN_STATUS),
    default: 'draft'
  }
}, {
  timestamps: true
});

campaignSchema.index({ tenantId: 1, status: 1 });
campaignSchema.index({ validFrom: 1, validUntil: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
