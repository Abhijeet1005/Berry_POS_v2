const mongoose = require('mongoose');
const { INVENTORY_CATEGORIES, INVENTORY_UNITS } = require('../config/constants');

const inventoryItemSchema = new mongoose.Schema({
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
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    enum: Object.values(INVENTORY_CATEGORIES),
    required: true
  },
  unit: {
    type: String,
    enum: Object.values(INVENTORY_UNITS),
    required: true
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 0,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    min: 0
  },
  reorderPoint: {
    type: Number,
    min: 0
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  lastRestocked: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  storageLocation: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
inventoryItemSchema.index({ tenantId: 1, outletId: 1, isActive: 1 });
inventoryItemSchema.index({ tenantId: 1, sku: 1 });
inventoryItemSchema.index({ tenantId: 1, category: 1 });
inventoryItemSchema.index({ currentStock: 1 });
inventoryItemSchema.index({ name: 'text' });

// Generate SKU before saving
inventoryItemSchema.pre('save', async function(next) {
  if (!this.sku && this.isNew) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('InventoryItem').countDocuments({
      tenantId: this.tenantId,
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.sku = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Get total value of current stock
inventoryItemSchema.methods.getTotalValue = function() {
  return this.currentStock * this.unitCost;
};

// Check if stock is low
inventoryItemSchema.methods.isLowStock = function() {
  return this.currentStock <= this.minStockLevel;
};

// Check if reorder is needed
inventoryItemSchema.methods.needsReorder = function() {
  return this.reorderPoint && this.currentStock <= this.reorderPoint;
};

// Update stock
inventoryItemSchema.methods.updateStock = function(quantity, operation = 'set') {
  if (operation === 'increment') {
    this.currentStock += quantity;
  } else if (operation === 'decrement') {
    if (this.currentStock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.currentStock -= quantity;
  } else {
    this.currentStock = quantity;
  }
  return this.save();
};

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
