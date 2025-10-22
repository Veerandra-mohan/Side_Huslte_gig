const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscription: {
    plan: {
      type: String,
      default: 'basic',
    },
    status: {
      type: String,
      default: 'inactive',
    },
  },
});

module.exports = mongoose.model('User', UserSchema);