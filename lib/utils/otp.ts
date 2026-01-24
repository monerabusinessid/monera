/**
 * OTP (One-Time Password) utility functions
 * Generates and validates 6-digit verification codes
 */

/**
 * Generate a random 6-digit OTP code
 * @returns 6-digit string (000000-999999)
 */
export function generateOTP(): string {
  // Generate random number between 0 and 999999
  const code = Math.floor(Math.random() * 1000000)
  // Pad with zeros to ensure 6 digits
  return code.toString().padStart(6, '0')
}

/**
 * Validate OTP code format
 * @param code - The code to validate
 * @returns true if code is valid 6-digit format
 */
export function isValidOTPFormat(code: string): boolean {
  // Must be exactly 6 digits
  return /^\d{6}$/.test(code)
}

/**
 * Check if verification code has expired
 * @param expiresAt - Expiration timestamp
 * @returns true if code has expired
 */
export function isCodeExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return true
  
  const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
  return expirationDate < new Date()
}

/**
 * Calculate expiration time (10 minutes from now)
 * @returns Date object representing expiration time
 */
export function getCodeExpirationTime(): Date {
  const expirationTime = new Date()
  expirationTime.setMinutes(expirationTime.getMinutes() + 10) // 10 minutes from now
  return expirationTime
}

/**
 * Check if enough time has passed for resend (60 seconds)
 * @param lastSentAt - Timestamp of last code sent
 * @returns true if resend is allowed
 */
export function canResendCode(lastSentAt: Date | string | null): boolean {
  if (!lastSentAt) return true
  
  const lastSent = typeof lastSentAt === 'string' ? new Date(lastSentAt) : lastSentAt
  const now = new Date()
  const secondsSinceLastSent = (now.getTime() - lastSent.getTime()) / 1000
  
  return secondsSinceLastSent >= 60 // 60 seconds cooldown
}

/**
 * Get remaining seconds until resend is allowed
 * @param lastSentAt - Timestamp of last code sent
 * @returns Number of seconds remaining, or 0 if resend is allowed
 */
export function getResendCooldownSeconds(lastSentAt: Date | string | null): number {
  if (!lastSentAt) return 0
  
  const lastSent = typeof lastSentAt === 'string' ? new Date(lastSentAt) : lastSentAt
  const now = new Date()
  const secondsSinceLastSent = (now.getTime() - lastSent.getTime()) / 1000
  const cooldown = 60 // 60 seconds
  
  return Math.max(0, Math.ceil(cooldown - secondsSinceLastSent))
}
