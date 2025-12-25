const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Chat = require('../models/Chat');
const ContactMessage = require('../models/ContactMessage');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// @route   GET /api/admin/test
// @desc    Test admin route
// @access  Private (Admin only)
router.get('/test', adminAuth, async (req, res) => {
  try {
    res.json({ 
      message: 'Admin route working',
      user: req.user.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin test error:', error);
    res.status(500).json({ message: 'Server error in test route' });
  }
});

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
    const bannedUsers = await User.countDocuments({ isActive: false });
    const activeItems = await Item.countDocuments({ status: 'active' });

    // Get recent activity
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email createdAt');
    const recentItems = await Item.find().sort('-createdAt').limit(5).select('title type createdAt');
    const recentClaims = await Claim.find().sort('-createdAt').limit(5).populate('claimant', 'name').populate('item', 'title');

    res.json({
      stats: {
        totalUsers,
        totalItems,
        totalClaims,
        successfulReturns,
        pendingClaims,
        bannedUsers,
        activeItems
      },
      recentActivity: {
        users: recentUsers,
        items: recentItems,
        claims: recentClaims
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin only)
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    console.log('Analytics request:', { period, days, startDate });

    // User growth
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const totalUsers = await User.countDocuments();
    console.log('User stats:', { newUsers, totalUsers });

    // Item statistics
    const newItems = await Item.countDocuments({ createdAt: { $gte: startDate } });
    const itemsByType = await Item.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    console.log('Item stats:', { newItems, itemsByType });

    // Claim statistics
    const newClaims = await Claim.countDocuments({ createdAt: { $gte: startDate } });
    const totalClaims = await Claim.countDocuments();
    const claimsByStatus = await Claim.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('Claim stats:', { newClaims, totalClaims, claimsByStatus });

    // Success rate
    const totalResolved = await Claim.countDocuments({ status: 'resolved' });
    const totalApproved = await Claim.countDocuments({ status: 'approved' });
    const successRate = totalClaims > 0 ? ((totalResolved + totalApproved) / totalClaims * 100).toFixed(2) : 0;
    console.log('Success rate calculation:', { totalResolved, totalApproved, totalClaims, successRate });

    const response = {
      period,
      users: {
        new: newUsers,
        total: totalUsers,
        growth: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
      },
      items: {
        new: newItems,
        byType: itemsByType
      },
      claims: {
        new: newClaims,
        byStatus: claimsByStatus,
        successRate: parseFloat(successRate)
      }
    };

    console.log('Analytics response:', response);
    res.json(response);
  } catch (error) {
    console.error('Admin analytics error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and search
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isActive = false;

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

// @route   PUT /api/admin/users/:userId/promote
// @desc    Promote user to admin
// @access  Private (Admin only)
router.put('/users/:userId/promote', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ message: 'User promoted to admin successfully', user });
  } catch (error) {
    console.error('Admin promote user error:', error);
    res.status(500).json({ message: 'Server error promoting user' });
  }
});

// @route   PUT /api/admin/users/:userId/ban
// @desc    Ban user
// @access  Private (Admin only)
router.put('/users/:userId/ban', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot ban yourself' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    user.banReason = reason;
    user.bannedAt = new Date();
    user.bannedBy = req.user._id;
    await user.save();

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error('Admin ban user error:', error);
    res.status(500).json({ message: 'Server error banning user' });
  }
});

// @route   PUT /api/admin/users/:userId/unban
// @desc    Unban user
// @access  Private (Admin only)
router.put('/users/:userId/unban', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    user.banReason = undefined;
    user.bannedAt = undefined;
    user.bannedBy = undefined;
    await user.save();

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error('Admin unban user error:', error);
    res.status(500).json({ message: 'Server error unbanning user' });
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

// @route   PUT /api/admin/claims/:claimId/approve
// @desc    Approve claim
// @access  Private (Admin only)
router.put('/claims/:claimId/approve', adminAuth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { notes } = req.body;

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = 'approved';
    claim.adminNotes = notes;
    claim.approvedBy = req.user._id;
    claim.approvedAt = new Date();
    await claim.save();

    res.json({ message: 'Claim approved successfully', claim });
  } catch (error) {
    console.error('Admin approve claim error:', error);
    res.status(500).json({ message: 'Server error approving claim' });
  }
});

