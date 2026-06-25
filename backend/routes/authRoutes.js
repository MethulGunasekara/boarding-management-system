const express = require('express');
const router = express.Router();

const { loginAdmin, loginOwner, loginTenant, registerOwner } = require('../controllers/authController');

router.post('/login', loginAdmin);
router.post('/owner/login', loginOwner);
router.post('/tenant/login', loginTenant);
router.post('/owner/register', registerOwner);

module.exports = router;