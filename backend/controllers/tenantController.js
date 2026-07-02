const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const BoardingPlace = require('../models/BoardingPlace');
const ChargeLine = require('../models/ChargeLine');

/**
 * @desc    Admit a new tenant (full digital admission form)
 * @route   POST /tenants
 * @access  Private/Owner
 */
const admitTenant = async (req, res) => {
  try {
    const {
      boardingPlaceId,
      roomId,
      fullName,
      email,
      password,
      address,
      nicNumber,
      contactNumber,
      courseOrWorkplace,
      emergencyContactName,
      emergencyContactNumber,
      idFrontImageUrl,
      idBackImageUrl,
      signatureImageUrl,
      rentAmount
    } = req.body;

    // 1. Security Check: Verify the logged-in owner actually owns this boarding place
    const boardingPlace = await BoardingPlace.findOne({
      _id: boardingPlaceId,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden: You do not own this boarding place' });
    }

    // 2. Logic Check: Verify the room actually belongs to THIS boarding place
    const room = await Room.findOne({
      _id: roomId,
      boardingPlace: boardingPlaceId
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found in this boarding place' });
    }

    // Capacity check: count active tenants in this room
    const activeTenantsInRoom = await Tenant.countDocuments({
      room: roomId,
      status: 'ACTIVE'
    });

    if (activeTenantsInRoom >= room.capacity) {
      return res.status(400).json({
        message: `Room is at full capacity (${room.capacity} tenants). Please choose another room.`
      });
    }

    // 3. Create the tenant document
    const tenant = await Tenant.create({
      boardingPlace: boardingPlaceId,
      room: roomId,
      fullName,
      email,
      password,
      address,
      nicNumber,
      contactNumber,
      courseOrWorkplace,
      emergencyContact: {
        name: emergencyContactName,
        number: emergencyContactNumber
      },
      idFrontImageUrl,
      idBackImageUrl,
      signatureImageUrl,
      status: 'ACTIVE',
      monthlyRent: Number(rentAmount)
    });

    // 4. Generate the FIRST month's rent immediately
    // The Cron Job will handle all future months automatically.
    await ChargeLine.create({
      tenant: tenant._id,
      costReference: null, // Null because it's a direct rent charge, not a shared utility cost
      type: 'RENT',
      amountDue: Number(rentAmount),
      dueDate: new Date(), // Due immediately upon moving in
      status: 'PENDING'
    });

    res.status(201).json(tenant);
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate NIC or email
      const field = error.keyPattern?.nicNumber ? 'NIC number' : 'email';
      return res.status(400).json({ message: `A tenant with this ${field} already exists.` });
    }
    res.status(500).json({ message: 'Failed to admit tenant', error: error.message });
  }
};

/**
 * @desc    Get a single tenant's full profile
 * @route   GET /tenants/:id
 * @access  Private/Owner
 */
const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('room', 'roomNumber capacity')
      .populate('boardingPlace', 'name address owner');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Security: ensure the tenant belongs to an owner-controlled boarding place
    if (tenant.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Unauthorized access' });
    }

    // Remove the password from the response
    const tenantObj = tenant.toObject();
    delete tenantObj.password;

    res.json(tenantObj);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tenant', error: error.message });
  }
};

/**
 * @desc    Get all tenants for a specific boarding place
 * @route   GET /tenants/by-place/:boardingPlaceId
 * @access  Private/Owner
 */
const getTenantsByBoardingPlace = async (req, res) => {
  try {
    const { boardingPlaceId } = req.params;

    // Security check
    const boardingPlace = await BoardingPlace.findOne({
      _id: boardingPlaceId,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden: You do not own this boarding place' });
    }

    const tenants = await Tenant.find({ boardingPlace: boardingPlaceId })
      .populate('room', 'roomNumber')
      .select('-password')
      .sort({ status: 1, fullName: 1 }); // Active tenants first

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tenants', error: error.message });
  }
};

/**
 * @desc    Get all charge lines for a specific tenant
 * @route   GET /tenants/:id/charges
 * @access  Private/Owner
 */
const getTenantCharges = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('boardingPlace', 'owner');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const charges = await ChargeLine.find({ tenant: req.params.id })
      .populate('costReference', 'title')
      .sort({ dueDate: -1 });

    // Calculate total outstanding balance
    const totalDue = charges
      .filter(c => c.status === 'PENDING' || c.status === 'OVERDUE')
      .reduce((sum, c) => sum + c.amountDue, 0);

    res.json({ charges, totalDue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch charges', error: error.message });
  }
};

/**
 * @desc    Get overdue tenants for a boarding place
 * @route   GET /tenants/overdue/:boardingPlaceId
 * @access  Private/Owner
 */
const getOverdueTenants = async (req, res) => {
  try {
    const { boardingPlaceId } = req.params;

    const boardingPlace = await BoardingPlace.findOne({
      _id: boardingPlaceId,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Find all active tenants with at least one overdue or past-due-date charge
    const today = new Date();
    const overdueCharges = await ChargeLine.find({
      status: 'PENDING',
      dueDate: { $lt: today }
    }).distinct('tenant');

    const overdueTenants = await Tenant.find({
      boardingPlace: boardingPlaceId,
      status: 'ACTIVE',
      _id: { $in: overdueCharges }
    })
      .populate('room', 'roomNumber')
      .select('-password');

    res.json(overdueTenants);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch overdue tenants', error: error.message });
  }
};

/**
 * @desc    Mark a tenant as moved out
 * @route   PATCH /tenants/:id/move-out
 * @access  Private/Owner
 */
const moveTenantOut = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('boardingPlace', 'owner');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.boardingPlace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (tenant.status === 'MOVED_OUT') {
      return res.status(400).json({ message: 'Tenant has already moved out' });
    }

    tenant.status = 'MOVED_OUT';
    await tenant.save();

    // Also void any pending charges for this tenant
    await ChargeLine.updateMany(
      { tenant: tenant._id, status: 'PENDING' },
      { status: 'VOID' }
    );

    res.json({ message: 'Tenant successfully marked as moved out', tenant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process move-out', error: error.message });
  }
};

module.exports = {
  admitTenant,
  getTenantById,
  getTenantsByBoardingPlace,
  getTenantCharges,
  getOverdueTenants,
  moveTenantOut
};