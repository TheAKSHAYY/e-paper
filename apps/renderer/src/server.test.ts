import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { IncomingMessage } from 'node:http';
import { getClientIp, checkRateLimit, resetRateLimitsForTesting } from './server';

function createMockRequest(options: {
  remoteAddress?: string;
  headers?: Record<string, string>;
}): IncomingMessage {
  return {
    socket: {
      remoteAddress: options.remoteAddress ?? '127.0.0.1',
    },
    headers: options.headers ?? {},
  } as unknown as IncomingMessage;
}

describe('Server Rate Limiting & Client IP Resolution (Proxy Safety)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetRateLimitsForTesting();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getClientIp()', () => {
    it('returns direct socket remoteAddress when no forwarded headers exist', () => {
      const req = createMockRequest({ remoteAddress: '192.0.2.1' });
      expect(getClientIp(req)).toBe('192.0.2.1');
    });

    it('extracts real client IP from a single X-Forwarded-For entry behind Render proxy', () => {
      const req = createMockRequest({
        remoteAddress: '10.0.0.1', // internal proxy IP
        headers: {
          'x-forwarded-for': '203.0.113.195',
        },
      });
      expect(getClientIp(req)).toBe('203.0.113.195');
    });

    it('safely extracts the real client IP appended by Render proxy and ignores spoofed client headers', () => {
      // Attacker attempts to spoof: X-Forwarded-For: 1.1.1.1, 8.8.8.8
      // Render's reverse proxy appends the real public client IP: 203.0.113.50
      const req = createMockRequest({
        remoteAddress: '10.0.0.1',
        headers: {
          'x-forwarded-for': '1.1.1.1, 8.8.8.8, 203.0.113.50',
        },
      });

      // With default TRUST_PROXY_HOPS = 1, it selects the rightmost entry appended by Render ingress
      expect(getClientIp(req)).toBe('203.0.113.50');
    });

    it('supports custom TRUST_PROXY_HOPS when behind multiple trusted proxy layers (e.g. Cloudflare + Render)', () => {
      // Cloudflare (hop 2) + Render (hop 1):
      // Client -> Cloudflare -> Render -> App
      // X-Forwarded-For: client_ip, cloudflare_edge_ip
      process.env.TRUST_PROXY_HOPS = '2';
      const req = createMockRequest({
        remoteAddress: '10.0.0.1',
        headers: {
          'x-forwarded-for': '198.51.100.42, 172.68.1.1',
        },
      });

      expect(getClientIp(req)).toBe('198.51.100.42');
    });

    it('ignores X-Forwarded-For and falls back to socket remoteAddress when TRUST_PROXY is false', () => {
      process.env.TRUST_PROXY = 'false';
      const req = createMockRequest({
        remoteAddress: '192.0.2.99',
        headers: {
          'x-forwarded-for': '203.0.113.195',
        },
      });

      expect(getClientIp(req)).toBe('192.0.2.99');
    });

    it('falls back to X-Real-IP when X-Forwarded-For is missing', () => {
      const req = createMockRequest({
        remoteAddress: '10.0.0.1',
        headers: {
          'x-real-ip': '203.0.113.77',
        },
      });

      expect(getClientIp(req)).toBe('203.0.113.77');
    });
  });

  describe('checkRateLimit()', () => {
    it('allows requests within limit and blocks requests exceeding limit for that specific IP', () => {
      const clientA = createMockRequest({
        headers: { 'x-forwarded-for': '203.0.113.1' },
      });
      const clientB = createMockRequest({
        headers: { 'x-forwarded-for': '203.0.113.2' },
      });

      const maxLimit = 3;

      // Client A makes 3 allowed requests
      expect(checkRateLimit(clientA, maxLimit)).toBe(true);
      expect(checkRateLimit(clientA, maxLimit)).toBe(true);
      expect(checkRateLimit(clientA, maxLimit)).toBe(true);

      // Client A 4th request exceeds limit
      expect(checkRateLimit(clientA, maxLimit)).toBe(false);

      // Client B from a different IP is unaffected
      expect(checkRateLimit(clientB, maxLimit)).toBe(true);
      expect(checkRateLimit(clientB, maxLimit)).toBe(true);
    });
  });
});

