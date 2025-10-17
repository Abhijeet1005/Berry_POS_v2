const mongoose = require('mongoose');
const { KOT_STATUS } = require('../config/constants');

const kotSchema = new mongoose.Schema({
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  kotNumber: {
    type: String
  },
  tableNumber: String,
  kitchenSection: {
    type: String,
    required: true
  },
  items: [{
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customization: String
  }],
  status: {
    type: String,
    enum: Object.values(KOT_STATUS),
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal'
  },
  completedAt: Date
}, {
  timestamps: true
});

// Indexes
kotSchema.index({ tenantId: 1, outletId: 1, status: 1 });
kotSchema.index({ orderId: 1 });
kotSchema.index({ kitchenSection: 1, status: 1 });

// Generate KOT number
kotSchema.pre('save', async function(next) {
  if (!this.kotNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('KOT').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.kotNumber = `KOT-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const KOT = mongoose.model('KOT', kotSchema);

module.exports = KOT;
