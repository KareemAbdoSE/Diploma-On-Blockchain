// src/utils/tokenHelpers.ts
import crypto from 'crypto';
import { VerificationToken } from '../models/VerificationToken';
import { User } from '../models/User';

export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const saveVerificationToken = async (userId: number) => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiration

  await VerificationToken.create({ userId, token, expiresAt });

  return token;
};
