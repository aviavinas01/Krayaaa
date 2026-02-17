const mongoose = require('mongoose');

const reputationLogSchema = new mongoose.Schema({
  userUid: {
    type: String,
    required: true,
    index: true,
  },

  sourceType: {
    type: String,
    enum: [
      'UPVOTE_RECEIVED',
      'DISCUSSION_CREATED',
      'REPLY_CREATED',
      'RESOURCE_UPLOAD',
      'BUG_REPORT',
      'RULE_VIOLATION',
      'ADMIN_ADJUSTMENT',
    ],
    required: true,
  },

  sourceId: {
    type: String,
  },

  points: {
    type: Number,
    required: true,
  },

  reason: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reputationLogSchema.index({ userUid: 1});

module.exports = mongoose.model('ReputationLog', reputationLogSchema);
