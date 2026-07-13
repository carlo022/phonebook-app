const express = require('express');
const { 
  getContacts, 
  createContact, 
  updateContact, 
  deleteContact, 
  toggleShareContact 
} = require('../controllers/contactController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Require a valid JWT token for all contact routes
router.use(protect);

// Route: /api/contacts
router.route('/')
  .get(getContacts)
  .post(createContact);

// Route: /api/contacts/:id
router.route('/:id')
  .put(updateContact)
  .delete(deleteContact);

// Route: /api/contacts/:id/share
router.route('/:id/share')
  .put(toggleShareContact);

module.exports = router;