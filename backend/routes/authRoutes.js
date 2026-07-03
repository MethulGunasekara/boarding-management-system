const express = require('express');
const router = express.Router();

const { loginAdmin, loginOwner, loginTenant, registerOwner } = require('../controllers/authController');

// Admin & Owner Routes
router.post('/login', loginAdmin);
router.post('/owner/login', loginOwner);
router.post('/owner/register', registerOwner);

// Tenant Routes
router.post('/tenant/login', loginTenant);

module.exports = router;