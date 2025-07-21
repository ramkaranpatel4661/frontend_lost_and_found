const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const makeUserAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get email from command line argument
    const email = process.argv[2];
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node makeUserAdmin.js user@example.com');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User successfully made admin!');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

makeUserAdmin();