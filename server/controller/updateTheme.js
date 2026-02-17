// server/controllers/userController.js
const UserProfile = require('../models/UserProfile');

exports.updateTheme = async (req, res) => {
  const { theme } = req.body;

  const allowedThemes = [
    'default', 
    'blue', 
    'gold', 
    'pink', 
    'purple', 
    'red', 
    'orange'
  ];
  if (!allowedThemes.includes(theme)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid theme selected." 
    });
  }

  const firebaseUid = req.user.uid;

  try {
    const updatedUser = await UserProfile.findOneAndUpdate(
        {userUid : firebaseUid},
        { preferredTheme: theme},
        { new: true }
    );
    if (!updatedUser){
        console.log("User not found in DB");
        return res.status(404).json({ sucess: false, message: "user not found"});
    }
    res.json({ success: true, theme: updatedUser.preferredTheme });
  } catch (err) {
    console.error("THEME UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};