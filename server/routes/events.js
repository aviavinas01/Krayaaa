const router = require('express').Router();
const Event = require('../models/Event');

// GET /events
// Public route to fetch all upcoming events
router.get('/', async (req, res) => {
  try {
    // Fetch events and sort them by date (soonest first)
    const events = await Event.find().sort({ eventDate: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;