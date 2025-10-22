require('dotenv').config(); // Make sure to install this package: npm install dotenv
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {});
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;