// @route   PUT /api/admin/claims/:claimId/reject
// @desc    Reject claim
// @access  Private (Admin only)
router.put('/claims/:claimId/reject', adminAuth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { reason } = req.body;

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = 'rejected';
    claim.rejectionReason = reason;
    claim.rejectedBy = req.user._id;
    claim.rejectedAt = new Date();
    await claim.save();

    res.json({ message: 'Claim rejected successfully', claim });
  } catch (error) {
    console.error('Admin reject claim error:', error);
    res.status(500).json({ message: 'Server error rejecting claim' });
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

// @route   GET /api/admin/system/stats
// @desc    Get system statistics
// @access  Private (Admin only)
router.get('/system/stats', adminAuth, async (req, res) => {
  try {
    const systemStats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };

    res.json(systemStats);
  } catch (error) {
    console.error('Admin system stats error:', error);
    res.status(500).json({ message: 'Server error fetching system stats' });
  }
});

// @route   GET /api/admin/export/:type
// @desc    Export data
// @access  Private (Admin only)
router.get('/export/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;

    let data;
    switch (type) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'items':
        data = await Item.find().populate('postedBy', 'name email');
        break;
      case 'claims':
        data = await Claim.find().populate('claimant', 'name email').populate('item', 'title');
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.json({ data, count: data.length });
    }
  } catch (error) {
    console.error('Admin export error:', error);
    res.status(500).json({ message: 'Server error exporting data' });
  }
});

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

// @route   POST /api/admin/system/clear-cache
// @desc    Clear system cache
// @access  Private (Admin only)
router.post('/system/clear-cache', adminAuth, async (req, res) => {
  try {
    // In a real application, you might clear Redis cache, file cache, etc.
    // For now, we'll just return a success message
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Admin clear cache error:', error);
    res.status(500).json({ message: 'Server error clearing cache' });
  }
});

// @route   GET /api/admin/logs
// @desc    Get admin logs
// @access  Private (Admin only)
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const { limit = 50, level, startDate, endDate } = req.query;
    
    // In a real application, you would query a logs collection or file
    // For now, we'll return mock logs
    const mockLogs = [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        level: 'info',
        message: 'User login successful',
        userId: 'mock-user-id',
        ip: '192.168.1.1'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        level: 'warn',
        message: 'Failed login attempt',
        userId: 'mock-user-id',
        ip: '192.168.1.1'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        level: 'info',
        message: 'New item posted',
        itemId: 'mock-item-id',
        userId: 'mock-user-id'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        level: 'info',
        message: 'Claim submitted',
        claimId: 'mock-claim-id',
        userId: 'mock-user-id'
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        error: 'Connection timeout after 30 seconds'
      }
    ];

    res.json({
      logs: mockLogs.slice(0, parseInt(limit)),
      total: mockLogs.length
    });
  } catch (error) {
    console.error('Admin get logs error:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
});

