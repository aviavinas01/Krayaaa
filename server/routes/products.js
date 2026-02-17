require('dotenv').config();
const router = require('express').Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product.js');
const multer = require('multer');
const requireProfile = require('../middleware/requireProfile.js');
const requireReputation = require('../middleware/requireReputation.js');
const storage = multer.memoryStorage();
const {createNotification} = require('../services/notificationService.js');
const listingLimits = require('../middleware/listingLimits.js');
const upload = multer({ storage: storage });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

/**
 * GET /products
 * List all products
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('user', 'username');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products list:', err);
    res.status(500).json({ msg: 'Server error while fetching products' });
  }
});

//GET /products/mine
router.get('/mine', auth, requireProfile, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.uid })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch user products' });
  }
});


/**
 * POST /products/add
 * Create a new product (protected)
 */
router.post('/add', auth, requireProfile,listingLimits({model:Product,ownerField:'user',type:'product',}), upload.array('images', 3), async (req, res) => {
  try {
    console.log("---------------- DEBUGGING ----------------");
    console.log("1. Cloud Name:", process.env.CLOUD_NAME);
    console.log("2. API Key:", process.env.API_KEY);
    console.log("3. API Secret:", process.env.API_SECRET ? "****(Exists)" : "MISSING");
    console.log("-------------------------------------------");
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'Please upload at least one image.' });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'krayaa_products', cloud_name: process.env.CLOUD_NAME,api_key: process.env.API_KEY, 
            api_secret: process.env.API_SECRET },
          (error, result) => {
            if (error){
              console.error("Cloudinary Upload Error:", error);
               return reject(error);
            }
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    const { name, description, price, category } = req.body;
    const userId = req.user.uid;

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category,
      imageUrls,
      user: userId,
    });

    await newProduct.save();
    await createNotification({
      userUid: req.user.uid,
      type: 'PRODUCT_LISTED',
      title: 'Product listed',
      message: `Your product "${name}" has gone live!`,
      link: `/product/${newProduct._id}`,
    });

    res.status(201).json('Product added!');
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ msg: 'Server error while adding product' });
  }
});

/**
 * GET /products/:id
 * Get a single product with seller info
 */
router.get('/:id', auth, requireProfile,  async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'user',
      'username email phoneNumber hostelAddress'
    );

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching single product:', err);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid product id' });
    }
    res.status(500).json({ msg: 'Server error while fetching product' });
  }
});

// Edit products
// PATCH /products/:id
router.patch('/:id', auth, requireProfile, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Not found' });

    // 🔐 Ownership check
    if (product.user.toString() !== req.user.uid) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    // 🧼 Whitelist fields
    const allowedUpdates = ['name', 'description', 'price', 'category'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Update failed' });
  }
});


// DELETE /products/:id
router.delete('/:id', auth, requireProfile, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // 🔐 Ownership check (string-safe)
    if (product.user !== req.user.uid) {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    await product.deleteOne();
    res.json({ msg: 'Product deleted' });

  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ msg: 'Delete failed' });
  }
});



module.exports = router;
