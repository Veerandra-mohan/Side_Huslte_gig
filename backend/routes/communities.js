
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const checkSubscription = require('../middleware/subscriptionMiddleware');
const Community = require('../models/Community');

// @route   POST api/communities
// @desc    Create a community
// @access  Private (Premium)
router.post('/', [auth, checkSubscription('premium')], async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCommunity = new Community({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id] // Creator is the first member
    });

    const community = await newCommunity.save();
    res.json(community);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/communities
// @desc    Get all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find().populate('createdBy', 'email').sort({ createdAt: -1 });
    res.json(communities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
