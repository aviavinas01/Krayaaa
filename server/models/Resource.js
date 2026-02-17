const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  
  // Categorization
  faculty: { type: String, required: true }, 
  subFaculty: { type: String, required: true }, // Branch (CSE, etc.)
  resourceType: { type: String, enum: ['NOTES', 'PYQ'], required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  year: { type: Number, required: true },
  examType: { type: String }, // Mid-Sem, End-Sem

  // The Magic Switch
  status: { 
    type: String, 
    enum: ['LIVE', 'PENDING', 'REJECTED'], 
    default: 'PENDING' 
  },
  
  contributedBy: { type: String, default: 'Admin' } // 'Admin' or Student Name
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);