const User             = require('../models/User');
const Plan             = require('../models/Plan');
const OwnerSubscription = require('../models/OwnerSubscription');
const BoardingPlace    = require('../models/BoardingPlace');
const Room             = require('../models/Room');
const Tenant           = require('../models/Tenant');
const ChargeLine       = require('../models/ChargeLine');
const Payment          = require('../models/Payment');
const Deposit          = require('../models/Deposit');
const RentRecord       = require('../models/RentRecord');
const Cost             = require('../models/Cost');
const NotificationLog  = require('../models/NotificationLog');
const { deleteImages } = require('../utils/cloudinary');

// ── Helper: generate next subscription record ──────────────────────────
const generateNextRecord = async (ownerId, paidRecord) => {
  const dueDate = new Date(paidRecord.dueDate);
  dueDate.setMonth(dueDate.getMonth() + 1);

  const monthKey  = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
  const monthName = dueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const owner = await User.findById(ownerId).populate('plan');
  if (!owner?.plan) return;

  const exists = await OwnerSubscription.findOne({ owner: ownerId, monthKey });
  if (exists) return;

  await OwnerSubscription.create({
    owner: ownerId, monthName, monthKey,
    amountDue: owner.plan.price, dueDate, status: 'PENDING',
  });

  await User.findByIdAndUpdate(ownerId, { nextPaymentDue: dueDate });
};

// ── GET /admin/owners ──────────────────────────────────────────────────
const getAllOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: 'OWNER' })
      .populate('plan', 'name price')
      .select('-password')
      .sort({ createdAt: -1 });

    const enriched = owners.map(o => ({
      ...o.toObject(),
      isPaymentOverdue:
        o.nextPaymentDue &&
        new Date() > new Date(o.nextPaymentDue) &&
        o.ownerSubscriptionStatus !== 'INACTIVE',
    }));

    res.json(enriched);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── GET /admin/owners/:id ──────────────────────────────────────────────
const getOwnerById = async (req, res) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'OWNER' })
      .populate('plan')
      .select('-password');
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    const subscriptions = await OwnerSubscription.find({ owner: owner._id })
      .sort({ monthKey: -1 });

    res.json({ owner, subscriptions });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── PATCH /admin/owners/:id/plan ───────────────────────────────────────
const changeOwnerPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan?.isActive) return res.status(400).json({ message: 'Invalid plan' });

    const owner = await User.findByIdAndUpdate(
      req.params.id, { plan: planId }, { new: true }
    ).populate('plan').select('-password');

    res.json(owner);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── PATCH /admin/owners/:id/status ─────────────────────────────────────
const setOwnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'OVERDUE'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const owner = await User.findByIdAndUpdate(
      req.params.id, { ownerSubscriptionStatus: status }, { new: true }
    ).select('-password');

    res.json(owner);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── PATCH /admin/owner-subscriptions/:id/pay ───────────────────────────
const markSubscriptionPaid = async (req, res) => {
  try {
    const record = await OwnerSubscription.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Subscription record not found' });

    record.status = 'PAID';
    record.paidOn = new Date();
    await record.save();

    await generateNextRecord(record.owner, record);
    await User.findByIdAndUpdate(record.owner, { ownerSubscriptionStatus: 'ACTIVE' });

    res.json(record);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── POST /admin/owner-subscriptions/:ownerId/generate ──────────────────
const generateSubscriptionRecord = async (req, res) => {
  try {
    const owner = await User.findById(req.params.ownerId).populate('plan');
    if (!owner?.plan) return res.status(400).json({ message: 'Owner has no plan' });

    const dueDate   = owner.nextPaymentDue || new Date();
    const monthKey  = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
    const monthName = dueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const record = await OwnerSubscription.findOneAndUpdate(
      { owner: owner._id, monthKey },
      { owner: owner._id, monthName, monthKey, amountDue: owner.plan.price, dueDate, status: 'PENDING' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(record);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── DELETE /admin/owners/:id  — full cascade delete ────────────────────
const deleteOwner = async (req, res) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'OWNER' });
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    // 1. Find all boarding places this owner has
    const boardingPlaces = await BoardingPlace.find({ owner: owner._id });
    const bpIds          = boardingPlaces.map(bp => bp._id);

    // 2. Find all tenants across those boarding places
    const tenants  = await Tenant.find({ boardingPlace: { $in: bpIds } });
    const tenantIds = tenants.map(t => t._id);

    // 3. Delete all Cloudinary assets for every tenant
    const cloudinaryUrls = tenants.flatMap(t => [
      t.idFrontImageUrl,
      t.idBackImageUrl,
      t.signatureImageUrl,
    ]);
    await deleteImages(cloudinaryUrls);

    // 4. Cascade delete all tenant-related DB records
    await ChargeLine.deleteMany({ tenant: { $in: tenantIds } });
    await Payment.deleteMany({ tenant: { $in: tenantIds } });
    await Deposit.deleteMany({ tenant: { $in: tenantIds } });
    await RentRecord.deleteMany({ tenant: { $in: tenantIds } });
    await Tenant.deleteMany({ boardingPlace: { $in: bpIds } });

    // 5. Delete all boarding-place-related DB records
    const roomIds = (await Room.find({ boardingPlace: { $in: bpIds } })).map(r => r._id);
    await Room.deleteMany({ _id: { $in: roomIds } });
    await Cost.deleteMany({ boardingPlaceId: { $in: bpIds } });
    await BoardingPlace.deleteMany({ _id: { $in: bpIds } });

    // 6. Delete owner's subscription records and notifications
    await OwnerSubscription.deleteMany({ owner: owner._id });
    await NotificationLog.deleteMany({ relatedId: owner._id });

    // 7. Delete the owner account itself
    await User.findByIdAndDelete(owner._id);

    res.json({
      message: `Owner "${owner.fullName}" and all associated data deleted successfully.`,
      deleted: {
        boardingPlaces: bpIds.length,
        tenants:        tenantIds.length,
        cloudinaryAssets: cloudinaryUrls.filter(Boolean).length,
      },
    });
  } catch (e) {
    console.error('Delete owner error:', e.message);
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getAllOwners, getOwnerById, changeOwnerPlan, setOwnerStatus,
  markSubscriptionPaid, generateSubscriptionRecord, deleteOwner,
};