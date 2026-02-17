const mongoose = require('mongoose');

const rentalTransactionSchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },

    ownerUid: {
      type: String,
      required: true,
    },

    renterUid: {
      type: String,
      required: true,
    },

    // 🔁 STATUS MACHINE
    status: {
      type: String,
      enum: [
        'PENDING_RENTER_ACCEPTANCE',
        'ACTIVE',
        'PENDING_OWNER_CONFIRMATION',
        'COMPLETED',
        'DISPUTED',
        'CANCELLED',
      ],
      default: 'PENDING_RENTER_ACCEPTANCE',
    },

    // 📝 HANDOVER DATA (Owner)
    handover: {
      handoverDate:{ type:Date, default: Date.now},
      agreedReturnDate: {type: Date, required: true},
      conditionNotes: String,
      images: { 
        type: [String],
        validate: [arr => arr.length >=3, 'Minimum 3 images required'],
      },
      paymentConfirmedByOwner: { type: Boolean, default: false, required: true},
      idCardSubmittedToOwner:{ type: Boolean, default: false, required: true},
      confirmedAt: Date,
    },

    // ✅ RENTER AGREEMENT
    renterAcceptedAt: Date,
    renterMarkedReturnedAt: Date,
    ownerConfirmedReturnAt: Date,

    // ⭐ REVIEW
    review: {
      rating: { type: Number, min:1, max: 5},
      comment: String,
      createdAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RentalTransaction', rentalTransactionSchema);
