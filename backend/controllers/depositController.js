const Deposit = require('../models/Deposit');
const Tenant = require('../models/Tenant');
const BoardingPlace = require('../models/BoardingPlace');

/**
 * @desc    Record a key money (security deposit) for a tenant
 * @route   POST /deposits
 * @access  Private/Owner
 */
const createDeposit = async (req, res) => {
  try {
    const { tenantId, amount, minimumStayMonths } = req.body;

    // 1. Find tenant and verify ownership
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const boardingPlace = await BoardingPlace.findOne({
      _id: tenant.boardingPlace,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden: This tenant does not belong to your boarding place' });
    }

    // 2. Calculate the refund eligible date based on admission date + minimum stay
    // Rolling from admission date (not calendar month), as per business rule
    const refundEligibleDate = new Date(tenant.admissionDate);
    refundEligibleDate.setMonth(refundEligibleDate.getMonth() + Number(minimumStayMonths));

    // 3. Check if a deposit already exists for this tenant
    const existingDeposit = await Deposit.findOne({ tenant: tenantId });
    if (existingDeposit) {
      return res.status(400).json({ message: 'A key money deposit already exists for this tenant. Update or view it instead.' });
    }

    const deposit = await Deposit.create({
      tenant: tenantId,
      amount,
      minimumStayMonths,
      refundEligibleDate,
      status: 'HELD'
    });

    res.status(201).json(deposit);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record key money deposit', error: error.message });
  }
};

/**
 * @desc    Check key money refund eligibility for a tenant
 * @route   GET /deposits/:tenantId/eligibility
 * @access  Private/Owner
 */
const checkEligibility = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Security check
    const boardingPlace = await BoardingPlace.findOne({
      _id: tenant.boardingPlace,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const deposit = await Deposit.findOne({ tenant: tenantId });
    if (!deposit) {
      return res.status(404).json({ message: 'No key money deposit found for this tenant' });
    }

    const today = new Date();
    const isEligible = today >= new Date(deposit.refundEligibleDate);

    // Calculate months stayed (from admission date)
    const admissionDate = new Date(tenant.admissionDate);
    const monthsStayed = Math.floor((today - admissionDate) / (1000 * 60 * 60 * 24 * 30));

    res.json({
      deposit,
      isEligible,
      monthsStayed,
      minimumStayMonths: deposit.minimumStayMonths,
      refundEligibleDate: deposit.refundEligibleDate,
      message: isEligible
        ? `Tenant has stayed ${monthsStayed} months and is eligible for a refund. Final decision is yours.`
        : `Tenant has stayed ${monthsStayed} of ${deposit.minimumStayMonths} required months. Not yet eligible.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check eligibility', error: error.message });
  }
};

/**
 * @desc    Update deposit status (REFUNDED or FORFEITED)
 * @route   PATCH /deposits/:tenantId/status
 * @access  Private/Owner
 */
const updateDepositStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { status } = req.body;

    const validStatuses = ['HELD', 'REFUNDED', 'FORFEITED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be HELD, REFUNDED, or FORFEITED.' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const boardingPlace = await BoardingPlace.findOne({
      _id: tenant.boardingPlace,
      owner: req.user._id
    });
    if (!boardingPlace) return res.status(403).json({ message: 'Forbidden' });

    const deposit = await Deposit.findOneAndUpdate(
      { tenant: tenantId },
      { status },
      { new: true }
    );

    if (!deposit) return res.status(404).json({ message: 'No deposit found' });

    res.json(deposit);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update deposit status', error: error.message });
  }
};

/**
 * @desc    Get deposit for a tenant
 * @route   GET /deposits/:tenantId
 * @access  Private/Owner
 */
const getDepositForTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const boardingPlace = await BoardingPlace.findOne({
      _id: tenant.boardingPlace,
      owner: req.user._id
    });
    if (!boardingPlace) return res.status(403).json({ message: 'Forbidden' });

    const deposit = await Deposit.findOne({ tenant: tenantId });
    if (!deposit) return res.status(404).json({ message: 'No deposit found for this tenant' });

    res.json(deposit);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch deposit', error: error.message });
  }
};

module.exports = { createDeposit, checkEligibility, updateDepositStatus, getDepositForTenant };
