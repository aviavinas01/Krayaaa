const router = require('express').Router();
const User = require('../models/User');
const Discussion = require('../models/Discussions');
const Reply = require('../models/Reply');
const Product = require('../models/Product');
const Rental = require('../models/Rentals');
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const UserProfile = require('../models/UserProfile');
const {ALLOWED_AVATARS} = require('../constants/avatars');
/**
 * Check if logged-in user exists in MongoDB
 */
router.post('/check-user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid);
    res.json({ exists: !!user });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * Create user profile (onboarding)
 */
router.post('/create-user', auth, async (req, res) => {
  try {
    const { username, hostelAddress, phoneNumber, avatarId } = req.body;

    if (!username || !hostelAddress || !phoneNumber) {
      return res.status(400).json({ msg: 'All fields required' });
    }

    const existingUser = await User.findById(req.user.uid);
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    if(!ALLOWED_AVATARS.includes(avatarId)){
        return res.status(400).json({ msg: 'Invalid avatar selection'});
    }

    const newUser = new User({
      _id: req.user.uid,
      email: req.user.email,
      username,
      hostelAddress,
      phoneNumber,
      avatarId,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * Fetch own profile
 */
router.get('/profile/:id', auth, async (req, res) => {
  if (req.user.uid !== req.params.id) {
    return res.status(403).json({ msg: 'Forbidden' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  res.json(user);
});


router.get('/public/:username', auth, requireProfile, async (req, res) => {
  try {
    // 1️⃣ Fetch user
    const user = await User.findOne({ username: req.params.username })
      .select('username avatarId reputation role createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // 2️⃣ Fetch extended profile (BIO + SOCIALS)
    const profile = await UserProfile.findOne({ userUid: user._id }).lean();

    // 3️⃣ Aggregate stats
    const [
      discussionsCount,
      repliesCount,
      productsCount,
      rentalsCount,
    ] = await Promise.all([
      Discussion.countDocuments({ authorUid: user._id }),
      Reply.countDocuments({ authorUid: user._id }),
      Product.countDocuments({ user: user._id }),
      Rental.countDocuments({ ownerUid: user._id }),
    ]);

    const upvotesAgg = await Reply.aggregate([
      { $match: { authorUid: user._id } },
      { $project: { upvoteCount: { $size: '$upvotes' } } },
      { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
    ]);

    // 4️⃣ Recent activity
    const [
      recentDiscussions,
      recentReplies,
      products,
      rentals,
    ] = await Promise.all([
      Discussion.find({ authorUid: user._id })
        .select('title createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Reply.find({ authorUid: user._id })
        .select('content discussion createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Product.find({ user: user._id })
        .select('name price')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Rental.find({ ownerUid: user._id })
        .select('title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // 5️⃣ FINAL RESPONSE (THIS IS THE KEY)
    res.json({
      user: {
        ...user,
        bio: profile?.bio || '',
        hobbies: profile?.hobbies || [],
        socials: profile?.socials || {},
      },
      stats: {
        discussions: discussionsCount,
        replies: repliesCount,
        products: productsCount,
        rentals: rentalsCount,
        upvotes: upvotesAgg[0]?.total || 0,
      },
      activity: {
        discussions: recentDiscussions,
        replies: recentReplies.map(r => ({
          _id: r._id,
          content: r.content,
          discussionId: r.discussion,
          createdAt: r.createdAt,
        })),
        products,
        rentals,
      },
    });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});



module.exports = router;
