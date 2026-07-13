const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  // Signs the token with the user's ID and Role, valid for 30 days
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;