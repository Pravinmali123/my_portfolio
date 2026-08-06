import express from 'express';
import {
  getMessages,
  getMessage,
  createMessage,
  replyToMessage,
  updateMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateMessage, validateId, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/', validateMessage, handleValidationErrors, createMessage);

// Protected routes (admin only)
router.get('/', verifyToken, isAdmin, getMessages);
router.get('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, getMessage);
router.post('/:id/reply', verifyToken, isAdmin, validateId, handleValidationErrors, replyToMessage);
router.put('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, updateMessage);
router.delete('/:id', verifyToken, isAdmin, validateId, handleValidationErrors, deleteMessage);

export default router;
