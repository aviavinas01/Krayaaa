const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    ownerUid: {
      type: String,
      required: true,
      index: true,
    },

    ownerUsername: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    images: {
      type: [String],
      validate: {
        validator: (v) => v.length > 0 && v.length <= 3,
        message: 'You must upload 1 to 3 images',
      },
    },

    pricing: {
      perHour: {
        type: Number,
        min: 0,
      },
      perDay: {
        type: Number,
        min: 0,
      },
    },

    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rental', rentalSchema);
