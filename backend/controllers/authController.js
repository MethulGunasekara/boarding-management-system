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
    const user = await User.findOne({ email, role: 'ADMIN' });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ _id: user._id, email: user.email, role: user.role, token: token });
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
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ _id: user._id, email: user.email, role: user.role, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during authentication', error: error.message });
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

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      fullName, email, password, contactNumber, role: 'OWNER' 
    });

    if (user) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.status(201).json({ _id: user._id, fullName: user.fullName, email: user.email, role: user.role, token: token });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
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

    // 1. Find the tenant and POPULATE their boarding place and room info for the dashboard
    const tenant = await Tenant.findOne({ 
      email, 
      status: 'ACTIVE' 
    })
    .populate('boardingPlace', 'name')
    .populate('room', 'roomNumber');

    // 2. Verify password
    if (tenant && (await tenant.matchPassword(password))) {
      const token = jwt.sign(
        { id: tenant._id, role: 'TENANT' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' } 
      );

      // 3. Send back a rich payload for the frontend state
      res.json({
        _id: tenant._id,
        fullName: tenant.fullName,
        email: tenant.email,
        role: 'TENANT',
        boardingPlace: tenant.boardingPlace,
        room: tenant.room,
        token: token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during tenant authentication', error: error.message });
  }
};

module.exports = { loginAdmin, loginOwner, registerOwner, loginTenant };