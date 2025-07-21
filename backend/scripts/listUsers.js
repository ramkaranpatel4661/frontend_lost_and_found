const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const listUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('name email role createdAt emailVerification.isVerified');
    
    console.log('\n📋 All Users:');
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.emailVerification?.isVerified ? 'Yes' : 'No'}`);
        console.log(`   Joined: ${user.createdAt.toLocaleDateString()}`);
        console.log('-'.repeat(40));
      });
    }

  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

listUsers();