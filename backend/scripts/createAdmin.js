const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com', // Change this to your email
      password: 'admin123456', // Change this to a secure password
      role: 'admin',
      emailVerification: {
        isVerified: true // Skip email verification for admin
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123456'); // Remember to change this
    console.log('Role:', adminUser.role);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser();