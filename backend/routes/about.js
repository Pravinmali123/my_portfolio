import express from 'express';
import { getAbout, updateAbout, uploadProfileImage } from '../controllers/aboutController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateAbout, handleValidationErrors } from '../middleware/validation.js';
import multer from 'multer';

const router = express.Router();

// In-memory only — streamed straight to Cloudinary in the controller so
// the profile photo survives redeploys (see controllers/aboutController.js).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Public routes
router.get('/', getAbout);

// Protected routes (admin only)
router.put('/', verifyToken, isAdmin, validateAbout, handleValidationErrors, updateAbout);
router.post('/upload-image', verifyToken, isAdmin, upload.single('image'), uploadProfileImage);

export default router;