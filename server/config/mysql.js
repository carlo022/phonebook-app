const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize using the cloud connection URI
const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: 'mysql',
  logging: false, // Turn off SQL command spamming in the console
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necessary for many cloud providers like Railway to accept SSL connections
    }
  }
});

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Cloud MySQL (Avian) Connected successfully.');
  } catch (error) {
    console.error('❌ Cloud MySQL connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMySQL };