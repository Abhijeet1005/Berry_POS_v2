const mongoose = require('mongoose');
const { DYNOAPI_PLATFORMS } = require('../config/constants');

const platformIntegrationSchema = new mongoose.Schema({
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
  platform: {
    type: String,
    enum: Object.values(DYNOAPI_PLATFORMS),
    required: true
  },
  platformRestaurantId: {
    type: String,
    required: true
  },
  credentials: {
    apiKey: {
      type: String
    },
    apiSecret: {
      type: String
    }
  },
  itemMappings: [{
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    platformItemId: {
      type: String,
      required: true
    },
    platformItemName: {
      type: String
    },
    lastSyncedAt: {
      type: Date
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastSyncedAt: {
    type: Date
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'success', 'error'],
    default: 'idle'
  },
  lastError: {
    type: String
  },
  settings: {
    autoAcceptOrders: {
      type: Boolean,
      default: true
    },
    defaultPrepTime: {
      type: Number,
      default: 30 // minutes
    },
    autoSyncItems: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes
platformIntegrationSchema.index({ tenantId: 1, outletId: 1, platform: 1 }, { unique: true });
platformIntegrationSchema.index({ platformRestaurantId: 1 });

// Get platform restaurant ID for outlet
platformIntegrationSchema.statics.getRestaurantId = async function(outletId, platform) {
  const integration = await this.findOne({
    outletId,
    platform,
    isActive: true
  });
  
  return integration?.platformRestaurantId || null;
};

// Get dish mapping
platformIntegrationSchema.methods.getDishMapping = function(dishId) {
  return this.itemMappings.find(m => m.dishId.toString() === dishId.toString());
};

// Get platform item ID
platformIntegrationSchema.methods.getPlatformItemId = function(dishId) {
  const mapping = this.getDishMapping(dishId);
  return mapping?.platformItemId || null;
};

// Add or update item mapping
platformIntegrationSchema.methods.updateItemMapping = function(dishId, platformItemId, platformItemName) {
  const existingIndex = this.itemMappings.findIndex(
    m => m.dishId.toString() === dishId.toString()
  );
  
  if (existingIndex >= 0) {
    this.itemMappings[existingIndex].platformItemId = platformItemId;
    this.itemMappings[existingIndex].platformItemName = platformItemName;
    this.itemMappings[existingIndex].lastSyncedAt = new Date();
  } else {
    this.itemMappings.push({
      dishId,
      platformItemId,
      platformItemName,
      lastSyncedAt: new Date()
    });
  }
  
  return this.save();
};

const PlatformIntegration = mongoose.model('PlatformIntegration', platformIntegrationSchema);

module.exports = PlatformIntegration;
