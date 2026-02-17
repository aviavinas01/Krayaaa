const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2; // Ensure this is configured
const multer = require('multer');
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const RentalTransaction = require('../models/RentalTransaction');
const Rental = require('../models/Rentals');
const User = require('../models/User');

// Multer setup for memory storage (buffer access)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper: Upload to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'krayaa_rental_proofs' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * @route   POST /api/transactions/initiate
 * @desc    Owner creates a declaration. Uploads 3-5 images.
 * @access  Private (Owner)
 */
router.post(
  '/initiate/:rentalId',
  auth,
  requireProfile,
  upload.array('images', 5), // Max 5 images
  async (req, res) => {
    try {
      const { 
        renterUsername, 
        agreedReturnDate, 
        paymentConfirmed, 
        idCardSubmitted,
        conditionNotes
      } = req.body;

      //  Validation:
      if (!req.files || req.files.length < 3) {
        return res.status(400).json({ msg: 'You must upload at least 3 proof images.' });
      }

      //  Validation: 
      const rental = await Rental.findById(req.params.rentalId);
      if (!rental) return res.status(404).json({ msg: 'Rental item not found' });
      
      if (rental.ownerUid !== req.user.uid) {
        return res.status(403).json({ msg: 'You can only initiate transactions for your own items' });
      }

      const renter = await User.findOne({ username: renterUsername });
      if (!renter) {
        return res.status(404).json({ msg: `User '${renterUsername}' not found` });
      }
      
      // Prevent renting to self
      if (renter._id === req.user.uid) {
        return res.status(400).json({ msg: 'You cannot rent to yourself' });
      }

      // 4. Upload Images to Cloudinary
      const proofImageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
      );

      // 5. Create the Transaction
      const tx = new RentalTransaction({
        rentalId: rental._id,
        ownerUid: req.user.uid,
        renterUid: renter._id,
        handoverDetails: {
          handoverDate: new Date(),
          agreedReturnDate: new Date(agreedReturnDate),
          conditionNotes: conditionNotes || "",
          images: proofImageUrls,
          paymentConfirmed: paymentConfirmed === 'true' || paymentConfirmed === true,
          idCardSubmitted: idCardSubmitted === 'true' || idCardSubmitted === true,
          confirmedAt: new Date()
        },
        status: 'PENDING_RENTER_ACCEPTANCE'
      });

      await tx.save();

      await createNotification({
        userUid: renter._id,
        type: 'RENTAL_HANDOVER_REQUEST',
        title: 'handshake request',
        message: `${rental.title} rental awaiting your acceptance`,
        link: `/rentals/handshake/${tx._id}`,
      });

      res.status(201).json(tx);

    } catch (err) {
      console.error('Initiate Transaction Error:', err);
      res.status(500).json({ msg: 'Server error initiating transaction' });
    }
  }
);


router.get('/mine', auth, requireProfile, async (req, res) => {
  try {
    // Find transactions where I am either the Owner OR the Renter
    const handshakes = await RentalTransaction.find({
      $or: [
        { ownerUid: req.user.uid },
        { renterUid: req.user.uid }
      ]
    })
    .populate('rentalId', 'title pricing images') // Populate item details
    .populate('ownerUid', 'username avatarId')    // Populate other user's details
    .populate('renterUid', 'username avatarId')   
    .sort({ updatedAt: -1 }); // Newest activity first

    res.json(handshakes);
  } catch (err) {
    console.error('Fetch my handshakes error:', err);
    res.status(500).json({ msg: 'Server error fetching handshakes' });
  }
});

/**
 * @route   GET /api/transactions/pending
 * @desc    Get declarations waiting for MY agreement (as a Renter)
 * @access  Private (Renter)
 */
