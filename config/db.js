const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if MongoDB is not available
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️  MongoDB not available: ${error.message}`);
    console.warn(`⚠️  Server will start without database. API calls will not work until MongoDB is connected.`);
    return false;
  }
};

const getConnectionStatus = () => isConnected;

module.exports = { connectDB, getConnectionStatus };
