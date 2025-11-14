const mongoose = require('mongoose');
const { STOCK_ADJUSTMENT_TYPES, STOCK_ADJUSTMENT_STATUS } = require('../config/constants');

const stockAdjustmentSchema = new mongoose.Schema({
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
  adjustmentNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
    index: true
  },
  adjustmentType: {
    type: String,
    enum: Object.values(STOCK_ADJUSTMENT_TYPES),
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
  reason: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(STOCK_ADJUSTMENT_STATUS),
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
stockAdjustmentSchema.index({ tenantId: 1, outletId: 1, status: 1 });
stockAdjustmentSchema.index({ adjustmentNumber: 1 });
stockAdjustmentSchema.index({ inventoryItemId: 1 });
stockAdjustmentSchema.index({ createdAt: -1 });

// Generate adjustment number before saving
stockAdjustmentSchema.pre('save', async function(next) {
  if (!this.adjustmentNumber && this.isNew) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('StockAdjustment').countDocuments({
      tenantId: this.tenantId,
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.adjustmentNumber = `ADJ-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Approve adjustment and update inventory
stockAdjustmentSchema.methods.approve = async function(userId) {
  if (this.status !== 'pending') {
    throw new Error('Only pending adjustments can be approved');
  }
  
  const InventoryItem = mongoose.model('InventoryItem');
  const StockMovement = mongoose.model('StockMovement');
  
  // Get inventory item
  const item = await InventoryItem.findById(this.inventoryItemId);
  
  if (!item) {
    throw new Error('Inventory item not found');
  }
  
  // Update inventory
  const previousStock = item.currentStock;
  item.currentStock = this.newStock;
  await item.save();
  
  // Create stock movement
  await StockMovement.create({
    tenantId: this.tenantId,
    outletId: this.outletId,
    inventoryItemId: this.inventoryItemId,
    type: 'adjustment',
    quantity: this.newStock - previousStock,
    unit: this.unit,
    previousStock,
    newStock: this.newStock,
    unitCost: item.unitCost,
    referenceType: 'StockAdjustment',
    referenceId: this._id,
    performedBy: userId,
    notes: `${this.adjustmentType}: ${this.reason}`,
    timestamp: new Date()
  });
  
  // Update adjustment status
  this.status = 'approved';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  
  return this.save();
};

// Reject adjustment
stockAdjustmentSchema.methods.reject = function(userId, reason) {
  if (this.status !== 'pending') {
    throw new Error('Only pending adjustments can be rejected');
  }
  
  this.status = 'rejected';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  
  return this.save();
};

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);

module.exports = StockAdjustment;
