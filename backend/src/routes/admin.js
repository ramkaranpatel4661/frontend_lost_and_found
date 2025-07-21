const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Chat = require('../models/Chat');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalClaims = await Claim.countDocuments();
    const successfulReturns = await Claim.countDocuments({ status: 'resolved' });
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });

    res.json({
      stats: {
        totalUsers,
        totalItems,
        totalClaims,
        successfulReturns,
        pendingClaims
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password -emailVerification.otp')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user account
// @access  Private (Admin only)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow admin to delete themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's items
    await Item.deleteMany({ postedBy: userId });
    
    // Delete user's claims
    await Claim.deleteMany({ claimant: userId });
    
    // Remove user from chats
    await Chat.updateMany(
      { participants: userId },
      { $pull: { participants: userId } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   GET /api/admin/claims
// @desc    Get all claims with full details
// @access  Private (Admin only)
router.get('/claims', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      // Search in item title or claimant name
      const users = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const items = await Item.find({
        title: { $regex: search, $options: 'i' }
      }).select('_id');

      query.$or = [
        { claimant: { $in: users.map(u => u._id) } },
        { item: { $in: items.map(i => i._id) } }
      ];
    }

    const claims = await Claim.find(query)
      .populate('claimant', 'name email')
      .populate('itemOwner', 'name email')
      .populate('item', 'title type imageUrls')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Claim.countDocuments(query);

    // Return full claim details including sensitive data for admin
    const fullClaims = claims.map(claim => {
      const claimObj = claim.toObject();
      // Admin can see full details
      return claimObj;
    });

    res.json({
      claims: fullClaims,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalClaims: total
      }
    });
  } catch (error) {
    console.error('Admin get claims error:', error);
    res.status(500).json({ message: 'Server error fetching claims' });
  }
});

// @route   GET /api/admin/claims/:claimId
// @desc    Get specific claim with full details including ID proof
// @access  Private (Admin only)
router.get('/claims/:claimId', adminAuth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId)
      .populate('claimant', 'name email phone')
      .populate('itemOwner', 'name email')
      .populate('item', 'title type imageUrls location description');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Return full claim details including sensitive data for admin
    res.json(claim.toObject());
  } catch (error) {
    console.error('Admin get claim error:', error);
    res.status(500).json({ message: 'Server error fetching claim' });
  }
});

// @route   GET /api/admin/items
// @desc    Get all items
// @access  Private (Admin only)
router.get('/items', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query)
      .populate('postedBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Admin get items error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

// @route   DELETE /api/admin/items/:itemId
// @desc    Delete item
// @access  Private (Admin only)
router.delete('/items/:itemId', adminAuth, async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete related claims
    await Claim.deleteMany({ item: itemId });
    
    // Delete related chats
    await Chat.deleteMany({ item: itemId });

    // Delete the item
    await Item.findByIdAndDelete(itemId);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Admin delete item error:', error);
    res.status(500).json({ message: 'Server error deleting item' });
  }
});

module.exports = router;