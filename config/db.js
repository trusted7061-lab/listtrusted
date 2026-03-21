const mongoose = require('mongoose');

const connectDB = async () => {
  // In production (Vercel), MONGODB_URI must be set — memory server cannot run serverless
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required in production');
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB connected successfully');
    return process.env.MONGODB_URI;
  }

  // In development, try Atlas then fall back to in-memory
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
    return process.env.MONGODB_URI;
  } catch (err) {
    console.log('Local MongoDB not available, starting in-memory server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('In-memory MongoDB connected successfully');
    return uri;
  }
};

module.exports = connectDB;
