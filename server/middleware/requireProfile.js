// server/middleware/requireProfile.js
const User = require('../models/User');

module.exports = async function requireProfile(req, res, next) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ msg: 'Not authenticated' });
    }

    const user = await User.findById(req.user.uid);

    if (!user) {
      return res.status(403).json({ msg: 'Profile incomplete' });
    }

    req.dbUser = user; // optional convenience
    next();
  } catch (err) {
    console.error('RequireProfile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
