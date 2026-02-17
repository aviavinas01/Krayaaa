// server/routes/admin.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const Event = require('../models/Event');
const Report = require('../models/Report');
const User = require('../models/User');

// ---------------------------------------------
// 🛡️ MIDDLEWARE: All routes require Auth + Admin
// ---------------------------------------------
router.use(auth, adminCheck);

/* ===========================
   EVENTS MANAGEMENT 
   =========================== */


router.get('/events', auth, async (req,res) => {
    try{
        const events = await Event.find().sort({ eventDate:1});
        res.json(events);
    }catch(err){
        console.error(err);
        res.status(500).json({ msg: 'Server Error'});
    }
});
// POST /api/admin/events
router.post('/events', async (req, res) => {
  try {
    const { title, description, imageUrl, registrationLink, eventDate } = req.body;
    
    // 1. Log to prove the route is running
    console.log("🚀 STARTING EVENT CREATION...");
    console.log("Firebase User Email:", req.user.email);

    // 2. Find User
    const user = await User.findOne({ email: req.user.email });
    
    // Check if user was found
    if (!user) {
        console.log("❌ ERROR: User not found in MongoDB.");
        return res.status(404).json({ msg: "User not found in database" });
    }

    console.log("✅ FOUND MONGO USER:", user._id); // This MUST be a MongoDB ID (e.g. 65a...)

    const newEvent = new Event({
      title, 
      description, 
      imageUrl, 
      registrationLink, 
      eventDate: eventDate || null,
      
      // ⚠️ THIS IS THE CRITICAL LINE ⚠️
      // It MUST be user._id. If it says req.user.uid, it will fail.
      createdBy: user._id 
    });

    await newEvent.save();
    console.log("🎉 EVENT SAVED SUCCESSFULLY!");
    res.status(200).json(newEvent);

  } catch (err) {
    console.error('❌ Create event error:', err);
    res.status(500).json({ msg: "Server Error" });
  }
});


// DELETE /api/admin/events/:id - Delete an event
router.delete('/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ msg: "Event deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});
/* ===========================
   REPORTS MANAGEMENT (Updated for your Model)
   =========================== */

// GET /api/admin/reports - Get all pending reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find({ status: 'PENDING' })
            .populate('reporterUid', 'username email') // Now this works because of 'ref'
            .sort({ createdAt: -1 });
            
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// PUT /api/admin/reports/:id - Resolve/Dismiss a report
router.put('/reports/:id', async (req, res) => {
    try {
        const { status } = req.body; 
        
        // Validation: Ensure status matches your Schema Enum
        const allowedStatuses = ['REVIEWED', 'DISMISSED', 'ACTION_TAKEN'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ msg: "Invalid status update" });
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        res.json(report);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});
module.exports = router;