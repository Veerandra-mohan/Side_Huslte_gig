const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

router.get('/:otherUserId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id, to: req.params.otherUserId },
        { from: req.params.otherUserId, to: req.user.id },
      ],
    }).sort({ createdAt: 'asc' });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;