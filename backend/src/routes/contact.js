const express = require('express');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }
    const contactMessage = new ContactMessage({ name, email, message });
    await contactMessage.save();
    res.status(201).json({ message: 'Your message has been sent. Our team will get back to you soon.' });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ message: 'Server error submitting message.' });
  }
});

module.exports = router;