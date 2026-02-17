const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    userUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    bio: {
      type: String,
      maxLength: 500,
      default: '',
    },

    hobbies: {
      type: [String],
      default: [],
    },

    socials: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
      twitter: { type: String, default: '' },
      cv: { type: String, default: '' },
    },
    preferredTheme:{
      type: String,
      default:'default'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
