import User, { UserRole } from '../models/User.js';

export const seedUsers = async () => {
  try {
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Users already exist, skipping seeder.');
      return;
    }

    console.log('Seeding default users...');

    const users = [
      {
        id: 1,
        name: 'System Admin',
        email: 'admin@company.com',
        password: 'admin123', // hooks will auto-hash this
        role: UserRole.ADMIN
      },
      {
        id: 2,
        name: 'Procurement Manager',
        email: 'manager@company.com',
        password: 'manager123', // hooks will auto-hash this
        role: UserRole.MANAGER
      },
      {
        id: 3,
        name: 'Standard User',
        email: 'user@company.com',
        password: 'user123', // hooks will auto-hash this
        role: UserRole.USER
      }
    ];

    await User.bulkCreate(users);
    console.log('Default users created successfully.');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};