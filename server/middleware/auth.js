// server/middleware/auth.js

const admin = require('firebase-admin');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    let idToken;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      idToken = authHeader.split(' ')[1];
    } else {
      idToken = req.header('x-auth-token');
    }

    // 2. Block if token missing
    if (!idToken) {
      return res.status(401).json({
        msg: 'No authentication token, authorization denied.',
      });
    }

    // 3. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const dbUser = await User.findById(decodedToken.uid);
    req.user={
        uid:decodedToken.uid,
        email: decodedToken.email,
        reputation: dbUser?.reputation ?? 0,
        ...decodedToken
    }

    // 4. 🔐 DOMAIN ENFORCEMENT (CRITICAL)
    if (
      !decodedToken.email ||
      !decodedToken.email.endsWith('@kiit.ac.in')
    ) {
      return res.status(403).json({
        msg: 'Only KIIT university accounts are allowed.',
      });
    }

    // 5. Attach trusted user data
    //req.user = decodedToken; 

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(401).json({
      msg: 'Invalid or expired token, authorization denied.',
    });
  }
};

module.exports = auth;
