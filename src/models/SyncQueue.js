const mongoose = require('mongoose');
const { SYNC_OPERATIONS } = require('../config/constants');

const syncQueueSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  collection: {
    type: String,
    required: true
  },
  operation: {
    type: String,
    enum: Object.values(SYNC_OPERATIONS),
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  synced: {
    type: Boolean,
    default: false
  },
  syncedAt: Date,
  conflictResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

syncQueueSchema.index({ tenantId: 1, deviceId: 1, synced: 1 });
syncQueueSchema.index({ timestamp: 1 });

const SyncQueue = mongoose.model('SyncQueue', syncQueueSchema);

module.exports = SyncQueue;
