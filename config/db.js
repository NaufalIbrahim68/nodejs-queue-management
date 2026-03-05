const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/queueapp', {
      serverSelectionTimeoutMS: 5000,
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

const getConnectionStatus = () => mongoose.connection.readyState === 1;

module.exports = { connectDB, getConnectionStatus };
