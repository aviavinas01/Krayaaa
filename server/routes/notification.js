const router = require('express').Router();
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const Notification = require('../models/Notification');

/* Latest 6 for navbar */
router.get('/latest', auth, requireProfile, async (req, res) => {
  const notifications = await Notification.find({
    userUid: req.user.uid,
  })
    .sort({ createdAt: -1 })
    .limit(6);

  res.json(notifications);
});

/* Full list with pagination */
router.get('/', auth, requireProfile, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    userUid: req.user.uid,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(notifications);
});

/* Mark as read */
router.patch('/:id/isread', auth, async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, userUid: req.user.uid },
    { isRead: true }
  );
  res.json({ success: true });
});

module.exports = router;
