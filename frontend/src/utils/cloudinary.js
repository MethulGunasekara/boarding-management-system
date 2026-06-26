const cloudinary = require('cloudinary').v2;

// Note: Cloudinary v2 automatically configures itself as long as you 
// have exactly "CLOUDINARY_URL" defined in your .env file!

/**
 * Streams a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from Multer's memory storage
 * @param {String} folder - The destination folder in Cloudinary (e.g., 'bms/nic-cards')
 * @returns {Promise<String>} - Returns the secure URL of the uploaded image
 */
const uploadImage = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        // Return the secure (https) URL provided by Cloudinary
        resolve(result.secure_url);
      }
    );
    
    // Write the Multer memory buffer to the stream and trigger the upload
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadImage };