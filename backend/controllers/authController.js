const jwt              = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User             = require('../models/User');
const Tenant           = require('../models/Tenant');
const Plan             = require('../models/Plan');
const OwnerSubscription = require('../models/OwnerSubscription');
const NotificationLog  = require('../models/NotificationLog');
const { sendEmail, welcomeOwnerEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Helpers ────────────────────────────────────────────────────────────────
const verifyGoogleToken = async (credential) => {
  const ticket = await googleClient.verifyIdToken({
    idToken:  credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload(); // { sub, email, name, picture }
};

const buildOwnerResponse = (user) => ({
  _id:      user._id,
  fullName: user.fullName,
  email:    user.email,
  phoneNumber: user.phoneNumber,
  role:     user.role,
  plan:     user.plan,
  nextPaymentDue: user.nextPaymentDue,
  token:    generateToken(user._id, user.role),
});

// ── Admin login ────────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'ADMIN' });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ _id: user._id, fullName: user.fullName, email: user.email, role: user.role, token: generateToken(user._id, 'ADMIN') });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Owner login ────────────────────────────────────────────────────────────
const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'OWNER' }).populate('plan', 'name price maxBoardingPlaces maxRoomsPerPlace');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (user.ownerSubscriptionStatus === 'INACTIVE')
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    res.json(buildOwnerResponse(user));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Google OAuth (Owner / Admin login or register) ─────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { credential, intent } = req.body;
    // intent: 'login' (login page) | 'register' (signup page)
    const payload = await verifyGoogleToken(credential);
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] }).populate('plan');

    if (!user) {
      if (intent !== 'register') {
        return res.status(404).json({ message: 'No owner account found for this Google account. Please sign up first.' });
      }
      // Auto-register without a plan — redirect to complete signup
      return res.status(200).json({
        requiresSignup: true,
        googleData: { googleId, email, name },
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Admins must use email and password login.' });
    }

    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    if (user.ownerSubscriptionStatus === 'INACTIVE')
      return res.status(403).json({ message: 'Your account has been deactivated.' });

    res.json(buildOwnerResponse(user));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Tenant Google OAuth ────────────────────────────────────────────────────
const tenantGoogleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const payload  = await verifyGoogleToken(credential);
    const { sub: googleId, email } = payload;

    const tenant = await Tenant.findOne({ $or: [{ googleId }, { email }] })
      .populate('room', 'roomNumber')
      .populate('boardingPlace', 'name');

    if (!tenant)
      return res.status(404).json({ message: 'No tenant account found for this Google email. Contact your boarding owner.' });

    if (!tenant.googleId) {
      tenant.googleId = googleId;
      await tenant.save();
    }

    res.json({
      _id: tenant._id, fullName: tenant.fullName, email: tenant.email, role: 'TENANT',
      room: tenant.room, boardingPlace: tenant.boardingPlace,
      token: generateToken(tenant._id, 'TENANT'),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Owner register ─────────────────────────────────────────────────────────
const registerOwner = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, planId, googleId } = req.body;

    if (!fullName || !email || !planId)
      return res.status(400).json({ message: 'Full name, email, and plan are required' });
    if (!password && !googleId)
      return res.status(400).json({ message: 'Password or Google account is required' });

    // Phone validation (optional at registration, but if provided must be valid)
    if (phoneNumber && !/^(\+94|0)[0-9]{9}$/.test(phoneNumber.trim()))
      return res.status(400).json({ message: 'Please provide a valid Sri Lankan phone number' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email is already registered' });

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) return res.status(400).json({ message: 'Invalid or inactive plan selected' });

    const planStartDate  = new Date();
    const nextPaymentDue = new Date();
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);

    const user = await User.create({
      fullName, email,
      ...(password && { password }),
      ...(googleId  && { googleId }),
      phoneNumber: phoneNumber || '',
      role: 'OWNER',
      plan: plan._id, planStartDate, nextPaymentDue, ownerSubscriptionStatus: 'ACTIVE',
    });

    // First subscription record
    const monthKey  = `${planStartDate.getFullYear()}-${String(planStartDate.getMonth() + 1).padStart(2, '0')}`;
    const monthName = planStartDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    await OwnerSubscription.create({
      owner: user._id, monthName, monthKey, amountDue: plan.price,
      dueDate: nextPaymentDue, status: 'PENDING',
    });

    // Admin notification
    await NotificationLog.create({
      type:      'REGISTRATION',
      channel:   'SYSTEM',
      message:   `New owner registered: ${fullName} (${email}) — Plan: ${plan.name}`,
      relatedId: user._id,
      isRead:    false,
    });

    // Welcome email (non-blocking)
    sendEmail(email, 'Welcome to Room Grid BMS system!', welcomeOwnerEmail(fullName, plan.name));

    const populated = await User.findById(user._id).populate('plan', 'name price maxBoardingPlaces maxRoomsPerPlace');
    res.status(201).json(buildOwnerResponse(populated));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Tenant login ───────────────────────────────────────────────────────────
const loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenant = await Tenant.findOne({ email })
      .populate('room', 'roomNumber')
      .populate('boardingPlace', 'name');
    if (!tenant || !(await tenant.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({
      _id: tenant._id, fullName: tenant.fullName, email: tenant.email, role: 'TENANT',
      room: tenant.room, boardingPlace: tenant.boardingPlace,
      token: generateToken(tenant._id, 'TENANT'),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Get all users (admin) ──────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('plan', 'name');
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = {
  loginAdmin, loginOwner, googleAuth, tenantGoogleAuth,
  registerOwner, loginTenant, getAllUsers,
};