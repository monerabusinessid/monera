import crypto from 'crypto';

export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function getCodeExpirationTime(): Date {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}