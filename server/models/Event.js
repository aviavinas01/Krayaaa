const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL to the picture
  registrationLink: { type: String, required: true }, // Google Forms URL
  eventDate: { type: Date }, // Optional: When is the event?
  createdBy: { type: String, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);