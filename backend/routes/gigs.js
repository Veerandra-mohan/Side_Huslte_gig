const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Gig = require('../models/Gig');

router.get('/', async (req, res) => {
  try {
    const gigs = await Gig.find().sort({ createdAt: -1 }).populate('user', 'name');
    res.json(gigs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, tags, price, unit } = req.body;
  try {
    const newGig = new Gig({ user: req.user.id, title, description, tags, price, unit });
    const gig = await newGig.save();
    res.status(201).json(gig);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;