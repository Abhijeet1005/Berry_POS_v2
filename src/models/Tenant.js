const mongoose = require('mongoose');
const { TENANT_TYPES, SUBSCRIPTION_STATUS } = require('../config/constants');

const tenantSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(TENANT_TYPES),
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  subscription: {
    tier: {
      type: String,
      default: 'basic'
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual'],
      default: 'monthly'
    }
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ parentId: 1 });
tenantSchema.index({ type: 1 });
tenantSchema.index({ 'contactInfo.email': 1 });
tenantSchema.index({ isDeleted: 1 });

// Soft delete method
tenantSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
tenantSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Query helper to exclude deleted
tenantSchema.query.active = function() {
  return this.where({ isDeleted: false });
};

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
