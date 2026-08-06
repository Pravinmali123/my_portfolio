import express from 'express';
import {
  trackVisit,
  getVisits,
  getVisitStats,
  deleteVisit,
  clearVisits,
} from '../controllers/visitController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route — called from the live portfolio site on page load
router.post('/track', trackVisit);

// Protected routes (admin only)
router.get('/', verifyToken, isAdmin, getVisits);
router.get('/stats', verifyToken, isAdmin, getVisitStats);
router.delete('/clear', verifyToken, isAdmin, clearVisits);
router.delete('/:id', verifyToken, isAdmin, deleteVisit);

export default router;
