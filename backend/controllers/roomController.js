const Room          = require('../models/Room');
const BoardingPlace = require('../models/BoardingPlace');
const Tenant        = require('../models/Tenant');
const User          = require('../models/User');

const createRoom = async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;
    const boardingPlaceId = req.params.id;

    const boardingPlace = await BoardingPlace.findOne({ _id: boardingPlaceId, owner: req.user._id });
    if (!boardingPlace) return res.status(404).json({ message: 'Boarding place not found or unauthorized' });

    // Plan room-limit enforcement
    const owner = await User.findById(req.user._id).populate('plan');
    if (owner.plan) {
      const roomCount = await Room.countDocuments({ boardingPlace: boardingPlaceId });
      if (roomCount >= owner.plan.maxRoomsPerPlace) {
        return res.status(403).json({
          message: `Your plan (${owner.plan.name}) allows a maximum of ${owner.plan.maxRoomsPerPlace} room(s) per property.`,
        });
      }
    }

    const room = await Room.create({ boardingPlace: boardingPlaceId, roomNumber, capacity });
    res.status(201).json(room);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: 'A room with this number already exists here.' });
    res.status(500).json({ message: e.message });
  }
};

const getRoomsForPlace = async (req, res) => {
  try {
    const boardingPlaceId = req.params.id;
    const bp = await BoardingPlace.findOne({ _id: boardingPlaceId, owner: req.user._id });
    if (!bp) return res.status(404).json({ message: 'Not found or unauthorized' });

    const rooms = await Room.find({ boardingPlace: boardingPlaceId });
    const enriched = await Promise.all(rooms.map(async room => {
      const activeTenants = await Tenant.countDocuments({ room: room._id, status: 'ACTIVE' });
      return { ...room.toObject(), activeTenants, availableSpots: room.capacity - activeTenants };
    }));
    res.json(enriched);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { createRoom, getRoomsForPlace };