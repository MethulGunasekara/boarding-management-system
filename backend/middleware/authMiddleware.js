const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant'); 

// Protect routes: Verifies the token and attaches the user/tenant to the request
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. Check the role from the token payload to query the correct model
      if (decoded.role === 'TENANT') {
        req.user = await Tenant.findById(decoded.id).select('-password');
        
        // 3. Ensure the 'role' property exists on req.user for the authorize check later
        // (Since your Tenant schema might not have an explicit 'role' field like User does)
        if (req.user) req.user.role = 'TENANT'; 
      } else {
        // Handles 'ADMIN' and 'OWNER'
        req.user = await User.findById(decoded.id).select('-password');
      }

      // 4. Safety catch: If the ID wasn't found in either collection, reject
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, account not found' });
      }
      
      next(); 
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Authorize roles: Ensures the logged-in user has the correct permissions
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user was successfully populated by 'protect'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: User role ${req.user.role} cannot access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };