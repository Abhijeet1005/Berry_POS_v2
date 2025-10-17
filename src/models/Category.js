const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  description: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String
  },
  kitchenSection: {
    type: String,
    enum: ['kitchen', 'bar', 'dessert', 'bakery', 'grill'],
    default: 'kitchen'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ tenantId: 1, isActive: 1 });
categorySchema.index({ displayOrder: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
