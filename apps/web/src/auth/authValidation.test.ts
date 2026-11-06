import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  evaluatePasswordStrength,
  sanitizeRedirectUrl,
  maskEmail,
} from './authValidation';

describe('authValidation Suite', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('publisher@epaper-studio.org', 'en').isValid).toBe(true);
      expect(validateEmail('editorial.team+daily@news.co.in', 'en').isValid).toBe(true);
      expect(validateEmail('editor@subdomain.example.com', 'hi').isValid).toBe(true);
    });

    it('rejects invalid email formats with bilingual messages', () => {
      const emptyEn = validateEmail('', 'en');
      expect(emptyEn.isValid).toBe(false);
      expect(emptyEn.error).toBe('Please enter your email address.');

      const emptyHi = validateEmail('', 'hi');
      expect(emptyHi.isValid).toBe(false);
      expect(emptyHi.error).toBe('कृपया अपना ईमेल पता दर्ज करें।');

      const invalidEn = validateEmail('invalid-email-string', 'en');
      expect(invalidEn.isValid).toBe(false);
      expect(invalidEn.error).toContain('Please enter a valid email address');

      const invalidHi = validateEmail('invalid@', 'hi');
      expect(invalidHi.isValid).toBe(false);
      expect(invalidHi.error).toContain('कृपया एक मान्य ईमेल पता दर्ज करें');

      const spaceEmail = validateEmail('user name@example.com', 'en');
      expect(spaceEmail.isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('rejects empty password', () => {
      const emptyEn = validatePassword('', 'en');
      expect(emptyEn.isValid).toBe(false);
      expect(emptyEn.error).toBe('Please enter a password.');

      const emptyHi = validatePassword('', 'hi');
      expect(emptyHi.isValid).toBe(false);
      expect(emptyHi.error).toBe('कृपया पासवर्ड दर्ज करें।');
    });

    it('rejects passwords shorter than 8 characters', () => {
      const shortEn = validatePassword('Pass1!', 'en');
      expect(shortEn.isValid).toBe(false);
      expect(shortEn.error).toContain('at least 8 characters');

      const shortHi = validatePassword('Pass1!', 'hi');
      expect(shortHi.isValid).toBe(false);
      expect(shortHi.error).toContain('कम से कम ८ वर्णों का होना चाहिए');
    });

    it('accepts valid passwords', () => {
      const res = validatePassword('PressEditorial2026!', 'en');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  describe('validatePasswordMatch', () => {
    it('passes when passwords match', () => {
      const res = validatePasswordMatch('SecurePassword123!', 'SecurePassword123!', 'en');
      expect(res.isValid).toBe(true);
    });

    it('fails when passwords do not match', () => {
      const resEn = validatePasswordMatch('PassOne123!', 'PassTwo123!', 'en');
      expect(resEn.isValid).toBe(false);
      expect(resEn.error).toBe('Passwords do not match.');

      const resHi = validatePasswordMatch('PassOne123!', 'PassTwo123!', 'hi');
      expect(resHi.isValid).toBe(false);
      expect(resHi.error).toBe('पासवर्ड मेल नहीं खा रहे हैं।');
    });
  });

  describe('evaluatePasswordStrength', () => {
    it('scores empty password as weak', () => {
      const empty = evaluatePasswordStrength('');
      expect(empty.score).toBe(0);
      expect(empty.label).toBe('Weak');
      expect(empty.labelHindi).toBe('कमजोर');
      expect(empty.color).toBe('#DC2626');
    });

    it('scores weak passwords appropriately', () => {
      const simple = evaluatePasswordStrength('abcdefgh');
      expect(simple.score).toBeLessThanOrEqual(2);
      expect(simple.label).toBe('Weak');
    });

    it('scores complex passwords as strong', () => {
      const strong = evaluatePasswordStrength('PressEditorial2026!#');
      expect(strong.score).toBe(4);
      expect(strong.label).toBe('Strong');
      expect(strong.labelHindi).toBe('मजबूत');
      expect(strong.color).toBe('#16A34A');
    });
  });

  describe('sanitizeRedirectUrl (Open-Redirect Prevention)', () => {
    it('allows safe relative application paths', () => {
      expect(sanitizeRedirectUrl('/dashboard')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('/editor')).toBe('/editor');
      expect(sanitizeRedirectUrl('/onboarding')).toBe('/onboarding');
      expect(sanitizeRedirectUrl('/dashboard?view=archive')).toBe('/dashboard?view=archive');
    });

    it('blocks external absolute URLs and protocol-relative exploits', () => {
      expect(sanitizeRedirectUrl('https://malicious-site.com/steal')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('http://attacker.com')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('//evil.com/phish')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('javascript:alert(document.cookie)')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('\\\\evil.com\\share')).toBe('/dashboard');
    });

    it('respects custom fallback destinations', () => {
      expect(sanitizeRedirectUrl('https://evil.com', '/editor')).toBe('/editor');
      expect(sanitizeRedirectUrl(undefined, '/onboarding')).toBe('/onboarding');
      expect(sanitizeRedirectUrl('', '/')).toBe('/');
    });
  });

  describe('maskEmail', () => {
    it('masks standard email addresses cleanly', () => {
      const masked = maskEmail('publisher@epaper-studio.org');
      expect(masked).toBe('pu***r@epaper-studio.org');
    });

    it('handles short usernames safely', () => {
      const masked = maskEmail('ab@test.com');
      expect(masked).toBe('a***@test.com');
    });

    it('handles non-email inputs gracefully without throwing', () => {
      expect(maskEmail('')).toBe('');
      expect(maskEmail('not-an-email')).toBe('not-an-email');
    });
  });
});
