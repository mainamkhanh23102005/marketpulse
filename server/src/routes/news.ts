import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getNews } from '../controllers/news';

const router = Router();
router.use(requireAuth);
router.get('/', getNews);

export default router;
