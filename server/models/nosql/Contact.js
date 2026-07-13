const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emailAddress: { type: String },
  profilePhoto: { type: String, default: '' }, 
  ownerId: { type: String, required: true }, // Links to the MySQL User ID who created it
  sharedWith: [{ type: String }], // Array of MySQL User IDs this contact is shared with
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);