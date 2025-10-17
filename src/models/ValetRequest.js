const mongoose = require('mongoose');
const { VALET_STATUS } = require('../config/constants');

const valetRequestSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  vehicleType: String,
  parkingSection: String,
  parkingSpot: String,
  status: {
    type: String,
    enum: Object.values(VALET_STATUS),
    default: 'requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  dispatchedAt: Date,
  deliveredAt: Date,
  retrievalTime: Number
}, {
  timestamps: true
});

valetRequestSchema.index({ tenantId: 1, outletId: 1, status: 1 });
valetRequestSchema.index({ customerId: 1 });

valetRequestSchema.pre('save', function(next) {
  if (this.isModified('deliveredAt') && this.deliveredAt && this.requestedAt) {
    this.retrievalTime = Math.floor((this.deliveredAt - this.requestedAt) / 1000);
  }
  next();
});

const ValetRequest = mongoose.model('ValetRequest', valetRequestSchema);

module.exports = ValetRequest;
