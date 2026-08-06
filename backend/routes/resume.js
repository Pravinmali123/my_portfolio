import express from 'express';
import {
  getResumes,
  getPrimaryResume,
  downloadPrimaryResume,
  getResume,
  uploadResume,
  updateResume,
  deleteResume,
} from '../controllers/resumeController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, handleValidationErrors } from '../middleware/validation.js';
import multer from 'multer';

const router = express.Router();

// In-memory only — streamed straight to Cloudinary in the controller so
// the resume PDF survives redeploys (see controllers/resumeController.js).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

// Public routes
router.get('/primary', getPrimaryResume);
router.get('/primary/download', downloadPrimaryResume);

// Protected routes (admin only)
router.get('/', verifyToken, isAdmin, getResumes);
router.get('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, getResume);
router.post('/', verifyToken, isAdmin, upload.single('file'), uploadResume);
router.put('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, updateResume);
router.delete('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, deleteResume);

export default router;