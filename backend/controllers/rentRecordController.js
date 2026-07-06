const RentRecord = require('../models/RentRecord');
const Tenant     = require('../models/Tenant');
const BoardingPlace = require('../models/BoardingPlace');

const verifyOwnerAccess = async (tenantId, ownerId) => {
  const tenant = await Tenant.findById(tenantId).populate('boardingPlace', 'owner');
  if (!tenant) throw new Error('Tenant not found');
  if (tenant.boardingPlace.owner.toString() !== ownerId.toString()) throw new Error('Forbidden');
  return tenant;
};

/** GET /rent-records/:tenantId */
const getRentRecords = async (req, res) => {
  try {
    await verifyOwnerAccess(req.params.tenantId, req.user._id);
    const records = await RentRecord.find({ tenant: req.params.tenantId }).sort({ monthKey: -1 });
    res.json(records);
  } catch (e) { res.status(e.message === 'Forbidden' ? 403 : 500).json({ message: e.message }); }
};

/** POST /rent-records — create a record (manual or pre-payment) */
const createRentRecord = async (req, res) => {
  try {
    const { tenantId, monthName, monthKey, amountDue, dueDate } = req.body;
    await verifyOwnerAccess(tenantId, req.user._id);

    const record = await RentRecord.findOneAndUpdate(
      { tenant: tenantId, monthKey },
      { tenant: tenantId, monthName, monthKey, amountDue, dueDate, status: 'PENDING' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(record);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: 'Record for this month already exists' });
    res.status(e.message === 'Forbidden' ? 403 : 500).json({ message: e.message });
  }
};

/** PATCH /rent-records/:id/pay */
const markRentPaid = async (req, res) => {
  try {
    const record = await RentRecord.findById(req.params.id).populate({
      path: 'tenant', populate: { path: 'boardingPlace', select: 'owner' },
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.tenant.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    record.status = 'PAID';
    record.paidOn = new Date();
    await record.save();

    // Auto-generate next month's record
    const nextDue = new Date(record.dueDate);
    nextDue.setMonth(nextDue.getMonth() + 1);
    const nextKey  = `${nextDue.getFullYear()}-${String(nextDue.getMonth() + 1).padStart(2, '0')}`;
    const nextName = nextDue.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const exists = await RentRecord.findOne({ tenant: record.tenant._id, monthKey: nextKey });
    if (!exists) {
      await RentRecord.create({
        tenant: record.tenant._id, monthName: nextName, monthKey: nextKey,
        amountDue: record.amountDue, dueDate: nextDue, status: 'PENDING',
      });
    }

    // Return updated record + the newly generated one
    const updated = await RentRecord.find({ tenant: record.tenant._id }).sort({ monthKey: -1 });
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getRentRecords, createRentRecord, markRentPaid };