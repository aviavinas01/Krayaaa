const router = require('express').Router();
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const UserProfile = require('../models/UserProfile');
const express = require('express');
const userController = require('../controller/updateTheme');

/* ------------------------------------
   GET my profile (dashboard)
------------------------------------ */
router.get('/me', auth, requireProfile, async (req, res) => {
  const profile = await UserProfile.findOne({ userUid: req.user.uid });
  res.json(profile || null);
});

/* ------------------------------------
   CREATE or UPDATE my profile
------------------------------------ */
router.post('/me', auth, requireProfile, async (req, res) => {
  const { bio, hobbies, socials } = req.body;

  const profile = await UserProfile.findOneAndUpdate(
    { userUid: req.user.uid },
    { bio, hobbies, socials },
    { upsert: true, new: true }
  );

  res.json(profile);
});

/* ------------------------------------
   GET public profile (read-only)
------------------------------------ */
router.get('/public/:username', auth, async (req, res) => {
  const User = require('../models/User');

  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ msg: 'User not found' });

  const profile = await UserProfile.findOne({ userUid: user._id });

  res.json({
    user,
    profile,
  });
});

router.put('/theme', auth, requireProfile, userController.updateTheme);

module.exports = router;
