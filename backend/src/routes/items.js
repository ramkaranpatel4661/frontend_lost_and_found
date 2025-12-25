const express = require('express');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/items/stats
// @desc    Get items statistics (public)
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [totalItems, activeItems, resolvedItems] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'active' }),
      Item.countDocuments({ status: 'resolved' })
    ]);

    res.json({
      totalItems,
      activeItems,
      resolvedItems
    });
  } catch (error) {
    console.error('Error fetching items stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// @route   GET /api/items
// @desc    Get all items with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      location,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};
    
    // Handle special "returned" type filter
   if (type === 'returned') {
  query.status = 'resolved'; // for explicitly filtering returned
} else {
  // Include all statuses you want to display
  query.status = { $in: ['active', 'claimed', 'resolved'] }; // ✅ Add 'resolved' here
  if (type && ['found', 'lost'].includes(type)) {
    query.type = type;
  }
}

    if (category) {
      query.category = category;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      // Clean and escape the search term for regex
      const searchTerm = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Use regex for partial matching instead of $text search
      // Search across title, description, and category fields
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const items = await Item.find(query)
      .populate('postedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // --- OPTIMIZATION: Fix N+1 query problem ---
    // 1. Get all item IDs from the current page
    const itemIds = items.map(item => item._id);

    // 2. Fetch all relevant claims for these items in a single query
    const claims = await Claim.find({
      item: { $in: itemIds },
      status: { $in: ['approved', 'resolved'] }
    }).sort('-createdAt');

    // 3. Create a lookup map for quick access
    const claimStatusMap = claims.reduce((acc, claim) => {
      // Only store the most recent claim for each item
      if (!acc[claim.item]) {
        acc[claim.item] = claim.status;
      }
      return acc;
    }, {});

    // 4. Map claims to items efficiently
    const itemsWithClaimStatus = items.map(item => {
      const itemObj = item.toObject();
      itemObj.claimStatus = claimStatusMap[item._id.toString()];
      return itemObj;
    });
    // Get total count for pagination
    const total = await Item.countDocuments(query);

    res.json({
      items: itemsWithClaimStatus,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

// @route   GET /api/items/user/my-items
// @desc    Get current user's items
// @access  Private
router.get('/user/my-items', auth, async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = { postedBy: req.user._id };

    if (type && ['found', 'lost'].includes(type)) {
      query.type = type;
    }
    // Assuming you might add more statuses later
    if (status && ['active', 'resolved', 'claimed'].includes(status)) {
      query.status = status;
    }

    const items = await Item.find(query)
      .sort('-createdAt')
      .populate('postedBy', 'name email');

    res.json(items);
  } catch (error) {
    console.error('User items fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user items' });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email phone');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();
    
     const similarItems = await Item.find({
      _id:       { $ne: item._id },
      category:  item.category,
      type:      item.type,
      status:    'active'
    })
    .limit(4)
    .exec();

    res.json({ item,similarItems });
  } catch (error) {
    console.error('Item fetch error:', error);
    res.status(500).json({ message: 'Server error fetching item' });
  }
});

// @route   POST /api/items
// @desc    Post a lost or found item (generic)
// @access  Private
router.post('/', auth, upload.array('images', 5), handleUploadError, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      dateFound,
      dateLost,
      contactInfo,
      priority
    } = req.body;

    // Parse JSON fields if needed
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;

    const item = new Item({
      title,
      description,
      category,
      type,
      location: parsedLocation,
      dateFound,
      dateLost,
      contactInfo: parsedContactInfo,
      priority: priority || 'medium',
      postedBy: req.user._id,
    });

    await item.save();
    await item.populate('postedBy', 'name email');

    // Process uploaded images and create URLs
    if (req.files && req.files.length > 0) {
      item.imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      await item.save();
    }

    res.status(201).json({
      message: 'Item posted successfully',
      item
    });
  } catch (error) {
    console.error('Item post error:', error);
    res.status(500).json({ message: 'Server error posting item' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (only item owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const allowedUpdates = ['title', 'description', 'location', 'status', 'contactInfo', 'priority'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('Item update error:', error);
    res.status(500).json({ message: 'Server error updating item' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (only item owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Item delete error:', error);
    res.status(500).json({ message: 'Server error deleting item' });
  }
});

module.exports = router;