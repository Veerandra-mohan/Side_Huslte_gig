const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the user from the database to get the latest data, including subscription status
    req.user = await User.findById(decoded.user.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};