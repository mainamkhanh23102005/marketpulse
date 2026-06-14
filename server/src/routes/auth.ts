import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout } from '../controllers/auth';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

const router = Router();
router.use(limiter);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
