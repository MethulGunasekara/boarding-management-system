const Room = require('../models/Room');
const BoardingPlace = require('../models/BoardingPlace');

/**
 * @desc    Add a room to a boarding place
 * @route   POST /boarding-places/:id/rooms
 * @access  Private/Owner
 */
const createRoom = async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;
    const boardingPlaceId = req.params.id;

    // Security Check: Ensure the boarding place exists AND belongs to the logged-in owner
    const boardingPlace = await BoardingPlace.findOne({
      _id: boardingPlaceId,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(404).json({ message: 'Boarding place not found or unauthorized' });
    }

    const room = await Room.create({
      boardingPlace: boardingPlaceId,
      roomNumber,
      capacity
    });

    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A room with this number already exists in this boarding place.'
      });
    }
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

/**
 * @desc    Get all rooms for a boarding place
 * @route   GET /boarding-places/:id/rooms
 * @access  Private/Owner
 */
const getRoomsForPlace = async (req, res) => {
  try {
    const boardingPlaceId = req.params.id;

    const boardingPlace = await BoardingPlace.findOne({
      _id: boardingPlaceId,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(404).json({ message: 'Boarding place not found or unauthorized' });
    }

    const rooms = await Room.find({ boardingPlace: boardingPlaceId }).sort({ roomNumber: 1 });

    // For each room, count active tenants
    const Tenant = require('../models/Tenant');
    const roomsWithCounts = await Promise.all(
      rooms.map(async (room) => {
        const activeTenants = await Tenant.countDocuments({
          room: room._id,
          status: 'ACTIVE'
        });
        return {
          ...room.toObject(),
          activeTenants,
          availableSpots: room.capacity - activeTenants
        };
      })
    );

    res.json(roomsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
  }
};

module.exports = { createRoom, getRoomsForPlace };
