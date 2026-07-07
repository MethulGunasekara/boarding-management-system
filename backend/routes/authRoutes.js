const express = require('express');
const router  = express.Router();
const {
  loginAdmin, loginOwner, googleAuth, tenantGoogleAuth,
  registerOwner, loginTenant, getAllUsers,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login',           loginAdmin);
router.post('/owner/login',     loginOwner);
router.post('/owner/register',  registerOwner);
router.post('/owner/google',    googleAuth);
router.post('/tenant/login',    loginTenant);
router.post('/tenant/google',   tenantGoogleAuth);
router.get('/users',            protect, authorize('ADMIN'), getAllUsers);

module.exports = router;