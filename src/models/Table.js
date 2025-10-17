const mongoose = require('mongoose');
const { TABLE_STATUS } = require('../config/constants');

const tableSchema = new mongoose.Schema({
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
  tableNumber: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: Object.values(TABLE_STATUS),
    default: 'available'
  },
  qrCode: String,
  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  section: String
}, {
  timestamps: true
});

tableSchema.index({ tenantId: 1, outletId: 1, status: 1 });
tableSchema.index({ tenantId: 1, outletId: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
