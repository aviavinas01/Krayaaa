const router = require('express').Router();
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');

const Discussion = require('../models/Discussions');
const Reply = require('../models/Reply');

/**
 * HOT TOPICS
 * Most replied discussions
 */
router.get('/hot-topics', auth, requireProfile, async (req, res) => {
  try {
    const discussions = await Discussion.aggregate([
      {
        $lookup: {
          from: 'replies',
          localField: '_id',
          foreignField: 'discussion',
          as: 'replies',
        },
      },
      {
        $addFields: {
          repliesCount: { $size: '$replies' },
        },
      },
      { $sort: { repliesCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          repliesCount: 1,
        },
      },
    ]);

    res.json(discussions);
  } catch (err) {
    console.error('Hot topics error:', err);
    res.status(500).json([]);
  }
});

/**
 * TOP REPLIES
 * Most upvoted replies
 */
router.get('/top-replies', auth, requireProfile, async (req, res) => {
  try {
    const replies = await Reply.aggregate([
      {
        $addFields: {
          upvotesCount: { $size: { $ifNull: ['$upvotes', []] } },
        },
      },
      { $sort: { upvotesCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          content: 1,
          upvotesCount: 1,
          authorUsername: 1,
        },
      },
    ]);

    res.json(replies);
  } catch (err) {
    console.error('Top replies error:', err);
    res.status(500).json([]);
  }
});

/**
 * RECENT REPLIES
 */
router.get('/recent-replies', auth, requireProfile, async (req, res) => {
  try {
    const replies = await Reply.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('content authorUsername createdAt');

    res.json(replies);
  } catch (err) {
    console.error('Recent replies error:', err);
    res.status(500).json([]);
  }
});

module.exports = router;
