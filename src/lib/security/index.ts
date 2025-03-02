import { createHash } from 'crypto';
import { jwtDecode } from 'jwt-decode';

export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; media-src 'self' https:;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export function validateToken(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp! > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '');
} 