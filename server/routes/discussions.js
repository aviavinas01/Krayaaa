const router = require('express').Router();
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const requireOwner = require('../middleware/requireOwner.js');
const Discussion = require('../models/Discussions');
const Reply = require('../models/Reply');
const User = require('../models/User');
const { findThread } = require('../utils/fixedThreads');
const requireReputation = require('../middleware/requireReputation.js');
const { awardReputation } = require('../services/reputationServices');
const { createNotification } = require('../services/notificationService.js');
const RULES = require('../config/reputationRules');


/**
 * GET /discussions/mine/replies
 * Fetch all replies made by the logged-in user
 * PLACE THIS ABOVE router.get('/:id', ...)
 */
router.get('/mine/replies', auth, requireProfile, async (req, res) => {
  try {
    // Find replies by this user and join with the Discussion title
    const replies = await Reply.find({ authorUid: req.user.uid })
      .populate('discussion', 'title') // This gives us access to the discussion title
      .sort({ createdAt: -1 });

    const enrichedReplies = replies.map(r => ({
      _id: r._id,
      text: r.content,
      createdAt: r.createdAt,
      discussionId: r.discussion?._id,
      threadTitle: r.discussion?.title || 'Unknown Discussion',
    }));

    res.json(enrichedReplies);
  } catch (err) {
    console.error('Error fetching user replies:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * GET /discussions/threads/:key
 * Get all discussions under a specific thread
 */
router.get('/threads/:key', auth, requireProfile, async (req, res) => {
  try {
    const thread = findThread(req.params.key);
    if (!thread) {
      return res.status(404).json({ msg: 'Thread not found' });
    }

    const discussions = await Discussion.find({ threadKey: thread.key }).sort({ createdAt: -1 });
    const uid = req.user?.uid;

    // ✅ FIX: Fetch author details for EVERY discussion in the list
    const enriched = await Promise.all(
      discussions.map(async (d) => {
        const author = await User.findById(d.authorUid).select('avatarId reputation username').lean();
        
        return {
          ...d.toObject(),
          authorAvatarId: author?.avatarId || null,
          authorReputation: author?.reputation || 0,
          authorUsername: author?.username || 'User', // Ensures name is always valid
          upvotesCount: d.upvotes?.length || 0,
          hasUpvoted: uid ? d.upvotes?.includes(uid) : false,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching discussions by thread:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * POST /discussions/threads/:key/add
 * Create a new discussion inside a thread
 */
router.post('/threads/:key', auth, requireProfile, requireReputation(10), async (req, res) => {
  try {
    const thread = findThread(req.params.key);
    if (!thread) {
      return res.status(404).json({ msg: 'Thread not found' });
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ msg: 'Title and content are required' });
    }

    const user = await User.findById(req.user.uid);
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const discussion = new Discussion({
      title,
      content,
      authorUid: req.user.uid,
      authorUsername: user.username,
      threadKey: thread.key,
    });

    await discussion.save();
    await awardReputation({
      userUid: req.user.uid,
      sourceType: 'DISCUSSION_CREATED', 
      sourceId: discussion._id,
      points: RULES.DISCUSSION_CREATED,
      reason: 'Started discussion',
    });
    res.status(201).json(discussion);
    
  }
   catch (err) {
    console.error('Error creating discussion:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});


/* ----------------------------------------------------
   SINGLE DISCUSSION
---------------------------------------------------- */

/**
 * GET /discussions/:id
 * Get a single discussion with replies
 */
router.get('/:id', auth, requireProfile, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }
    const author = await User.findById(discussion.authorUid).select('avatarId reputation');
    const uid = req.user?.uid;
    const replies = await Reply.find({ discussion: discussion._id }).sort({ createdAt: 1 });

    const repliesWithAvatars = await Promise.all(
      replies.map(async (reply) => {
        const user = await User.findById(reply.authorUid)
          .select('avatarId reputation username')
          .lean();

        return {
          ...reply.toObject(),
          parentReply: reply.parentReplyId,
          authorAvatarId: user?.avatarId ?? null,
          authorReputation: user?.reputation ?? 0,
          authorUsername: user?.username || 'User',
          upvotesCount: reply.upvotes?.length || 0,
          hasUpvoted: uid ? reply.upvotes?.includes(uid) : false,
        };
      })
    );

  
    const thread = findThread(discussion.threadKey);

    res.json({
      ...discussion.toObject(),
      authorAvatarId: author?.avatarId,
      authorReputation: author?.reputation ?? 0,
      upvotesCount: discussion.upvotes?.length || 0,
      hasUpvoted: uid ? discussion.upvotes?.includes(uid) : false,
      replies: repliesWithAvatars,
      thread,
    });
  } catch (err) {
    console.error('Error fetching discussion:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * POST /discussions/:id/reply
 * Add a reply to a discussion
 * Add reply OR reply-to-reply
 */
router.post('/:id/reply', auth, requireProfile, async (req, res) => {
  try {
    const { content, parentReplyId = null } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ msg: 'Reply content required' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }

    const user = await User.findById(req.user.uid);
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // --- FIX 1: Declare variable outside so it's available later ---
    let parentReplyDoc = null; 

    // Optional validation: parent reply must belong to same discussion
    if (parentReplyId) {
      // Assign to the variable declared above
      parentReplyDoc = await Reply.findById(parentReplyId);
      
      // Check validation
      if (!parentReplyDoc || parentReplyDoc.discussion.toString() !== discussion._id.toString()) {
        return res.status(400).json({ msg: 'Invalid parent reply' });
      }
    }

    const reply = new Reply({
      content,
      authorUid: req.user.uid,
      authorUsername: user.username,
      discussion: discussion._id,
      parentReplyId: parentReplyId,
    });

    await reply.save();

    discussion.repliesCount = (discussion.repliesCount || 0) + 1;
    await discussion.save();

    // Notification for Discussion Author
    if(!parentReplyId && discussion.authorUid !== req.user.uid){
      createNotification({
        userUid: discussion.authorUid,
        type: 'DISCUSSION_REPLY',
        title: 'New reply to your discussion',
        message: `${user.username} replied to your discussion "${discussion.title}"`,
        link: `/forums/discussions/${discussion._id}#reply-${reply._id}`,
      }).catch(console.error);
    }

    // --- FIX 2: Use the correct variable name (parentReplyDoc) ---
    // --- FIX 3: Fix typo req.user.Uid -> req.user.uid ---
    if (parentReplyDoc && parentReplyDoc.authorUid !== req.user.uid){
      createNotification({
        userUid: parentReplyDoc.authorUid,
        type: 'REPLY_REPLY',
        title: 'New reply to your comment',
        message: `${user.username} replied to your comment`,
        link: `/forums/discussions/${discussion._id}#reply-${reply._id}`,
      }).catch(console.error);
    }

    await awardReputation({
      userUid: req.user.uid,
      sourceType: 'REPLY_CREATED',
      sourceId: reply._id,
      points: RULES.REPLY_CREATED,
      reason: 'Posted reply',
    });

    res.status(201).json({
      ...reply.toObject(),
      authorAvatarId: user.avatarId,
      authorReputation: user.reputation,
      upvotesCount: 0,
      hasUpvoted: false,
    });

  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Upvotes for Discussions
router.post('/:id/upvote', auth, requireProfile, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ msg: 'Discussion not found' });
    }

    const uid = req.user.uid;

    const index = discussion.upvotes.indexOf(uid);

    if (index === -1) {
      discussion.upvotes.push(uid); // add vote
    } else {
      discussion.upvotes.splice(index, 1); // remove vote
    }

    await discussion.save();
    await awardReputation({
      userUid: discussion.authorUid,
      sourceType: 'UPVOTE_RECEIVED',
      sourceId: discussion._id,
      points: RULES.UPVOTE_RECEIVED,
      reason: 'Discussion upvoted',
    });

        // Prevent self-notification
    if (discussion.authorUid !== uid) {
      await createNotification({
        userUid: discussion.authorUid,
        type: 'UPVOTE_RECEIVED',
        message: `Your discussion received an upvote`,
        link: `/forums/discussions/${discussion._id}`,
        meta: {
          discussionId: discussion._id,
        },
      });
    }
    res.json({
      upvotesCount: discussion.upvotes.length,
      hasUpvoted: discussion.upvotes.includes(uid),
    });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to upvote discussion' });
  }
});

// Upvotes for Replies
router.post('/replies/:id/upvote', auth, requireProfile, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (!reply) {
      return res.status(404).json({ msg: 'Reply not found' });
    }

    const uid = req.user.uid;

    const index = reply.upvotes.indexOf(uid);

    if (index === -1) {
      reply.upvotes.push(uid);
    } else {
      reply.upvotes.splice(index, 1);
    }

    await reply.save();
    await awardReputation({
      userUid: reply.authorUid,
      sourceType: 'UPVOTE_RECEIVED',
      sourceId: reply._id,
      points: RULES.UPVOTE_RECEIVED,
      reason: 'Reply upvoted',
    });
    if (reply.authorUid !== uid) {
      await createNotification({
        userUid: reply.authorUid,
        type: 'UPVOTE_RECEIVED',
        message: `Your reply received an upvote`,
        link: `/forums/discussions/${reply.discussion}#reply-${reply._id}`,
      });
    }


    res.json({
      upvotesCount: reply.upvotes.length,
      hasUpvoted: reply.upvotes.includes(uid),
    });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to upvote reply' });
  }
});


//Edit Discussions
router.patch(
  '/:id',
  auth,
  requireProfile,
  requireOwner(Discussion, 'authorUid'),
  async (req, res) => {
    req.item.content = req.body.content;
    await req.item.save();
    res.json(req.item);
  }
);

// Delete Discussions
router.delete(
  '/:id',
  auth,
  requireProfile,
  requireOwner(Discussion, 'authorUid'),
  async (req, res) => {
    await Reply.deleteMany({ discussion: req.item._id });
    await req.item.deleteOne();
    res.json({ msg: 'Discussion deleted' });
  }
);



module.exports = router;
