const Tenant = require('../models/Tenant');
const ChargeLine = require('../models/ChargeLine');

/**
 * @desc    Get logged-in tenant's profile and dashboard data
 * @route   GET /portal/dashboard
 * @access  Private/Tenant
 */
const getTenantDashboard = async (req, res) => {
  try {
    // 1. Fetch the tenant using the ID embedded in their JWT token
    const tenant = await Tenant.findById(req.user._id)
      .populate('boardingPlace', 'name address') // Pull in the boarding place name and address
      .populate('room', 'roomNumber');           // Pull in the specific room number

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant profile not found' });
    }

    // 2. Return the data to populate the app's home screen
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
};

/**
 * @desc    Get logged-in tenant's utility bills/charges
 * @route   GET /portal/bills
 * @access  Private/Tenant
 */
const getTenantBills = async (req, res) => {
  try {
    // Fetch all charge lines assigned to this specific tenant
    const bills = await ChargeLine.find({ tenant: req.user._id })
      .populate('costReference', 'title splitType frequency') // Get the name of the bill
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate a quick summary for the frontend
    const totalPending = bills
      .filter(bill => bill.status === 'PENDING')
      .reduce((acc, curr) => acc + curr.amountDue, 0);

    res.json({
      totalPending,
      bills
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bills', error: error.message });
  }
};

module.exports = { getTenantDashboard, getTenantBills };

//tenantController.js is for Owners managing tenants. 
//tenantPortalController.js is strictly for Tenants managing themselves.