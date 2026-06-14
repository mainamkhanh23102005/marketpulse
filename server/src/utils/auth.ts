import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(id: string): string {
  return jwt.sign({ id }, ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(id: string): string {
  return jwt.sign({ id }, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { id: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
