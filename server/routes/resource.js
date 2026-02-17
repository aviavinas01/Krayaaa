const router = require('express').Router();
const auth = require('../middleware/auth');  
const Resource = require('../models/Resource');
const cloudinaryLib = require('cloudinary').v2;
const adminCheck = require('../middleware/adminCheck');

// Frontend calls this BEFORE uploading to Cloudinary
router.get('/sign-upload', auth, (req, res) => {
  try {
    const timestamp = Math.round((new Date()).getTime() / 1000);
     const params = {
      timestamp: timestamp,
    };

    // GENERATE SIGNATURE using the RESOURCE account's secret
    const signature = cloudinaryLib.utils.api_sign_request(
      params,
      process.env.API_SECRET
    );

    res.json({
      timestamp,
      signature,
      apiKey: process.env.API_KEY, // Send public key to frontend
      cloudName: process.env.CLOUD_NAME
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Signing Error" });
  }
});

// --- 1. UPLOAD RESOURCE (Secure) ---
router.post('/upload', auth, async (req, res) => {
  try {
    const { 
        title, fileUrl, faculty, subFaculty, 
        resourceType, semester, subject, year, examType 
    } = req.body;

    const isAdmin = req.user.email === "22054401@kiit.ac.in"; 
    if (!isAdmin) {
      const existingPending = await Resource.findOne({
        contributedBy: req.user.username,
        status:'PENDING'
      });
      if (existingPending) {
        return res.status(400).json({
          msg: "Limit reached: You already have a resource under review."
        });
      }
    }

    const status = isAdmin ? 'LIVE' : 'PENDING';
    const contributorName = isAdmin ? 'Admin' : req.user.username || 'Student';

    const newResource = new Resource({
      title, fileUrl, faculty, subFaculty, resourceType, 
      semester, subject, year, examType, 
      status, 
      contributedBy: contributorName
    });

    await newResource.save();
    res.json({ msg: "Upload successful", status: newResource.status });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get('/upload-status', auth, async (req, res) => {
  try{
    const isAdmin = req.user.email ==="22054401@kiit.ac.in";
    if (isAdmin) return res.json({ canUpload: true });
    const pending = await Resource.findOne({
      contributedBy: req.user.username,
      status: 'PENDING'
    });
    res.json({ canUpload: !pending});
  }catch(err){
    res.status(500).json({msg:"Server Error"});
  }
});




// --- 2. APPROVE RESOURCE (The "Accept" Button) ---
router.put('/approve/:id', auth, adminCheck, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ msg: "Not found" });

    resource.status = 'LIVE';
    await resource.save();

    res.json({ msg: "Resource is now LIVE!", resource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. DELETE RESOURCE (The "Reject" Button) ---
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.email !== "22054401@kiit.ac.in") {
        return res.status(403).json({ msg: "Access denied" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ msg: "Not found" });

    // 1. Delete PDF from Cloudinary (Account B)
    if (resource.fileUrl) {
        const publicId = resource.fileUrl.split('/').pop().split('.')[0];
        // Use 'resourceCloud' to delete from the correct account
        await resourceCloud.uploader.destroy(`academic_resources/${publicId}`, { resource_type: 'raw' });
    }

    // 2. Delete from MongoDB
    await resource.deleteOne();
    res.json({ msg: "Resource and PDF deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- 4. PUBLIC LIST (For Students) ---
router.get('/', async (req, res) => {
  try {
    const { faculty, subFaculty, resourceType, semester, subject, year } = req.query;

    // STRICTLY filter for 'LIVE'
    let query = { status: 'LIVE' };

    if (faculty) query.faculty = faculty;
    if (subFaculty) query.subFaculty = subFaculty;
    if (resourceType) query.resourceType = resourceType;
    if (semester) query.semester = semester;
    // Flexible search for Subject (e.g. "Data" matches "Data Mining")
    if (subject) query.subject = { $regex: subject, $options: 'i' }; 
    if (year) query.year = year;

    const resources = await Resource.find(query).sort({ year: -1, createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// --- 5. PENDING LIST (For Admin Dashboard) ---
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.email !== "22054401@kiit.ac.in") {
        return res.status(403).json({ msg: "Access denied" });
    }
    const resources = await Resource.find({ status: 'PENDING' }).sort({ createdAt: 1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;