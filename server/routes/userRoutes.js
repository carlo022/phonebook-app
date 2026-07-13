const express = require('express');
const { getUsers, addUser, approveUser, updateUser, deleteUser, getActiveUsers} = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const router = express.Router();

// 1. ALL routes in this file require the user to be logged in
router.use(protect);

// 2. PUBLIC ROUTE (Accessible by any logged-in user)
// Note: This must be placed ABOVE the /:id routes so Express doesn't mistake 'active' for a user ID
router.get('/active', getActiveUsers);

// 3. ADMIN-ONLY GUARDS
// Everything below this line requires the user to be an admin
router.use(adminOnly);

// Route: /api/users
router.route('/')
  .get(getUsers)
  .post(addUser);

// Route: /api/users/:id
router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

// Route: /api/users/:id/approve
router.route('/:id/approve')
  .put(approveUser);

module.exports = router;