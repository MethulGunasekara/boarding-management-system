const jwt              = require('jsonwebtoken');
const User             = require('../models/User');
const Tenant           = require('../models/Tenant');
const Plan             = require('../models/Plan');
const OwnerSubscription = require('../models/OwnerSubscription');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

/** POST /auth/login  — Admin login */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'ADMIN' });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ _id: user._id, fullName: user.fullName, email: user.email, role: user.role, token: generateToken(user._id, 'ADMIN') });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** POST /auth/owner/login  — Owner login */
const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'OWNER' }).populate('plan', 'name price maxBoardingPlaces maxRoomsPerPlace');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.ownerSubscriptionStatus === 'INACTIVE') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }
    res.json({
      _id: user._id, fullName: user.fullName, email: user.email, role: user.role,
      plan: user.plan, nextPaymentDue: user.nextPaymentDue,
      token: generateToken(user._id, 'OWNER'),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** POST /auth/owner/register  — Owner signup with plan */
const registerOwner = async (req, res) => {
  try {
    const { fullName, email, password, planId } = req.body;
    if (!fullName || !email || !password || !planId) {
      return res.status(400).json({ message: 'All fields including plan are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email is already registered' });

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) return res.status(400).json({ message: 'Invalid or inactive plan selected' });

    const planStartDate  = new Date();
    const nextPaymentDue = new Date();
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);

    const user = await User.create({
      fullName, email, password, role: 'OWNER',
      plan: plan._id, planStartDate, nextPaymentDue, ownerSubscriptionStatus: 'ACTIVE',
    });

    // Create first subscription record
    const monthKey  = `${planStartDate.getFullYear()}-${String(planStartDate.getMonth() + 1).padStart(2, '0')}`;
    const monthName = planStartDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    await OwnerSubscription.create({
      owner: user._id, monthName, monthKey, amountDue: plan.price,
      dueDate: nextPaymentDue, status: 'PENDING',
    });

    res.status(201).json({
      _id: user._id, fullName: user.fullName, email: user.email, role: user.role,
      plan: { _id: plan._id, name: plan.name, price: plan.price },
      nextPaymentDue,
      token: generateToken(user._id, 'OWNER'),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** POST /auth/tenant/login */
const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenant = await Tenant.findOne({ email }).populate('room', 'roomNumber').populate('boardingPlace', 'name');
    if (!tenant || !(await tenant.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: tenant._id, fullName: tenant.fullName, email: tenant.email, role: 'TENANT',
      room: tenant.room, boardingPlace: tenant.boardingPlace,
      token: generateToken(tenant._id, 'TENANT'),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** GET /admin/users — list all users (admin use) */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('plan', 'name');
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { loginAdmin, loginOwner, registerOwner, loginTenant, getAllUsers };