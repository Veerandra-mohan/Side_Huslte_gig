const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: { // Denormalizing user name for easier display
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: [String],
  price: {
    type: Number,
    required: true,
  },
  unit: String,
  community: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Gig', GigSchema);