router.get('/:txId', auth, requireProfile, async (req, res) => {
  try {
    const tx = await RentalTransaction.find(req.params.txId)
    .populate('rentalId', 'title pricing images') // Show item details
    .populate('ownerUid', 'username avatarId reputation') // Show owner details
    .sort({ createdAt: -1 });
    
    if (!tx) return res.status(404).json({msg: 'Transaction not found'});

    if (![tx.ownerUid, tx.renterUid].includes(req.user.uid)){
      return res.status(403).json({msg: 'Acess denied'});
    }

    res.json(tx);
  } catch (err) {
    console.error('Fetch handshake error:',err);
    res.status(500).json({ msg: 'Server error fetching pending' });
  }
});

router.post('/:txId/accept', auth, requireProfile, async (req, res) => {
  try {
    const tx = await RentalTransaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });

    // Security check: Only the assigned renter can agree
    if (tx.renterUid.toString() !== req.user.uid) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    if (tx.status !== 'PENDING_RENTER_ACCEPTANCE') {
      return res.status(400).json({ msg: 'Transaction is not in pending state' });
    }

    tx.status = 'ACTIVE';
    tx.renterAgreedAt = new Date();
    await tx.save();

   await createNotification({
    userUid: tx.ownerUid,
    type: 'RENTAL_ACTIVE',
    title: 'Handshake partially done',
    link: `/rentals/handshake/${tx._id}`,
    message:'Renter accepted the rental agreement',
   });

    res.json(tx);
  } catch (err) {
    console.error('Accept handshake error',err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/transactions/:id/return
 * @desc    Renter marks item as returned -> Status 'pending_owner_confirmation'
 * @access  Private (Renter)
 */
router.put('/:txId/return', auth, async (req, res) => {
  try {
    const tx = await RentalTransaction.findById(req.params.txId);

    if (!tx) return res.status(404).json({ msg: 'Not found' });
    if (tx.renterUid.toString() !== req.user.uid) return res.status(403).json({ msg: 'Unauthorized' });

    if (tx.status !== 'ACTIVE') {
      return res.status(400).json({ msg: 'Rental is not currently active' });
    }

    tx.status = 'PENDING_OWNER_CONFIRMATION';
    tx.renterMarkedReturnedAt = new Date();
    await tx.save();

    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/transactions/:id/confirm
 * @desc    Owner confirms receipt -> Status 'completed'
 * @access  Private (Owner)
 */
router.post('/:txId/confirm', auth, requireProfile, async (req, res) => {
  try {
    const tx = await RentalTransaction.findById(req.params.txId);

    if (!tx) return res.status(404).json({ msg: 'Not found' });
    if (tx.ownerUid.toString() !== req.user.uid) return res.status(403).json({ msg: 'Unauthorized' });

    if (tx.status !== 'PENDING_OWNER_CONFIRMATION') {
      return res.status(400).json({ msg: 'Renter has not marked this as returned yet' });
    }

    tx.status = 'COMPLETED';
    tx.ownerConfirmedReturnAt = new Date();
    await tx.save();

    await createNotification({
      userUid: tx.renterUid,
      type:'RENTAL_COMPLETED',
      title:'Happy Renting yayyy',
      message:'Rental successfully completed! Leave a review for the owner!!',
      link: `/profile/handshake`,
    });

    res.json(tx);
  } catch (err) {
    console.error('Confirm return error:',err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/:txId/review', auth, requireProfile, async(req,res) => {
  try{
    const {rating,comment} = req.body;
    const tx = await RentalTransaction.findById(req.params.txId);
    if (!tx) return res.status(404).json({ msg: 'Transaction not found'});

    if(tx.renterUid.toString() !== req.user.uid) {
      return res.status(404).json({msg : 'Unauthorized'});
    }
    if(tx.status !=='COMPLETED'){
      return res.status(400).json({ msg: 'Transaction not completed yet'});
    }
    if(tx.review?.rating){
      return res.status(400).json({msg: 'Review already submitted'});
    }
    tx.review ={
      rating,
      comment,
      createdAt: new Date(),
    };

    await tx.save();
    await createNotification({
      userUid: tx.ownerUid,
      type: 'RENTAL_REVIEW_RECIEVED',
      message: 'You received a new rental review',
    });
    res.json(tx.review);
  }catch (err){
    res.status(500).json({ msg: 'Server error'});
  }
});

module.exports = router;