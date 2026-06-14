import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getQuote, getHistory, marketSummary } from '../controllers/prices';

const router = Router();
router.use(requireAuth);
router.get('/summary', marketSummary);
router.get('/history/:symbol', getHistory);
router.get('/:symbol', getQuote);

export default router;
