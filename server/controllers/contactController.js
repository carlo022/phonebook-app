const Contact = require('../models/nosql/Contact');
const User = require('../models/sql/User');

// @desc    Get all contacts (Owned by user OR shared with user)
// @route   GET /api/contacts
const getContacts = async (req, res) => {
  try {
    // Queries MongoDB for documents where the logged-in user is either the owner OR exists in the sharedWith array
    const contacts = await Contact.find({
      $or: [
        { ownerId: req.user.id },
        { sharedWith: req.user.id }
      ]
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new contact
// @route   POST /api/contacts
const createContact = async (req, res) => {
  try {
    const { firstName, lastName, contactNumber, emailAddress, profilePhoto } = req.body;
    
    const contact = await Contact.create({
      firstName,
      lastName,
      contactNumber,
      emailAddress,
      profilePhoto, // We will accept a Base64 string or an image URL here from the frontend
      ownerId: req.user.id, // Automatically assign the logged-in user's MySQL ID as the owner
      sharedWith: []
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a contact (Only the owner can do this)
// @route   PUT /api/contacts/:id
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    
    // Strict guard: Ensure only the owner can update
    if (contact.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized: Only the owner can update this contact' });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Returns the newly updated document
    );

    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    // Strict guard: Ensure only the owner can delete
    if (contact.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized: Only the owner can delete this contact' });
    }

    await contact.deleteOne();
    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share or unshare a contact with another user
// @route   PUT /api/contacts/:id/share
const toggleShareContact = async (req, res) => {
  try {
    const { targetEmail, action } = req.body; // action must be 'share' or 'unshare'
    
    if (!targetEmail) return res.status(400).json({ message: 'Target email is required' });
    if (!action) return res.status(400).json({ message: 'Action (share/unshare) is required' });

    // 1. Look up the target user in MySQL
    const targetUser = await User.findOne({ where: { email: targetEmail } });
    
    if (!targetUser) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    if (targetUser.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot share/unshare a contact with yourself' });
    }

    const targetUserId = targetUser.id; 

    // 2. Find the contact in MongoDB
    const contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (contact.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized: Only the owner can modify sharing' });
    }

    const isShared = contact.sharedWith.includes(targetUserId);

    // 3. Execute the exact requested action
    if (action === 'unshare') {
      if (!isShared) {
        return res.status(400).json({ message: 'This contact is not shared with that user.' });
      }
      // Remove the ID from the array
      contact.sharedWith = contact.sharedWith.filter(id => id !== targetUserId);
      await contact.save();
      return res.json({ message: `Contact successfully unshared from ${targetEmail}` });
      
    } else if (action === 'share') {
      if (isShared) {
        return res.status(400).json({ message: 'This contact is already shared with that user.' });
      }
      // Add the ID to the array
      contact.sharedWith.push(targetUserId);
      await contact.save();
      return res.json({ message: `Contact successfully shared with ${targetEmail}` });
      
    } else {
      return res.status(400).json({ message: 'Invalid action parameter' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getContacts, 
  createContact, 
  updateContact, 
  deleteContact, 
  toggleShareContact
};