// server/middleware/adminCheck.js
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // 1. Check if auth middleware passed the user info
    if (!req.user || !req.user.email) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // 2. Fetch the user's email from the DB
    const user = await User.findOne({email: req.user.email});

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    const ADMIN_ROLL_NUMBER = "22054401";
    const extractedRollNumber = user.email.split('@')[0];

    if (extractedRollNumber !== ADMIN_ROLL_NUMBER) {
      return res.status(403).json({ msg: "Admins only" });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};