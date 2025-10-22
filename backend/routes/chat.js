
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// @route   GET api/chat/:user1/:user2
// @desc    Get chat history between two users
router.get('/:user1/:user2', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.user1, receiver: req.params.user2 },
        { sender: req.params.user2, receiver: req.params.user1 },
      ],
    }).sort({ createdAt: 'asc' });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
