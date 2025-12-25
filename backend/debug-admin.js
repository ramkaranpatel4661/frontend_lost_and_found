const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Item = require('./src/models/Item');
const Claim = require('./src/models/Claim');

async function testAdminFunctionality() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test User model
    const userCount = await User.countDocuments();
    console.log('✅ User count:', userCount);

    // Test Item model
    const itemCount = await Item.countDocuments();
    console.log('✅ Item count:', itemCount);

    // Test Claim model
    const claimCount = await Claim.countDocuments();
    console.log('✅ Claim count:', claimCount);

    // Test analytics calculation
    const period = '30d';
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const totalUsers = await User.countDocuments();
    const newItems = await Item.countDocuments({ createdAt: { $gte: startDate } });
    const itemsByType = await Item.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const newClaims = await Claim.countDocuments({ createdAt: { $gte: startDate } });
    const totalClaims = await Claim.countDocuments();
    const claimsByStatus = await Claim.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('✅ Analytics calculation successful:');
    console.log('  - New users:', newUsers);
    console.log('  - Total users:', totalUsers);
    console.log('  - New items:', newItems);
    console.log('  - Items by type:', itemsByType);
    console.log('  - New claims:', newClaims);
    console.log('  - Total claims:', totalClaims);
    console.log('  - Claims by status:', claimsByStatus);

    // Test admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.name);
    } else {
      console.log('⚠️  No admin user found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testAdminFunctionality();