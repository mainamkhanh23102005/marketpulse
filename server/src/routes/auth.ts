import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout } from '../controllers/auth';

const broadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const credentialLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many attempts, please try again later' } });

const router = Router();
router.use(broadLimiter);
router.post('/register', credentialLimiter, register);
router.post('/login', credentialLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
