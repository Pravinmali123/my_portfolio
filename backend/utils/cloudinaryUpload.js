import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

/**
 * Uploads an in-memory file buffer (from multer's memoryStorage) to
 * Cloudinary and resolves with the upload result (public_id, secure_url,
 * etc). We use memoryStorage + this stream upload instead of multer's
 * diskStorage specifically so nothing ever touches the server's local
 * disk — on a serverless/ephemeral host that disk gets wiped on every
 * redeploy/restart, which is why uploaded images/videos/resumes used to
 * disappear.
 */
export const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

/**
 * Best-effort delete of a previously-uploaded Cloudinary asset. Never
 * throws — a failed cleanup shouldn't block the admin's request.
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete skipped:', error.message);
  }
};

/**
 * Builds a delivery URL with Cloudinary's own on-the-fly resizing +
 * compression (replaces the old sharp-based optimizeImageFile step, which
 * needed a real file path on disk and no longer has one).
 */
export const optimizedImageUrl = (publicId, { maxWidth = 1600, quality = 'auto:good' } = {}) =>
  cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: maxWidth, crop: 'limit' },
      { quality },
      { fetch_format: 'auto' },
    ],
  });