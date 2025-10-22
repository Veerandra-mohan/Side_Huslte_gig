
// Middleware to check for a specific subscription plan
module.exports = (plan) => (req, res, next) => {
  if (req.user && req.user.subscription && req.user.subscription.plan === plan && req.user.subscription.status === 'active') {
    next();
  } else {
    res.status(403).json({ msg: `Access denied. Requires '${plan}' subscription.` });
  }
};
