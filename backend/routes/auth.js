import express from 'express';
import {
  login,
  getCurrentUser,
  changePassword,
  verifyTokenEndpoint,
} from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateLogin, validatePasswordChange, handleValidationErrors } from '../middleware/validation.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/login', loginRateLimiter, validateLogin, handleValidationErrors, login);
router.get('/verify', verifyToken, verifyTokenEndpoint);

// Protected routes (admin only)
router.get('/me', verifyToken, getCurrentUser);
router.post('/change-password', verifyToken, isAdmin, validatePasswordChange, handleValidationErrors, changePassword);

export default router;