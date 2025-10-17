const mongoose = require('mongoose');
const { FEEDBACK_SENTIMENTS } = require('../config/constants');

const feedbackSchema = new mongoose.Schema({
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  sentiment: {
    type: String,
    enum: Object.values(FEEDBACK_SENTIMENTS)
  },
  response: {
    message: String,
    couponCode: String,
    loyaltyPoints: Number,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

feedbackSchema.index({ tenantId: 1, outletId: 1, rating: 1 });
feedbackSchema.index({ orderId: 1 });
feedbackSchema.index({ sentiment: 1 });

feedbackSchema.pre('save', function(next) {
  if (this.isModified('rating') && !this.sentiment) {
    if (this.rating >= 4) {
      this.sentiment = 'positive';
    } else if (this.rating === 3) {
      this.sentiment = 'neutral';
    } else {
      this.sentiment = 'negative';
    }
  }
  next();
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
