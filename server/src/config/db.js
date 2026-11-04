import mongoose from 'mongoose';

export async function connectDatabase() {
  const url = (process.env.MONGODB_URI || '').trim();

  try {
    if (!url) throw new Error('MONGODB_URI Not Found');
    await mongoose.connect(url, { serverSelectionTimeoutMS: 10_000 });
    console.log(`[db] connected → ${url}`);
  } catch (error) {
    throw new Error(`Error connecting to MongoDB: ${error.message}`);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw new Error(`Error disconnecting from MongoDB: ${error.message}`);
  } finally {
    console.log(`[db] disconnected`);
  }
}
