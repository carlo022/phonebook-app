const bcrypt = require('bcryptjs');
const User = require('../models/sql/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Smart Logic: If this is the first user in the database, make them super-admin and active
    const userCount = await User.count();
    const isFirstUser = userCount === 0;

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: isFirstUser ? 'super-admin' : 'user',
      isActive: isFirstUser ? true : false,
    });

    res.status(201).json({
      message: isFirstUser 
        ? 'Super-Admin registered and activated successfully.' 
        : 'User registered successfully. Please wait for admin approval.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is approved by admin
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is pending admin approval or deactivated' });
    }
        // Success! Send back user data and token
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Generates token and sends email
// @route   POST /api/auth/forgotpassword
const forgotpassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Generate a random 20-character hex token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and save it to the database (for security if DB is compromised)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

    await user.save();

    // Create reset URL pointing to the React frontend
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\nPlease make a PUT request to: \n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Phonebook App - Password Reset Token',
        message,
      });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (emailError) {
      // If email fails, wipe the token from the DB to prevent locked accounts
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password - Updates password using the token
// @route   PUT /api/auth/resetpassword/:resettoken
const resetpassword = async (req, res) => {
  try {
    // Get hashed token from the URL parameter to compare with DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Find user by token and ensure token has not expired
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() } // Expiration date is Greater Than current time
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Wipe the reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You may now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotpassword, resetpassword };