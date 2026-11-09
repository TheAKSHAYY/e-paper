/**
 * Authentication and Security Validation Utilities for E-Paper Studio
 */

export interface PasswordStrength {
  score: number; // 0 - 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  labelHindi: 'कमजोर' | 'साधारण' | 'अच्छा' | 'मजबूत';
  color: string;
  feedback: string[];
  feedbackHindi: string[];
}

/**
 * Validates standard RFC 5322 compatible email format
 */
export function validateEmail(
  email: string,
  locale: 'en' | 'hi' = 'en'
): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error:
        locale === 'hi' ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Please enter your email address.',
    };
  }

  const trimmed = email.trim();
  // Standard strict email regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error:
        locale === 'hi'
          ? 'कृपया एक मान्य ईमेल पता दर्ज करें (उदा. editor@newspaper.com)।'
          : 'Please enter a valid email address (e.g. editor@newspaper.com).',
    };
  }

  return { isValid: true };
}

/**
 * Enforces editorial password policy:
 * - Minimum 8 characters
 * - Requires at least one uppercase, one lowercase, and one number or special character
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Weak',
      labelHindi: 'कमजोर',
      color: '#DC2626',
      feedback: ['At least 8 characters required'],
      feedbackHindi: ['कम से कम ८ अक्षरों की आवश्यकता है'],
    };
  }

  let score = 0;
  const feedback: string[] = [];
  const feedbackHindi: string[] = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Must be at least 8 characters long');
    feedbackHindi.push('कम से कम ८ अक्षर लंबा होना चाहिए');
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include both uppercase and lowercase letters');
    feedbackHindi.push('बड़े और छोटे दोनों अक्षरों का प्रयोग करें');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number');
    feedbackHindi.push('कम से कम एक संख्या शामिल करें');
  }

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include a special symbol (e.g. ! @ # $)');
    feedbackHindi.push('एक विशेष चिह्न शामिल करें (उदा. ! @ # $)');
  }

  if (score <= 1) {
    return {
      score: 1,
      label: 'Weak',
      labelHindi: 'कमजोर',
      color: '#DC2626', // Press Red
      feedback,
      feedbackHindi,
    };
  }

  if (score === 2) {
    return {
      score: 2,
      label: 'Fair',
      labelHindi: 'साधारण',
      color: '#D97706', // Amber
      feedback,
      feedbackHindi,
    };
  }

  if (score === 3) {
    return {
      score: 3,
      label: 'Good',
      labelHindi: 'अच्छा',
      color: '#2563EB', // Blue
      feedback: feedback.length > 0 ? feedback : ['Add a symbol to make it stronger'],
      feedbackHindi:
        feedbackHindi.length > 0 ? feedbackHindi : ['अधिक मजबूती के लिए विशेष चिह्न जोड़ें'],
    };
  }

  return {
    score: 4,
    label: 'Strong',
    labelHindi: 'मजबूत',
    color: '#16A34A', // Green
    feedback: ['Strong and secure password'],
    feedbackHindi: ['मजबूत और सुरक्षित पासवर्ड'],
  };
}

export function validatePassword(
  password: string,
  locale: 'en' | 'hi' = 'en'
): { isValid: boolean; error?: string } {
  if (!password) {
    return {
      isValid: false,
      error: locale === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter a password.',
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error:
        locale === 'hi'
          ? 'पासवर्ड कम से कम ८ वर्णों का होना चाहिए।'
          : 'Password must be at least 8 characters long.',
    };
  }

  return { isValid: true };
}

export function validatePasswordMatch(
  password: string,
  confirm: string,
  locale: 'en' | 'hi' = 'en'
): { isValid: boolean; error?: string } {
  if (password !== confirm) {
    return {
      isValid: false,
      error: locale === 'hi' ? 'पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.',
    };
  }
  return { isValid: true };
}

/**
 * Sanitizes redirect URLs to strictly prevent Open Redirect vulnerabilities.
 * Only allows relative paths on the same origin (e.g. '/dashboard', '/editor').
 * Explicitly rejects protocol-relative URLs ('//attacker.com'), absolute URLs ('https://...'), and javascript schemes.
 */
export function sanitizeRedirectUrl(
  target: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!target || typeof target !== 'string') {
    return fallback;
  }

  const trimmed = target.trim();

  // Must begin with single forward slash and not double forward slash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  // Reject malicious schemes
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Masks destination email address for safe display on email verification screen
 * e.g., 'editor.hindustan@gmail.com' -> 'ed***@gmail.com'
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const parts = email.split('@');
  const local = parts[0];
  const domain = parts[1];
  if (!local || !domain) return email;

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}
