import { createHash } from 'crypto';

export function sanitizeInput(input: string): string {
  // XSS対策
  return input.replace(/[<>]/g, '');
}

export function hashSensitiveData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}; 