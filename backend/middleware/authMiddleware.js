const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Protect routes: Verifies the token and attaches the user to the request
const protect = async (req, res, next) => {
  let token;

  // Tokens are typically sent in the headers as: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the DB and attach to req object (excluding the password hash!)
      req.user = await User.findById(decoded.id).select('-password');
      
      next(); // Move on to the next middleware or controller
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 2. Authorize roles: Ensures the logged-in user has the correct permissions
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user was set by the 'protect' middleware right before this ran
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: User role ${req.user.role} cannot access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };