import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed default admin user for testing and evaluation
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      if (email && password) {
        await User.create({
          name: 'Sattvic Admin',
          email,
          password,
          city: 'Vallabh Vidyanagar',
          pincode: '388120',
          isAdmin: true
        });
        console.log(`[Database] Default admin user seeded successfully (${email})`);
      } else {
        console.warn('[Database] Seeding skipped: ADMIN_EMAIL and ADMIN_PASSWORD env variables are not defined in the environment.');
      }
    }
  } catch (error) {
    console.error(`[Error] Database connection failure: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
