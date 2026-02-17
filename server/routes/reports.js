const router = require('express').Router();
const auth = require('../middleware/auth');
const requireProfile = require('../middleware/requireProfile');
const Report = require('../models/Report');

/**
 * POST /reports
 * Create a report (user → user, reply, etc.)
 */
router.post('/', auth, requireProfile, async (req, res) => {
  try {
    const { targetType, targetRef, reason, description } = req.body;

    if (!targetType || !targetRef || !reason) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const report = new Report({
      reporterUid: req.user.uid,
      targetType,
      targetRef,
      reason,
      description,
    });

    await report.save();

    res.status(201).json({ msg: 'Report submitted successfully' });
  } catch (err) {
    console.error('Report submission error:', err);
    res.status(500).json({ msg: 'Failed to submit report' });
  }
});

module.exports = router;
