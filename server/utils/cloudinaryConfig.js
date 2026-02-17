// 1. FORCE load the .env file immediately
require('dotenv').config(); 

const cloudinary = require('cloudinary').v2;

// 3. Configure
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// 4. Export for both naming conventions
module.exports = { 
  marketplaceCloud: cloudinary, 
  resourceCloud: cloudinary,
};