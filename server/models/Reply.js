// models/Reply.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
      required: true,
    },

    // 🔑 Author
    authorUid: {
      type: String,
      required: true,
    },
    authorUsername: {
      type: String,
      required: true,
    },

    // 🧵 Nested reply support
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reply',
      default: null,
    },

    content: {
      type: String,
      required: true,
    },

    // 👍 Upvotes
    upvotes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

/* Indexes for performance */
replySchema.index({ discussion: 1, createdAt: -1 });
replySchema.index({ parentReplyId: 1 });
replySchema.index({ upvotes: -1 });

module.exports = mongoose.model('Reply', replySchema);
