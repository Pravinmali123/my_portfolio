import express from 'express';
import {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController.js';
import { verifyToken, isAdmin, optionalAuth } from '../middleware/auth.js';
import { validateSkill, validateId, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getSkills);
router.get('/:id', optionalAuth, validateId, handleValidationErrors, getSkill);

// Protected routes (admin only)
router.post('/', verifyToken, isAdmin, validateSkill, handleValidationErrors, createSkill);
router.put('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, updateSkill);
router.delete('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, deleteSkill);

export default router;
