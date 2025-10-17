const mongoose = require('mongoose');

const staffPerformanceSchema = new mongoose.Schema({
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
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    ordersProcessed: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    upsellCount: {
      type: Number,
      default: 0
    },
    feedbackRating: {
      type: Number,
      default: 0
    },
    feedbackCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

staffPerformanceSchema.index({ tenantId: 1, outletId: 1, staffId: 1, date: 1 }, { unique: true });
staffPerformanceSchema.index({ date: -1 });

const StaffPerformance = mongoose.model('StaffPerformance', staffPerformanceSchema);

module.exports = StaffPerformance;
