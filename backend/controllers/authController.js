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

/**
 * @desc    Register a new Property Owner
 * @route   POST /auth/owner/register
 * @access  Public
 */
const registerOwner = async (req, res) => {
  try {
    const { fullName, email, password, contactNumber } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Create the user. 
    // (Our pre-save hook in the User model will automatically hash the password!)
    const user = await User.create({
      fullName,
      email,
      password,
      contactNumber,
      role: 'OWNER' // Force the role to OWNER for this public route
    });

    if (user) {
      // 3. Immediately log them in by generating a token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * @desc    Register a new Tenant
 * @route   POST /auth/tenant/register
 * @access  Public
 */
const registerTenant = async (req, res) => {
  try {
    const { fullName, email, password, contactNumber } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Create the user, locking the role to TENANT
    const user = await User.create({
      fullName,
      email,
      password,
      contactNumber,
      role: 'TENANT' 
    });

    if (user) {
      // 3. Generate token and log them in
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during tenant registration', error: error.message });
  }
};

module.exports = { loginAdmin, loginOwner, loginTenant, registerOwner, registerTenant };


