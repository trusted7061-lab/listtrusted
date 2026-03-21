const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try connecting to local/remote MongoDB first
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
