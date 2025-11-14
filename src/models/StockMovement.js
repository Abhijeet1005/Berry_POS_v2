const mongoose = require('mongoose');
const { STOCK_MOVEMENT_TYPES } = require('../config/constants');

const stockMovementSchema = new mongoose.Schema({
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
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(STOCK_MOVEMENT_TYPES),
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  referenceType: {
    type: String,
    enum: ['PurchaseOrder', 'Order', 'StockAdjustment', 'Recipe', 'Manual']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
stockMovementSchema.index({ tenantId: 1, outletId: 1, inventoryItemId: 1, timestamp: -1 });
stockMovementSchema.index({ tenantId: 1, type: 1, timestamp: -1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });

// Calculate total cost before saving
stockMovementSchema.pre('save', function(next) {
  if (this.unitCost && this.quantity) {
    this.totalCost = Math.abs(this.quantity) * this.unitCost;
  }
  next();
});

// Static method to create movement and update inventory
stockMovementSchema.statics.createMovement = async function(movementData) {
  const InventoryItem = mongoose.model('InventoryItem');
  
  // Get inventory item
  const item = await InventoryItem.findById(movementData.inventoryItemId);
  
  if (!item) {
    throw new Error('Inventory item not found');
  }
  
  // Set previous stock
  movementData.previousStock = item.currentStock;
  
  // Calculate new stock based on movement type
  let newStock = item.currentStock;
  
  if (['purchase', 'return'].includes(movementData.type)) {
    newStock += Math.abs(movementData.quantity);
  } else if (['usage', 'wastage', 'adjustment'].includes(movementData.type)) {
    newStock -= Math.abs(movementData.quantity);
  }
  
  if (newStock < 0) {
    throw new Error('Insufficient stock for this movement');
  }
  
  movementData.newStock = newStock;
  movementData.unitCost = movementData.unitCost || item.unitCost;
  
  // Create movement record
  const movement = await this.create(movementData);
  
  // Update inventory
  item.currentStock = newStock;
  await item.save();
  
  return movement;
};

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

module.exports = StockMovement;
