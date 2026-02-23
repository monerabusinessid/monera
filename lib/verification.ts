// Edge-compatible verification utilities
export function generateVerificationCode(): string {
  // Use Math.random for edge compatibility
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function getCodeExpirationTime(): Date {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}