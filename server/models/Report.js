const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterUid: {
      type: String,
      required: true,
      index: true,
    },

    targetType: {
      type: String,
      enum: ['USER', 'DISCUSSION', 'REPLY', 'PRODUCT', 'RENTAL'],
      required: true,
    },

    targetRef: {
      type: String, // userId, discussionId, replyId, etc.
      required: true,
      index: true,
    },

    reason: {
      type: String,
      enum: [
        'SPAM',
        'HARASSMENT',
        'HATE_SPEECH',
        'IMPERSONATION',
        'SCAM',
        'INAPPROPRIATE_CONTENT',
        'OTHER',
      ],
      required: true,
    },

    description: {
      type: String,
      maxlength: 100,
    },

    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
