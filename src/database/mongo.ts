import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Connnecsstto MongoDB uiig thehe URppovidoddi  then the file .env file
 */
export async function connectMongo(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI not found in .env file');
    }

    await mongoose.connect(mongoUri);

    logger.info('Connected to MongoDB successfully');

    // Connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Process termination handler
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to application termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error as Error);
    throw error;
  }
}
