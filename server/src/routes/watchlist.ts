import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getWatchlist, addAsset, removeAsset, addTopic, removeTopic } from '../controllers/watchlist';

const router = Router();
router.use(requireAuth);
router.get('/', getWatchlist);
router.put('/assets', addAsset);
router.delete('/assets/:symbol', removeAsset);
router.put('/topics', addTopic);
router.delete('/topics/:name', removeTopic);

export default router;
