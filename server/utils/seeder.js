import User, { UserRole } from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const seedUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Users already exist, skipping seeder.');
      return;
    }

    console.log('Seeding default users...');
    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        _id: new mongoose.Types.ObjectId('000000000000000000000001'),
        name: 'System Admin',
        email: 'admin@company.com',
        password: await bcrypt.hash('admin123', salt),
        role: UserRole.ADMIN
      },
      {
        _id: new mongoose.Types.ObjectId('000000000000000000000002'),
        name: 'Procurement Manager',
        email: 'manager@company.com',
        password: await bcrypt.hash('manager123', salt),
        role: UserRole.MANAGER
      },
      {
        _id: new mongoose.Types.ObjectId('000000000000000000000003'),
        name: 'Standard User',
        email: 'user@company.com',
        password: await bcrypt.hash('user123', salt),
        role: UserRole.USER
      }
    ];

    for (const userData of users) {
      await User.collection.insertOne(userData);
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Default users created successfully.');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};