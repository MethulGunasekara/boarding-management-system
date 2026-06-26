const express = require('express');
const router = express.Router();

const { loginAdmin, loginOwner, loginTenant, registerOwner, registerTenant } = require('../controllers/authController');

router.post('/login', loginAdmin);
router.post('/owner/login', loginOwner);
router.post('/tenant/login', loginTenant);
router.post('/owner/register', registerOwner);
router.post('/tenant/register', registerTenant);

module.exports = router;