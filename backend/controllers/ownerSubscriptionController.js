const User             = require('../models/User');
const Plan             = require('../models/Plan');
const OwnerSubscription = require('../models/OwnerSubscription');

// Helper: generate the next subscription record after a payment
const generateNextRecord = async (ownerId, paidRecord) => {
  const dueDate = new Date(paidRecord.dueDate);
  dueDate.setMonth(dueDate.getMonth() + 1);

  const monthKey  = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
  const monthName = dueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const owner = await User.findById(ownerId).populate('plan');
  if (!owner || !owner.plan) return;

  const exists = await OwnerSubscription.findOne({ owner: ownerId, monthKey });
  if (exists) return; // already generated

  await OwnerSubscription.create({
    owner: ownerId,
    monthName,
    monthKey,
    amountDue: owner.plan.price,
    dueDate,
    status: 'PENDING',
  });

  // Update nextPaymentDue on the User
  await User.findByIdAndUpdate(ownerId, { nextPaymentDue: dueDate });
};

/** GET /admin/owners — list all owners with plan + subscription status */
const getAllOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: 'OWNER' })
      .populate('plan', 'name price')
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach overdue flag
    const enriched = owners.map(o => ({
      ...o.toObject(),
      isPaymentOverdue: o.nextPaymentDue && new Date() > new Date(o.nextPaymentDue) && o.ownerSubscriptionStatus !== 'INACTIVE',
    }));

    res.json(enriched);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** GET /admin/owners/:id — owner detail + subscription history */
const getOwnerById = async (req, res) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'OWNER' })
      .populate('plan')
      .select('-password');
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    const subscriptions = await OwnerSubscription.find({ owner: owner._id }).sort({ monthKey: -1 });
    res.json({ owner, subscriptions });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** PATCH /admin/owners/:id/plan — change owner's plan */
const changeOwnerPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) return res.status(400).json({ message: 'Invalid plan' });

    const owner = await User.findByIdAndUpdate(
      req.params.id,
      { plan: planId },
      { new: true }
    ).populate('plan').select('-password');
    res.json(owner);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** PATCH /admin/owners/:id/status — activate / deactivate account */
const setOwnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'OVERDUE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const owner = await User.findByIdAndUpdate(
      req.params.id,
      { ownerSubscriptionStatus: status },
      { new: true }
    ).select('-password');
    res.json(owner);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** PATCH /admin/owner-subscriptions/:id/pay — mark a subscription record as paid */
const markSubscriptionPaid = async (req, res) => {
  try {
    const record = await OwnerSubscription.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Subscription record not found' });

    record.status = 'PAID';
    record.paidOn = new Date();
    await record.save();

    // Auto-generate next period's record
    await generateNextRecord(record.owner, record);

    // Update owner subscription status to ACTIVE if it was OVERDUE
    await User.findByIdAndUpdate(record.owner, { ownerSubscriptionStatus: 'ACTIVE' });

    res.json(record);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** POST /admin/owner-subscriptions/:ownerId/generate — manually generate next month */
const generateSubscriptionRecord = async (req, res) => {
  try {
    const owner = await User.findById(req.params.ownerId).populate('plan');
    if (!owner || !owner.plan) return res.status(400).json({ message: 'Owner has no plan' });

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

module.exports = {
  getAllOwners, getOwnerById, changeOwnerPlan, setOwnerStatus,
  markSubscriptionPaid, generateSubscriptionRecord,
};