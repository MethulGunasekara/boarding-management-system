const cloudinary = require('cloudinary').v2;

/**
 * Upload a buffer directly to Cloudinary.
 */
const uploadImage = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * Extract the Cloudinary public_id from a secure_url.
 * e.g. https://res.cloudinary.com/demo/image/upload/v123/bms/nic-cards/abc123.jpg
 * → bms/nic-cards/abc123
 */
const extractPublicId = (url) => {
  if (!url) return null;
  try {
    // Find the upload/ segment and take everything after it, strip version if present
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

/**
 * Delete a single image from Cloudinary by its URL.
 * Non-fatal — logs but does not throw.
 */
const deleteImage = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Cloudinary delete failed for ${publicId}:`, err.message);
  }
};

/**
 * Delete multiple images concurrently. Ignores empty/null URLs.
 */
const deleteImages = async (urls = []) => {
  const valid = urls.filter(Boolean);
  if (!valid.length) return;
  await Promise.all(valid.map(deleteImage));
};

module.exports = { uploadImage, deleteImage, deleteImages };