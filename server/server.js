const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const usersRouter = require('./routes/users.js');
const productsRouter = require('./routes/products.js');
const forumsRouter = require('./routes/forums');
const discussionsRouter = require('./routes/discussions.js');
const rentalsRouter = require('./routes/rentals');
const eventRoutes = require('./routes/events');
const resourceRoutes = require('./routes/resource.js');

const User = require('./models/User.js');
const Product = require('./models/Product.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// CLOUDINARY CONFIGURATION
try {
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    console.log('Cloudinary configured successfully!');
} catch (error) {
    console.error('Cloudinary configuration failed:', error);
    process.exit(1); 
}

//FIREBASE ADMIN SDK INITIALIZATION
// NEW (USE THIS)
try {
    const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully!');
} catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
    process.exit(1); 
}

// MONGODB CONNECTION
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(err => {
        console.error('MongoDB connection error. Please check your MONGO_URI and network access:', err);
        process.exit(1); 
    });


//API ROUTES
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/forums', forumsRouter);
app.use('/discussions', discussionsRouter);
app.use('/rentals',rentalsRouter);
app.use('/dashboard', require('./routes/dashboard'));
app.use('/reports', require('./routes/reports'));
app.use('/profile', require('./routes/userProfile'));
app.use('/notifications', require('./routes/notification'));
app.use('/rentals/handshake', require('./routes/rentalHandshake.js'));
app.use('/admin', require('./routes/admin'));
app.use('/events', eventRoutes);
app.use('/api/resources', resourceRoutes);


//SERVE STATIC ASSETS IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
    });
}

// --- 5. START THE SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});