// @route   POST /api/admin/notifications/send
// @desc    Send notification to users
// @access  Private (Admin only)
router.post('/notifications/send', adminAuth, async (req, res) => {
  try {
    const { title, message, type, targetUsers } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // In a real application, you would:
    // 1. Save notification to database
    // 2. Send push notifications
    // 3. Send emails if needed
    // 4. Update user notification preferences

    res.json({ 
      message: 'Notification sent successfully',
      notification: {
        id: 'mock-notification-id',
        title,
        message,
        type,
        targetUsers,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin send notification error:', error);
    res.status(500).json({ message: 'Server error sending notification' });
  }
});

// @route   GET /api/admin/notifications
// @desc    Get sent notifications
// @access  Private (Admin only)
router.get('/notifications', adminAuth, async (req, res) => {
  try {
    // In a real application, you would query notifications from database
    const mockNotifications = [
      {
        id: 'mock-notification-1',
        title: 'System Maintenance',
        message: 'Scheduled maintenance on Sunday at 2 AM',
        type: 'system',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        readCount: 150,
        totalRecipients: 200
      },
      {
        id: 'mock-notification-2',
        title: 'New Feature Available',
        message: 'Check out our new chat feature!',
        type: 'feature',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        readCount: 89,
        totalRecipients: 200
      }
    ];

    res.json({ notifications: mockNotifications });
  } catch (error) {
    console.error('Admin get notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// @route   PUT /api/admin/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private (Admin only)
router.put('/notifications/:notificationId/read', adminAuth, async (req, res) => {
  try {
    const { notificationId } = req.params;

    // In a real application, you would update the notification read status
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Admin mark notification read error:', error);
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
});

// @route   POST /api/admin/items/bulk-delete
// @desc    Bulk delete items
// @access  Private (Admin only)
router.post('/items/bulk-delete', adminAuth, async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: 'Item IDs array is required' });
    }

    // Delete items and related data
    await Item.deleteMany({ _id: { $in: itemIds } });
    await Claim.deleteMany({ item: { $in: itemIds } });
    await Chat.deleteMany({ item: { $in: itemIds } });

    res.json({ 
      message: `${itemIds.length} items deleted successfully`,
      deletedCount: itemIds.length
    });
  } catch (error) {
    console.error('Admin bulk delete items error:', error);
    res.status(500).json({ message: 'Server error deleting items' });
  }
});

// @route   POST /api/admin/claims/bulk-approve
// @desc    Bulk approve claims
// @access  Private (Admin only)
router.post('/claims/bulk-approve', adminAuth, async (req, res) => {
  try {
    const { claimIds } = req.body;

    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return res.status(400).json({ message: 'Claim IDs array is required' });
    }

    await Claim.updateMany(
      { _id: { $in: claimIds } },
      { 
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      }
    );

    res.json({ 
      message: `${claimIds.length} claims approved successfully`,
      approvedCount: claimIds.length
    });
  } catch (error) {
    console.error('Admin bulk approve claims error:', error);
    res.status(500).json({ message: 'Server error approving claims' });
  }
});

// @route   POST /api/admin/claims/bulk-reject
// @desc    Bulk reject claims
// @access  Private (Admin only)
router.post('/claims/bulk-reject', adminAuth, async (req, res) => {
  try {
    const { claimIds, reason } = req.body;

    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return res.status(400).json({ message: 'Claim IDs array is required' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    await Claim.updateMany(
      { _id: { $in: claimIds } },
      { 
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: req.user._id,
        rejectedAt: new Date()
      }
    );

    res.json({ 
      message: `${claimIds.length} claims rejected successfully`,
      rejectedCount: claimIds.length
    });
  } catch (error) {
    console.error('Admin bulk reject claims error:', error);
    res.status(500).json({ message: 'Server error rejecting claims' });
  }
});

// @route   GET /api/admin/reports/:type
// @desc    Generate reports
// @access  Private (Admin only)
router.get('/reports/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    let reportData;
    switch (type) {
      case 'user-activity':
        reportData = await generateUserActivityReport(startDate, endDate);
        break;
      case 'item-statistics':
        reportData = await generateItemStatisticsReport(startDate, endDate);
        break;
      case 'claim-analysis':
        reportData = await generateClaimAnalysisReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report-${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.json({ data: reportData, type, generatedAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Admin generate report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// Helper functions for reports
const generateUserActivityReport = async (startDate, endDate) => {
  const query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const users = await User.find(query).select('name email createdAt lastLoginAt');
  return users.map(user => ({
    name: user.name,
    email: user.email,
    joinedDate: user.createdAt,
    lastLogin: user.lastLoginAt || 'Never'
  }));
};

const generateItemStatisticsReport = async (startDate, endDate) => {
  const query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const items = await Item.find(query).populate('postedBy', 'name');
  const stats = {
    total: items.length,
    byType: {},
    byCategory: {},
    byStatus: {}
  };

  items.forEach(item => {
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
  });

  return stats;
};

const generateClaimAnalysisReport = async (startDate, endDate) => {
  const query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const claims = await Claim.find(query).populate('claimant', 'name').populate('item', 'title');
  const stats = {
    total: claims.length,
    byStatus: {},
    successRate: 0,
    averageProcessingTime: 0
  };

  claims.forEach(claim => {
    stats.byStatus[claim.status] = (stats.byStatus[claim.status] || 0) + 1;
  });

  const resolvedClaims = stats.byStatus.resolved || 0;
  const approvedClaims = stats.byStatus.approved || 0;
  stats.successRate = claims.length > 0 ? ((resolvedClaims + approvedClaims) / claims.length * 100).toFixed(2) : 0;

  return stats;
};

// @route   GET /api/admin/contact-messages
// @desc    Get all user contact messages
// @access  Private (Admin only)
router.get('/contact-messages', adminAuth, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort('-createdAt');
    res.json({ messages });
  } catch (error) {
    console.error('Admin get contact messages error:', error);
    res.status(500).json({ message: 'Server error fetching contact messages' });
  }
});

module.exports = router;