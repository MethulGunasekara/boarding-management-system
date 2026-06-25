const BoardingPlace = require('../models/BoardingPlace');
const User = require('../models/User'); // We need this to verify the owner exists

/**
 * @desc    Create a new boarding place & assign to an owner
 * @route   POST /admin/boarding-places
 * @access  Private/Admin
 */
const createBoardingPlace = async (req, res) => {
  try {
    const { ownerId, name, address, subscriptionMonths } = req.body;

    // 1. Verify the assigned user actually exists and is an OWNER
    const owner = await User.findOne({ _id: ownerId, role: 'OWNER' });
    if (!owner) {
      return res.status(404).json({ message: 'Valid boarding owner not found' });
    }

    // 2. Securely calculate the subscription renewal date on the server
    const renewalDate = new Date();
    // Default to a 1-month subscription if not specified
    renewalDate.setMonth(renewalDate.getMonth() + (subscriptionMonths || 1));

    // 3. Create the boarding place document
    const boardingPlace = await BoardingPlace.create({
      owner: owner._id,
      name,
      address,
      subscriptionStatus: 'ACTIVE',
      subscriptionRenewalDate: renewalDate
    });

    // 201 Created is the standard HTTP status code for successful POST creation
    res.status(201).json(boardingPlace);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create boarding place', error: error.message });
  }
};

/**
 * @desc    Toggle boarding place subscription status
 * @route   PATCH /admin/boarding-places/:id/subscription
 * @access  Private/Admin
 */
const toggleSubscription = async (req, res) => {
  try {
    const { status } = req.body; // Expected: 'ACTIVE', 'INACTIVE', or 'OVERDUE'
    const { id } = req.params;   // Extracted from the URL route parameters

    // 1. Manually validate the status before hitting the database
    const validStatuses = ['ACTIVE', 'INACTIVE', 'OVERDUE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid subscription status provided' });
    }

    // 2. Find the document by ID and update only the subscriptionStatus field
    const boardingPlace = await BoardingPlace.findByIdAndUpdate(
      id,
      { subscriptionStatus: status },
      { new: true, runValidators: true } // Returns the modified document instead of the original
    );

    if (!boardingPlace) {
      return res.status(404).json({ message: 'Boarding place not found' });
    }

    res.json(boardingPlace);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subscription', error: error.message });
  }
};

/**
 * @desc    Fetch platform-wide overdue boarding places
 * @route   GET /admin/overdue
 * @access  Private/Admin
 */
const getOverdueBoardingPlaces = async (req, res) => {
  try {
    // Find places that are explicitly overdue OR whose renewal date has already passed
    const overduePlaces = await BoardingPlace.find({
      $or: [               //-------->or operator
        { subscriptionStatus: 'OVERDUE' },
        { subscriptionRenewalDate: { $lt: new Date() } }  //-------->less than
      ]
    })
    .populate('owner', 'email') // Joins the User collection to get the owner's email
    .select('-createdAt -updatedAt'); // Excludes unnecessary fields to reduce payload size

    res.json(overduePlaces);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch overdue boarding places', error: error.message });
  }
};

/**
 * @desc    Fetch a specific boarding place for the owner
 * @route   GET /boarding-places/:id
 * @access  Private/Owner
 */
const getBoardingPlaceById = async (req, res) => {
  try {
    // Security check: Ensures the requested boarding place actually belongs to the logged-in owner
    const boardingPlace = await BoardingPlace.findOne({
      _id: req.params.id,
      owner: req.user._id 
    });

    if (!boardingPlace) {
      return res.status(404).json({ message: 'Boarding place not found or unauthorized access' });
    }

    // checking the subscriptionStatus
    // e.g., if (boardingPlace.subscriptionStatus === 'OVERDUE') { ... warn the user }

    res.json(boardingPlace);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch boarding place details', error: error.message });
  }
};

/**
 * @desc    Get boarding places for the logged-in owner
 * @route   GET /boarding-places/my-places
 * @access  Private/Owner
 */
const getOwnerBoardingPlaces = async (req, res) => {
  try {
    // req.user is populated by our JWT authentication middleware
    const places = await BoardingPlace.find({ owner: req.user._id });
    
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your properties', error: error.message });
  }
};

/**
 * @desc    Create a new boarding place (Owner self-serve)
 * @route   POST /boarding-places
 * @access  Private/Owner
 */
const ownerCreateBoardingPlace = async (req, res) => {
  try {
    const { name, address, capacity } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Please provide a name and address for the property' });
    }

    // 1. Calculate a default 1-month trial for self-registered properties
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    // 2. Include the required subscription fields to satisfy Mongoose
    const newPlace = await BoardingPlace.create({
      name,
      address,
      capacity: capacity || 0,
      owner: req.user._id,
      subscriptionStatus: 'ACTIVE', 
      subscriptionRenewalDate: renewalDate
    });

    res.status(201).json(newPlace);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating property', error: error.message });
  }
};

module.exports = { 
  createBoardingPlace, 
  ownerCreateBoardingPlace,
  toggleSubscription, 
  getOverdueBoardingPlaces,
  getBoardingPlaceById,
  getOwnerBoardingPlaces,
};




