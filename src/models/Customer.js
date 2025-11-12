const mongoose = require('mongoose');
const { CUSTOMER_SEGMENTS } = require('../config/constants');

const customerSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    address: {
      type: String,
      required: true
    },
    landmark: String,
    city: String,
    pincode: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  tasteProfile: {
    preferredDietaryTags: [{
      type: String
    }],
    tasteFactor: {
      spicy: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
      },
      sweet: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
      },
      tangy: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
      },
      salty: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
      },
      bitter: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
      }
    },
    allergens: [{
      type: String
    }],
    favoriteCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }]
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastOrderDate: Date,
  segment: {
    type: String,
    enum: Object.values(CUSTOMER_SEGMENTS),
    default: 'new'
  },
  whatsappOptIn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ tenantId: 1, phone: 1 }, { unique: true });
customerSchema.index({ tenantId: 1, email: 1 });
customerSchema.index({ segment: 1 });
customerSchema.index({ loyaltyPoints: -1 });

// Update customer segment based on orders
customerSchema.methods.updateSegment = function() {
  if (this.totalOrders === 0) {
    this.segment = 'new';
  } else if (this.totalOrders >= 10 || this.totalSpent >= 10000) {
    this.segment = 'vip';
  } else {
    this.segment = 'returning';
  }
  return this.save();
};

// Add loyalty points
customerSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints += points;
  return this.save();
};

// Redeem loyalty points
customerSchema.methods.redeemLoyaltyPoints = function(points) {
  if (this.loyaltyPoints < points) {
    throw new Error('Insufficient loyalty points');
  }
  this.loyaltyPoints -= points;
  return this.save();
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
