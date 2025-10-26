const mongoose = require('mongoose');
const { DIETARY_TAGS } = require('../config/constants');

const dishSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  outletId: {
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
  description: {
    short: {
      type: String,
      maxlength: 100
    },
    detailed: {
      type: String,
      maxlength: 500
    }
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    publicId: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    width: Number,
    height: Number,
    format: String,
    size: Number
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  portionSizes: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    servings: {
      type: Number,
      default: 1
    }
  }],
  dietaryTags: [{
    type: String,
    enum: Object.values(DIETARY_TAGS)
  }],
  allergens: [{
    type: String
  }],
  ingredients: [{
    type: String
  }],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number
  },
  tasteFactor: {
    spicy: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    sweet: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    tangy: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    salty: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    bitter: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    }
  },
  prepTime: {
    type: Number,
    default: 15
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    enum: ['chef-special', 'seasonal', 'most-ordered', 'staff-pick', 'new']
  }],
  taxRate: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
dishSchema.index({ tenantId: 1, outletId: 1, isActive: 1 });
dishSchema.index({ tenantId: 1, categoryId: 1 });
dishSchema.index({ name: 'text' });
dishSchema.index({ dietaryTags: 1 });
dishSchema.index({ isAvailable: 1 });

// Update availability based on stock
dishSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    this.isAvailable = this.stock > 0;
  }
  next();
});

// Decrement stock
dishSchema.methods.decrementStock = function (quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  return this.save();
};

// Increment stock
dishSchema.methods.incrementStock = function (quantity) {
  this.stock += quantity;
  return this.save();
};

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
