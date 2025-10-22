
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   POST api/subscriptions/upgrade
// @desc    Upgrade user subscription
router.post('/upgrade', auth, async (req, res) => {
  const { plan } = req.body;

  if (!['basic', 'premium'].includes(plan)) {
    return res.status(400).json({ msg: 'Invalid plan specified.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.subscription.plan = plan;
    user.subscription.status = 'active';

    await user.save();

    res.json(user.subscription);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
