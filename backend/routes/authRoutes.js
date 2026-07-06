const express = require('express');
const router  = express.Router();
const { loginAdmin, loginOwner, registerOwner, loginTenant, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login',           loginAdmin);
router.post('/owner/login',     loginOwner);
router.post('/owner/register',  registerOwner);
router.post('/tenant/login',    loginTenant);
router.get('/users',            protect, authorize('ADMIN'), getAllUsers);

module.exports = router;