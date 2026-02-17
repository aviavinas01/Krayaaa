// models/Discussion.js
const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    threadKey: { type: String, required: true }, // 'educational', 'career', etc.
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorUid: {type: String,required: true,},
    authorUsername: {type: String,required: true,},
    repliesCount: { type: Number, default: 0 },
    upvotes:{ type: [String], default:[]},
    createdAt: Date,
  },
  { timestamps: true }
);

discussionSchema.index({ replyCount: -1 });
discussionSchema.index({ 'upvotes.length': -1});
discussionSchema.index({ createdAt: -1});

module.exports = mongoose.model('Discussion', discussionSchema);
