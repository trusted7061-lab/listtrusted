const mongoose = require('mongoose');

// Cache connection across Vercel serverless invocations
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Return existing connection if healthy
  if (cached.conn && mongoose.connection.readyState === 1) {
    return process.env.MONGODB_URI;
  }

  // Reuse in-progress connection promise
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      bufferCommands: false
    }).then(m => {
      cached.conn = m;
      console.log('MongoDB connected');
      return m;
    });
  }

  try {
    await cached.promise;
  } catch (err) {
    cached.promise = null; // reset so next call retries
    throw err;
  }

  return process.env.MONGODB_URI;
};

module.exports = connectDB;
