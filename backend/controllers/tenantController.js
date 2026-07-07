const Tenant       = require('../models/Tenant');
const Room         = require('../models/Room');
const BoardingPlace = require('../models/BoardingPlace');
const ChargeLine   = require('../models/ChargeLine');

const admitTenant = async (req, res) => {
  try {
    const {
      boardingPlaceId, roomId, fullName, email, password,
      address, nicNumber, contactNumber, courseOrWorkplace,
      emergencyContactName, emergencyContactNumber,
      idFrontImageUrl, idBackImageUrl, signatureImageUrl,
      rentAmount,
    } = req.body;

    const boardingPlace = await BoardingPlace.findOne({ _id: boardingPlaceId, owner: req.user._id });
    if (!boardingPlace) return res.status(403).json({ message: 'Forbidden' });

    const room = await Room.findOne({ _id: roomId, boardingPlace: boardingPlaceId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const occupancy = await Tenant.countDocuments({ room: roomId, status: 'ACTIVE' });
    if (occupancy >= room.capacity)
      return res.status(400).json({ message: `Room ${room.roomNumber} is at full capacity` });

    const tenant = await Tenant.create({
      boardingPlace: boardingPlaceId, room: roomId, fullName, email, password,
      nicNumber, contactNumber,
      address: address || '', courseOrWorkplace: courseOrWorkplace || '',
      emergencyContact: {
        name:   emergencyContactName  || '',
        number: emergencyContactNumber || '',
      },
      idFrontImageUrl:   idFrontImageUrl   || '',
      idBackImageUrl:    idBackImageUrl    || '',
      signatureImageUrl: signatureImageUrl || '',
      rentAmount: Number(rentAmount),
      status: 'ACTIVE',
    });

    res.status(201).json(tenant);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: 'A tenant with this email or NIC already exists.' });
    if (e.name === 'ValidationError') return res.status(400).json({ message: Object.values(e.errors).map(v => v.message).join('; ') });
    res.status(500).json({ message: e.message });
  }
};

const getTenantsByBoardingPlace = async (req, res) => {
  try {
    const bp = await BoardingPlace.findOne({ _id: req.params.boardingPlaceId, owner: req.user._id });
    if (!bp) return res.status(403).json({ message: 'Forbidden' });
    const tenants = await Tenant.find({ boardingPlace: req.params.boardingPlaceId })
      .populate('room', 'roomNumber')
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(tenants);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('room', 'roomNumber capacity')
      .populate('boardingPlace', 'name owner');
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    if (tenant.boardingPlace.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    res.json(tenant);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Edit tenant profile
const editTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('boardingPlace', 'owner');
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    if (tenant.boardingPlace.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    const allowed = [
      'fullName', 'email', 'contactNumber', 'nicNumber', 'address',
      'courseOrWorkplace', 'emergencyContactName', 'emergencyContactNumber',
      'idFrontImageUrl', 'idBackImageUrl', 'signatureImageUrl', 'rentAmount', 'roomId',
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'emergencyContactName')   tenant.emergencyContact.name   = req.body[field];
        else if (field === 'emergencyContactNumber') tenant.emergencyContact.number = req.body[field];
        else if (field === 'roomId')            tenant.room = req.body[field];
        else if (field === 'rentAmount')        tenant.rentAmount = Number(req.body[field]);
        else                                    tenant[field] = req.body[field];
      }
    });

    await tenant.save();
    const updated = await Tenant.findById(tenant._id).populate('room', 'roomNumber').populate('boardingPlace', 'name owner');
    res.json(updated);
  } catch (e) {
    if (e.name === 'ValidationError') return res.status(400).json({ message: Object.values(e.errors).map(v => v.message).join('; ') });
    res.status(500).json({ message: e.message });
  }
};

const getTenantCharges = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('boardingPlace', 'owner');
    if (!tenant || tenant.boardingPlace.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    const charges = await ChargeLine.find({ tenant: req.params.id }).populate('costReference', 'title').sort({ dueDate: -1 });
    const totalDue = charges.filter(c => ['PENDING', 'OVERDUE'].includes(c.status)).reduce((s, c) => s + c.amountDue, 0);
    res.json({ totalDue, charges });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getOverdueTenants = async (req, res) => {
  try {
    const bp = await BoardingPlace.findOne({ _id: req.params.boardingPlaceId, owner: req.user._id });
    if (!bp) return res.status(403).json({ message: 'Forbidden' });
    const overdue = await ChargeLine.find({ status: { $in: ['PENDING', 'OVERDUE'] }, dueDate: { $lt: new Date() } })
      .populate({ path: 'tenant', match: { boardingPlace: req.params.boardingPlaceId, status: 'ACTIVE' }, populate: { path: 'room', select: 'roomNumber' }, select: '-password' });
    const map = {};
    overdue.forEach(ch => {
      if (!ch.tenant) return;
      const id = ch.tenant._id.toString();
      if (!map[id]) map[id] = { tenant: ch.tenant, totalOverdue: 0 };
      map[id].totalOverdue += ch.amountDue;
    });
    res.json(Object.values(map));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const moveTenantOut = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('boardingPlace', 'owner');
    if (!tenant || tenant.boardingPlace.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    tenant.status      = 'MOVED_OUT';
    tenant.movedOutDate = new Date();
    await tenant.save();
    await ChargeLine.updateMany({ tenant: tenant._id, status: 'PENDING' }, { status: 'VOID' });
    res.json({ message: 'Tenant marked as moved out', tenant });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = {
  admitTenant, getTenantsByBoardingPlace, getTenantById,
  editTenant, getTenantCharges, getOverdueTenants, moveTenantOut,
};