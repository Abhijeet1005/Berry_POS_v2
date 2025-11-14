const mongoose = require('mongoose');
const { INVENTORY_CATEGORIES } = require('../config/constants');

const supplierSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
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
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  suppliedCategories: [{
    type: String,
    enum: Object.values(INVENTORY_CATEGORIES)
  }],
  paymentTerms: {
    type: String,
    trim: true
  },
  creditDays: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
supplierSchema.index({ tenantId: 1, isActive: 1 });
supplierSchema.index({ tenantId: 1, name: 1 });
supplierSchema.index({ phone: 1 });
supplierSchema.index({ name: 'text' });

// Update supplier rating
supplierSchema.methods.updateRating = function(newRating) {
  if (newRating < 0 || newRating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }
  this.rating = newRating;
  return this.save();
};

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
