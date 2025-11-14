const mongoose = require('mongoose');
const { PURCHASE_ORDER_STATUS } = require('../config/constants');

const purchaseOrderSchema = new mongoose.Schema({
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
  poNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  items: [{
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    totalCost: {
      type: Number,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(PURCHASE_ORDER_STATUS),
    default: 'draft'
  },
  orderedDate: {
    type: Date
  },
  expectedDeliveryDate: {
    type: Date
  },
  receivedDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
purchaseOrderSchema.index({ tenantId: 1, outletId: 1, status: 1 });
purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ supplierId: 1 });
purchaseOrderSchema.index({ createdAt: -1 });

// Generate PO number before saving
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.poNumber && this.isNew) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('PurchaseOrder').countDocuments({
      tenantId: this.tenantId,
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.poNumber = `PO-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Calculate totals
purchaseOrderSchema.methods.calculateTotals = function() {
  // Calculate item totals
  this.items.forEach(item => {
    item.totalCost = item.quantity * item.unitCost;
  });
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalCost, 0);
  
  // Calculate total
  this.total = this.subtotal + this.taxAmount + this.shippingCost;
  
  return this;
};

// Approve purchase order
purchaseOrderSchema.methods.approve = function(userId) {
  if (this.status !== 'pending') {
    throw new Error('Only pending purchase orders can be approved');
  }
  
  this.status = 'approved';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  
  return this.save();
};

// Receive goods
purchaseOrderSchema.methods.receiveGoods = async function(receivedItems) {
  const InventoryItem = mongoose.model('InventoryItem');
  const StockMovement = mongoose.model('StockMovement');
  
  for (const received of receivedItems) {
    const poItem = this.items.id(received.itemId);
    
    if (!poItem) {
      throw new Error(`Item ${received.itemId} not found in purchase order`);
    }
    
    // Update received quantity
    poItem.receivedQuantity += received.quantity;
    
    if (poItem.receivedQuantity > poItem.quantity) {
      throw new Error(`Received quantity exceeds ordered quantity for item ${poItem.inventoryItemId}`);
    }
    
    // Update inventory
    const inventoryItem = await InventoryItem.findById(poItem.inventoryItemId);
    
    if (!inventoryItem) {
      throw new Error(`Inventory item ${poItem.inventoryItemId} not found`);
    }
    
    const previousStock = inventoryItem.currentStock;
    await inventoryItem.updateStock(received.quantity, 'increment');
    inventoryItem.lastRestocked = new Date();
    await inventoryItem.save();
    
    // Create stock movement
    await StockMovement.create({
      tenantId: this.tenantId,
      outletId: this.outletId,
      inventoryItemId: inventoryItem._id,
      type: 'purchase',
      quantity: received.quantity,
      unit: poItem.unit,
      previousStock,
      newStock: inventoryItem.currentStock,
      unitCost: poItem.unitCost,
      referenceType: 'PurchaseOrder',
      referenceId: this._id,
      timestamp: new Date()
    });
  }
  
  // Update PO status
  if (this.isFullyReceived()) {
    this.status = 'received';
    this.receivedDate = new Date();
  } else {
    this.status = 'partially-received';
  }
  
  return this.save();
};

// Check if all items are fully received
purchaseOrderSchema.methods.isFullyReceived = function() {
  return this.items.every(item => item.receivedQuantity >= item.quantity);
};

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
