require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectMongoDB = require('./config/mongodb');
const { connectMySQL, sequelize } = require('./config/mysql');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow requests from the Vite dev server
  credentials: true, 
}));

app.use(express.json()); 

// Initialize Databases
const initializeDatabases = async () => {
  await connectMongoDB();
  await connectMySQL();
  
  // Sync MySQL models (creates tables if they don't exist based on our User.js model)
  // { force: true } drops and recreates the tables
  await sequelize.sync({ force: true }); 
  console.log('✅ MySQL Models synchronized.');
};

initializeDatabases();

// Import and mount the Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Test Route
app.get('/api', (req, res) => {
  res.json({ message: 'Phonebook Polyglot API is running!' });
});

// Import and mount the User Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contacts', contactRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});