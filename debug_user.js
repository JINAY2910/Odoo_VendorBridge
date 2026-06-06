import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procurement');
  const user = await User.findOne({ email: 'rahul@company.com' });
  if (user) {
    console.log('User found:', user.email);
    console.log('Role:', user.role);
    console.log('Password Hash:', user.password);
  } else {
    console.log('User not found');
  }
  process.exit();
}

checkUser();
