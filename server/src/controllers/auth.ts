import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Watchlist } from '../models/Watchlist';
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/auth';
import { createError } from '../middleware/errorHandler';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(createError(parsed.error.errors.map(e => e.message).join(', '), 400));
  }
  const { email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return next(createError('Email already in use', 409));

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash });
  await Watchlist.create({ userId: user._id });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: hashToken(refreshToken) } }, { new: true });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.status(201).json({ accessToken });
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(createError(parsed.error.errors.map(e => e.message).join(', '), 400));
  }
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return next(createError('Invalid credentials', 401));

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return next(createError('Invalid credentials', 401));

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: hashToken(refreshToken) } }, { new: true });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ accessToken });
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) return next(createError('No refresh token', 401));

  const payload = verifyRefreshToken(token);
  if (!payload) return next(createError('Invalid refresh token', 401));

  const user = await User.findById(payload.id);
  if (!user) return next(createError('User not found', 401));

  const tokenHash = hashToken(token);
  if (!user.refreshTokens.includes(tokenHash)) {
    return next(createError('Refresh token reuse detected', 401));
  }

  const newAccessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);

  const updatedTokens = user.refreshTokens
    .filter(t => t !== tokenHash)
    .concat(hashToken(newRefreshToken));

  await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: updatedTokens } }, { new: true });

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTS);
  res.json({ accessToken: newAccessToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (token) {
    const payload = verifyRefreshToken(token);
    if (payload) {
      const tokenHash = hashToken(token);
      const user = await User.findById(payload.id);
      if (user) {
        const updatedTokens = user.refreshTokens.filter(t => t !== tokenHash);
        await User.findByIdAndUpdate(payload.id, { $set: { refreshTokens: updatedTokens } });
      }
    }
  }
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Logged out' });
}
