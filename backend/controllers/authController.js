const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');

/**
 * @desc    Authenticate admin & get token
 * @route   POST /auth/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists and explicitly force the 'ADMIN' role
    const user = await User.findOne({ email, role: 'ADMIN' });

    // 2. Verify user exists AND the password matches (using the method we built in Step 2.1)
    if (user && (await user.matchPassword(password))) {
      
      // 3. Generate the JWT payload containing the user's ID
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' } // Token expires in 30 days
      );

      // 4. Send back the token and sanitized user data (NEVER send the password hash back)
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during authentication', error: error.message });
  }
};

/**
 * @desc    Authenticate owner & get token
 * @route   POST /auth/owner/login
 * @access  Public
 */
const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'OWNER' });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during authentication', error: error.message });
  }
};

/**
 * @desc    Authenticate tenant & get token (Web Portal)
 * @route   POST /auth/tenant/login
 * @access  Public
 */
const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the tenant by email
    const tenant = await Tenant.findOne({ 
      email, 
      status: 'ACTIVE' // Ensure evicted tenants cannot log in
    });

    // 2. Verify password using the method we just added to the model
    if (tenant && (await tenant.matchPassword(password))) {
      const token = jwt.sign(
        { id: tenant._id, role: 'TENANT' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' } 
      );

      res.json({
        _id: tenant._id,
        fullName: tenant.fullName,
        email: tenant.email,
        role: 'TENANT',
        token: token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during tenant authentication', error: error.message });
  }
};

module.exports = { loginAdmin, loginOwner, loginTenant };