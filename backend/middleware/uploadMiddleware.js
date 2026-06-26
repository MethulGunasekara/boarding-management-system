const multer = require('multer');

// 1. Configure memory storage
// We keep the file in RAM (memory) as a Buffer so we can stream it directly to Cloudinary later.
const storage = multer.memoryStorage();

// 2. Initialize multer with size limits to prevent server memory crashes
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file to prevent malicious massive uploads
  },
  // Optional but recommended: Filter for images only
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;