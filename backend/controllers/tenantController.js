const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const BoardingPlace = require('../models/BoardingPlace');

/**
 * @desc    Admit a new tenant
 * @route   POST /tenants
 * @access  Private/Owner
 */
const admitTenant = async (req, res) => {
  try {
    // Destructure all the required fields from the frontend request
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
      signatureImageUrl
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

    // Note for interviews: You could also add a capacity check here 
    // e.g., Count current active tenants in this room and compare to room.capacity!

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
      idFrontImageUrl,     // Expecting secure Cloudinary URLs from the frontend
      idBackImageUrl,
      signatureImageUrl,
      status: 'ACTIVE'
    });

    res.status(201).json(tenant);
  } catch (error) {
    // 4. Gracefully handle duplicate NIC numbers (MongoDB duplicate key error)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A tenant with this NIC number already exists in the system.' });
    }
    res.status(500).json({ message: 'Failed to admit tenant', error: error.message });
  }
};

module.exports = { admitTenant };