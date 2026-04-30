const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-__v');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Restrict to a specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ message: `Access denied. ${role} role required.` });
    }
  };
};

// Block unverified vendors from accessing protected routes
const requireVerified = (req, res, next) => {
  if (req.user && req.user.role === 'vendor' && !req.user.isVerified) {
    return res.status(403).json({
      message: 'Your account is pending verification. Please upload your Drug License and wait for admin approval.',
      verificationStatus: req.user.verificationStatus,
    });
  }
  next();
};

module.exports = { protect, requireRole, requireVerified };
