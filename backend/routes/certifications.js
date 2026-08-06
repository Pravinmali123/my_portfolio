import express from 'express';
import multer from 'multer';
import {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
  uploadCertificationImage,
} from '../controllers/certificationController.js';
import { verifyToken, isAdmin, optionalAuth } from '../middleware/auth.js';
import { validateCertification, validateId, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// In-memory only — streamed straight to Cloudinary in the controller so
// certification images survive redeploys (see controllers/certificationController.js).
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB, matches the admin UI hint
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Public routes
router.get('/', optionalAuth, getCertifications);
router.get('/:id', optionalAuth, validateId, handleValidationErrors, getCertification);

// Protected routes (admin only)
router.post('/upload-image', verifyToken, isAdmin, uploadImage.single('image'), uploadCertificationImage);
router.post('/', verifyToken, isAdmin, validateCertification, handleValidationErrors, createCertification);
router.put('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, updateCertification);
router.delete('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, deleteCertification);

export default router;