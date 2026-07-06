const Plan = require('../models/Plan');

/** GET /plans — public, returns active plans only */
const getActivePlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.json(plans);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** GET /admin/plans — admin, returns all plans */
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** POST /admin/plans */
const createPlan = async (req, res) => {
  try {
    const { name, price, maxBoardingPlaces, maxRoomsPerPlace, features } = req.body;
    const plan = await Plan.create({ name, price, maxBoardingPlaces, maxRoomsPerPlace, features: features || [] });
    res.status(201).json(plan);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** PUT /admin/plans/:id */
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/** DELETE /admin/plans/:id — soft delete (deactivate) */
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deactivated', plan });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getActivePlans, getAllPlans, createPlan, updatePlan, deletePlan };