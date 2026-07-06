const BoardingPlace    = require('../models/BoardingPlace');
const User             = require('../models/User');
const Plan             = require('../models/Plan');

const getAllBoardingPlaces = async (req, res) => {
  try {
    const places = await BoardingPlace.find().populate('owner', 'email fullName').sort({ createdAt: -1 });
    res.json(places);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createBoardingPlace = async (req, res) => {
  try {
    const { ownerId, name, address, subscriptionMonths } = req.body;
    const owner = await User.findOne({ _id: ownerId, role: 'OWNER' });
    if (!owner) return res.status(404).json({ message: 'Valid boarding owner not found' });

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + (subscriptionMonths || 1));

    const boardingPlace = await BoardingPlace.create({
      owner: owner._id, name, address,
      subscriptionStatus: 'ACTIVE', subscriptionRenewalDate: renewalDate,
    });
    res.status(201).json(boardingPlace);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getAllBoardingPlacesAdmin = async (req, res) => {
  try {
    const places = await BoardingPlace.find().populate('owner', 'email').sort({ createdAt: -1 });
    res.json(places);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const toggleSubscription = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'OVERDUE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid subscription status' });
    }
    const bp = await BoardingPlace.findByIdAndUpdate(req.params.id, { subscriptionStatus: status }, { new: true });
    if (!bp) return res.status(404).json({ message: 'Boarding place not found' });
    res.json(bp);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getOverdueBoardingPlaces = async (req, res) => {
  try {
    const places = await BoardingPlace.find({
      $or: [
        { subscriptionStatus: 'OVERDUE' },
        { subscriptionRenewalDate: { $lt: new Date() } },
      ],
    }).populate('owner', 'email');
    res.json(places);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getBoardingPlaceById = async (req, res) => {
  try {
    const bp = await BoardingPlace.findOne({ _id: req.params.id, owner: req.user._id });
    if (!bp) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json(bp);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getOwnerBoardingPlaces = async (req, res) => {
  try {
    const places = await BoardingPlace.find({ owner: req.user._id });
    res.json(places);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const ownerCreateBoardingPlace = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) return res.status(400).json({ message: 'Name and address are required' });

    // Plan limit enforcement
    const owner = await User.findById(req.user._id).populate('plan');
    if (owner.plan) {
      const count = await BoardingPlace.countDocuments({ owner: req.user._id });
      if (count >= owner.plan.maxBoardingPlaces) {
        return res.status(403).json({
          message: `Your current plan (${owner.plan.name}) allows a maximum of ${owner.plan.maxBoardingPlaces} boarding place(s). Please upgrade to add more.`,
        });
      }
    }

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const newPlace = await BoardingPlace.create({
      name, address, owner: req.user._id,
      subscriptionStatus: 'ACTIVE', subscriptionRenewalDate: renewalDate,
    });
    res.status(201).json(newPlace);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = {
  createBoardingPlace, getAllBoardingPlaces, getAllBoardingPlacesAdmin,
  toggleSubscription, getOverdueBoardingPlaces,
  getBoardingPlaceById, getOwnerBoardingPlaces, ownerCreateBoardingPlace,
};