import express from 'express';
import multer from 'multer';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  uploadProjectVideo,
} from '../controllers/projectController.js';
import { verifyToken, isAdmin, optionalAuth } from '../middleware/auth.js';
import { validateProject, validateId, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Files are kept in memory only, then streamed straight to Cloudinary in
// the controller — nothing is written to local disk, which is what makes
// uploads survive redeploys (see controllers/projectController.js).
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

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB, matches the admin UI hint
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  },
});

// Public routes
router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, validateId, handleValidationErrors, getProject);

// Protected routes (admin only)
router.post('/upload-image', verifyToken, isAdmin, uploadImage.single('image'), uploadProjectImage);
router.post('/upload-video', verifyToken, isAdmin, uploadVideo.single('video'), uploadProjectVideo);
router.post('/', verifyToken, isAdmin, validateProject, handleValidationErrors, createProject);
router.put('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, updateProject);
router.delete('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, deleteProject);

export default router;