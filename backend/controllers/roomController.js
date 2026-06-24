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
    const boardingPlaceId = req.params.id; // The ID of the boarding place from the URL

    // 1. Security Check: Ensure the boarding place exists AND belongs to the logged-in owner
    const boardingPlace = await BoardingPlace.findOne({
      _id: boardingPlaceId,
      owner: req.user._id
    });

    if (!boardingPlace) {
      return res.status(404).json({ message: 'Boarding place not found or unauthorized' });
    }

    // 2. Create the room linked to this specific boarding place
    const room = await Room.create({
      boardingPlace: boardingPlaceId,
      roomNumber,
      capacity
    });

    res.status(201).json(room);
  } catch (error) {
    // 3. Gracefully handle the MongoDB compound index violation (duplicate room)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A room with this number already exists in this boarding place.' 
      });
    }
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

module.exports = { createRoom };