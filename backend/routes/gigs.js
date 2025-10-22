const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Gig = require('../models/Gig');

// @route   POST api/gigs
// @desc    Create a gig
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, tags, price, unit, community } = req.body;

  try {
    const newGig = new Gig({
      title,
      description,
      tags,
      price,
      unit,
      community,
      user: req.user.id,
      userName: req.user.name,
    });

    const gig = await newGig.save();
    res.json(gig);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/gigs
// @desc    Get all gigs, optionally filtered by community
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { community } = req.query;
    const filter = community ? { community } : {};
    const gigs = await Gig.find(filter).sort({ createdAt: -1 });
    res.json(gigs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;