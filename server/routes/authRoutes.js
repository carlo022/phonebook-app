const express = require('express');

const { 
  registerUser, 
  loginUser, 
  forgotpassword, 
  resetpassword 
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotpassword);
router.put('/resetpassword/:resettoken', resetpassword);

module.exports = router;