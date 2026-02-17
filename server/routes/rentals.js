require('dotenv').config();
const router = require('express').Router();
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const requireOwner = require('../middleware/requireOwner.js');
const Rental = require('../models/Rentals');
const User = require('../models/User');
const multer = require('multer');
const listingLimits = require('../middleware/listingLimits.js');
const {createNotification} = require('../services/notificationService.js');
const cloudinary = require('cloudinary').v2;
const upload = multer({ storage: multer.memoryStorage() });

/*
 
 * Browse available rentals with Owner Avatar and Reputation
*/
router.get('/', auth, requireProfile, async (req, res) => {
  try {
    const rentals = await Rental.find({ availability: true }).sort({ createdAt: -1 });

    // ✅ Map through rentals and fetch User data for each
    const enriched = await Promise.all(
      rentals.map(async (r) => {
        const owner = await User.findById(r.ownerUid).select('avatarId reputation').lean();
        return {
          ...r.toObject(),
          imageUrls: r.images,
          perHour: r.pricing?.perHour,
          perDay: r.pricing?.perDay,
          ownerAvatarId: owner?.avatarId || null,
          ownerReputation: owner?.reputation || 0,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('Fetch rentals error:', err);
    res.status(500).json({ msg: 'Failed to fetch rentals' });
  }
});

// GET /rentals/mine
router.get('/mine', auth, requireProfile, async (req, res) => {
  try {
    const rentals = await Rental.find({
      ownerUid: req.user.uid,
    }).sort({ createdAt: -1 });

    res.json(rentals);
  } catch (err) {
    console.error('Fetch my rentals error:', err);
    res.status(500).json({ msg: 'Failed to fetch your rentals' });
  }
});

/**
 * GET /rentals/:id
 * Get single rental with Owner Avatar and Reputation
 */
router.get('/:id', auth, requireProfile, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ msg: 'Not found' });

    // ✅ Fetch owner data for the detail view
    const owner = await User.findById(rental.ownerUid).select('avatarId reputation').lean();

    res.json({
      ...rental.toObject(),
      imageUrls: rental.images,
      perHour: rental.pricing?.perHour,
      perDay: rental.pricing?.perDay,
      ownerAvatarId: owner?.avatarId || null,
      ownerReputation: owner?.reputation || 0,
    });
  } catch (err) {
    console.error('Rental detail error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * POST /rentals/add
 * Add a rental item
 */
router.post('/add',auth,requireProfile,listingLimits({model:Rental,ownerField:'ownerUid',type:'rental',}),upload.array('images', 3),async (req, res) => {
    try {
      const { title, description, perHour, perDay } = req.body;

      if (!title || !description) {
        return res.status(400).json({ msg: 'Title and description required' });
      }

      if (!perHour && !perDay) {
        return res.status(400).json({ msg: 'At least one pricing option required' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: 'Upload at least one image' });
      }

      const user = await User.findById(req.user.uid);
      if (!user) {
        return res.status(400).json({ msg: 'User profile not found' });
      }

      // Upload images to Cloudinary
      const imageUrls = await Promise.all(req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type:'auto', folder: 'krayaa_rentals',cloud_name: process.env.CLOUD_NAME,api_key: process.env.API_KEY, 
                api_secret: process.env.API_SECRET},
              (error, result) => {
                if (error){
                  console.error("Cloudinary Upload Error:",error);
                  return reject(error);
                } 
                 resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          });
        })
      );

      const rental = new Rental({
        ownerUid: req.user.uid,
        ownerUsername: user.username,
        title,
        description,
        images: imageUrls,
        pricing: {
          perHour: perHour || undefined,
          perDay: perDay || undefined,
        },
      });

      await rental.save();
      await createNotification({
        userUid: req.user.uid,
        type: 'RENTAL_LISTED',
        title: 'Rental Listed',
        message: `Your rental "${title}" was listed successfully`,
        link: `/rentals/${rental._id}`,
      });

      res.status(201).json(rental,"Rental Added!");
    } catch (err) {
      console.error('Add rental error:', err);
      res.status(500).json({ msg: 'Failed to add rental' });
    }
    
  }
);

// Edit rentals
router.put(
  '/:id',
  auth,
  requireProfile,
  requireOwner(Rental),
  async (req, res) => {
    Object.assign(req.item, req.body);
    await req.item.save();
    res.json(req.item);
  }
);

// Delete Rentals
router.delete(
  '/:id',
  auth,
  requireProfile,
  requireOwner(Rental),
  async (req, res) => {
    await req.item.deleteOne();
    res.json({ msg: 'Rental deleted' });
  }
);


module.exports = router;
