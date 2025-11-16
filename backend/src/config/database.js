import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are recommended for Mongoose 6+
      // Remove if using older versions
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Import models to ensure they're registered with Mongoose
import '../models/user.model.js';
import '../models/portfolio.model.js';
import '../models/transaction.model.js';

// Export models for convenience
export { User } from '../models/user.model.js';
export { Portfolio } from '../models/portfolio.model.js';
export { Transaction } from '../models/transaction.model.js';
export { RiskProfile } from '../models/user.model.js';
export { AssetType } from '../models/portfolio.model.js';
export { GoalPriority } from '../models/portfolio.model.js';
export { TransactionType, TransactionStatus } from '../models/transaction.model.js';

