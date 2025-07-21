const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authorization token missing or malformed'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UserNotFound',
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'AccessDenied',
        message: 'Admin access required'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'AuthMiddlewareError',
      message: 'Authentication failed: ' + error.message
    });
  }
};

module.exports = adminAuth;