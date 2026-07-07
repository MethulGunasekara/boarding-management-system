const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { uploadImage }      = require('../utils/cloudinary');

/**
 * POST /upload
 * Accessible by OWNER and TENANT (both need to upload files).
 * Owners upload tenant ID photos and signatures.
 * Tenants upload payment proof receipts.
 */
router.post('/', protect, uploadMiddleware.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Dynamic folder assignment based on user role
    const folder = req.user.role === 'TENANT' ? 'bms/payment-proofs' : 'bms/tenant-docs';
    const url    = await uploadImage(req.file.buffer, folder);

    res.json({ url });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
});

module.exports = router;