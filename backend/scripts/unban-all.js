const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');

async function unbanAll() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const result = await User.updateMany(
            { isActive: false },
            { $set: { isActive: true, isOnline: false } }
        );

        console.log(`Unbanned ${result.modifiedCount} users.`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

unbanAll();
