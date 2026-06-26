const express = require('express');
const router = express.Router();

// Import our middleware and utilities
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /upload
 * @desc    Uploads a single image to Cloudinary and returns the secure URL
 * @access  Private/Owner
 */
// upload.single('image') tells Multer to look for a file attached to the key 'image'
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    // 1. Check if Multer successfully intercepted a file
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided for upload' });
    }

    // 2. Stream the file buffer from RAM directly to a Cloudinary folder named 'bms_tenants'
    const imageUrl = await uploadImage(req.file.buffer, 'bms_tenants');

    // 3. Return the generated secure URL to the frontend
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

module.exports = router;