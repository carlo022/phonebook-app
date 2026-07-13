const bcrypt = require('bcryptjs'); // Needed to hash passwords for newly added users
const User = require('../models/sql/User');

// @desc    Get all active users for the sharing search
// @route   GET /api/users/active
const getActiveUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email'] 
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin & Super-Admin only)
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a user directly from the admin panel
// @route   POST /api/users
const addUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // RBAC: Standard admins can only create 'user' roles. 
    // Super-admins can assign 'admin' or 'super-admin'.
    const assignedRole = (req.user.role === 'super-admin' && role) ? role : 'user';

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: assignedRole,
      isActive: true, // Auto-approve users created by admins
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a pending user account
// @route   PUT /api/users/:id/approve
const approveUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // RBAC Guard: Admins can only approve standard users
    if (req.user.role === 'admin' && user.role !== 'user') {
      return res.status(403).json({ message: 'Forbidden: You can only approve standard users.' });
    }

    user.isActive = true;
    await user.save();
    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details, role, or email
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // RBAC Guard: Admins can only modify standard users
    if (req.user.role === 'admin' && user.role !== 'user') {
      return res.status(403).json({ message: 'Forbidden: You can only modify standard users.' });
    }

    // Update standard fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    
    // RBAC Guard: Only super-admins can elevate roles or change emails
    if (req.user.role === 'super-admin') {
      if (req.body.role) {
        user.role = req.body.role;
      }
      
      // Update email if provided and different from current
      if (req.body.email && req.body.email !== user.email) {
        // Check if the new email already exists in the database
        const emailExists = await User.findOne({ where: { email: req.body.email } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use by another account' });
        }
        user.email = req.body.email;
      }
    }

    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
    }

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    // RBAC Guard: ONLY Super-Admins can delete accounts
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Forbidden: Only Super-Admins can delete accounts.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActiveUsers, getUsers, addUser, approveUser, updateUser, deleteUser };