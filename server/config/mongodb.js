const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    // Mongoose automatically parses cloud options (+srv) from the Atlas URI
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Cloud MongoDB (Atlas) Connected successfully.');
  } catch (error) {
    console.error('❌ Cloud MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectMongoDB;