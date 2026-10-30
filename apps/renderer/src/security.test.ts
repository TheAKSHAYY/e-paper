import { describe, it, expect } from 'vitest';
import {
  isSafeUrl,
  parseCanonicalIPv4,
  isPrivateOrReservedIPv4,
  isPrivateOrReservedIPv6,
  isAllowedAssetOrigin,
} from './security';

describe('SSRF & Asset Security (security.ts)', () => {
  describe('parseCanonicalIPv4()', () => {
    it('parses standard dotted decimal IPv4', () => {
      expect(parseCanonicalIPv4('127.0.0.1')).toBe('127.0.0.1');
      expect(parseCanonicalIPv4('192.168.1.50')).toBe('192.168.1.50');
      expect(parseCanonicalIPv4('8.8.8.8')).toBe('8.8.8.8');
    });

    it('parses decimal integer notation (e.g. 2130706433 -> 127.0.0.1)', () => {
      expect(parseCanonicalIPv4('2130706433')).toBe('127.0.0.1');
    });

    it('parses octal and hex notation', () => {
      expect(parseCanonicalIPv4('0177.0.0.1')).toBe('127.0.0.1');
      expect(parseCanonicalIPv4('0x7f.0.0.1')).toBe('127.0.0.1');
      expect(parseCanonicalIPv4('0x7f000001')).toBe('127.0.0.1');
    });

    it('returns null for non-IP hostnames', () => {
      expect(parseCanonicalIPv4('example.com')).toBeNull();
      expect(parseCanonicalIPv4('localhost')).toBeNull();
    });
  });

  describe('isPrivateOrReservedIPv4()', () => {
    it('detects loopback addresses', () => {
      expect(isPrivateOrReservedIPv4('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIPv4('127.100.0.1')).toBe(true);
      expect(isPrivateOrReservedIPv4('0.0.0.0')).toBe(true);
    });

    it('detects private 10.x, 172.16-31.x, and 192.168.x networks', () => {
      expect(isPrivateOrReservedIPv4('10.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIPv4('10.255.255.254')).toBe(true);
      expect(isPrivateOrReservedIPv4('172.16.0.1')).toBe(true);
      expect(isPrivateOrReservedIPv4('172.31.255.254')).toBe(true);
      expect(isPrivateOrReservedIPv4('192.168.0.1')).toBe(true);
      expect(isPrivateOrReservedIPv4('192.168.100.50')).toBe(true);
    });

    it('detects cloud metadata (169.254.169.254) and link-local ranges', () => {
      expect(isPrivateOrReservedIPv4('169.254.169.254')).toBe(true);
      expect(isPrivateOrReservedIPv4('169.254.1.1')).toBe(true);
    });

    it('allows public Internet IPv4 addresses', () => {
      expect(isPrivateOrReservedIPv4('8.8.8.8')).toBe(false);
      expect(isPrivateOrReservedIPv4('93.184.216.34')).toBe(false);
      expect(isPrivateOrReservedIPv4('151.101.1.140')).toBe(false);
    });
  });

  describe('isPrivateOrReservedIPv6()', () => {
    it('detects IPv6 loopback variants', () => {
      expect(isPrivateOrReservedIPv6('::1')).toBe(true);
      expect(isPrivateOrReservedIPv6('[::1]')).toBe(true);
      expect(isPrivateOrReservedIPv6('0:0:0:0:0:0:0:1')).toBe(true);
      expect(isPrivateOrReservedIPv6('::')).toBe(true);
    });

    it('detects IPv4-mapped IPv6 addresses for private ranges', () => {
      expect(isPrivateOrReservedIPv6('::ffff:127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIPv6('::ffff:169.254.169.254')).toBe(true);
      expect(isPrivateOrReservedIPv6('::ffff:10.0.0.5')).toBe(true);
    });

    it('detects link-local, unique-local, and cloud metadata IPv6', () => {
      expect(isPrivateOrReservedIPv6('fe80::1')).toBe(true);
      expect(isPrivateOrReservedIPv6('fc00::1')).toBe(true);
      expect(isPrivateOrReservedIPv6('fd00:ec2::254')).toBe(true);
    });
  });

  describe('isSafeUrl()', () => {
    it('allows safe public HTTPS and HTTP URLs', () => {
      expect(isSafeUrl('https://images.unsplash.com/photo-1585829365295-ab7cd400c167')).toBe(true);
      expect(isSafeUrl('http://example.com/newspaper/masthead.png')).toBe(true);
    });

    it('allows valid raster base64 data URIs', () => {
      expect(isSafeUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')).toBe(true);
      expect(isSafeUrl('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...')).toBe(true);
    });

    it('blocks dangerous SVG data URIs with active scripts', () => {
      expect(isSafeUrl('data:image/svg+xml;utf8,<svg onload="alert(1)"></svg>')).toBe(false);
      expect(isSafeUrl('data:image/svg+xml;utf8,<svg><script>fetch("http://169.254.169.254")</script></svg>')).toBe(false);
    });

    it('blocks loopback and localhost variants', () => {
      expect(isSafeUrl('http://localhost:4000/api/health')).toBe(false);
      expect(isSafeUrl('http://127.0.0.1:4000/render-pdf')).toBe(false);
      expect(isSafeUrl('http://127.0.0.2')).toBe(false);
      expect(isSafeUrl('http://0.0.0.0/')).toBe(false);
      expect(isSafeUrl('http://[::1]/')).toBe(false);
    });

    it('blocks non-standard integer and octal/hex IP representations', () => {
      // 2130706433 is 127.0.0.1
      expect(isSafeUrl('http://2130706433/')).toBe(false);
      // 0177.0.0.1 is 127.0.0.1
      expect(isSafeUrl('http://0177.0.0.1/')).toBe(false);
      // 0x7f000001 is 127.0.0.1
      expect(isSafeUrl('http://0x7f000001/')).toBe(false);
    });

    it('blocks cloud metadata endpoints', () => {
      expect(isSafeUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
      expect(isSafeUrl('http://metadata.google.internal/computeMetadata/v1/')).toBe(false);
      expect(isSafeUrl('http://[fd00:ec2::254]/')).toBe(false);
    });

    it('blocks internal private CIDR addresses', () => {
      expect(isSafeUrl('http://10.0.0.1/admin')).toBe(false);
      expect(isSafeUrl('http://172.20.0.1/')).toBe(false);
      expect(isSafeUrl('http://192.168.1.1/router')).toBe(false);
    });

    it('blocks internal TLDs', () => {
      expect(isSafeUrl('http://intranet.local/')).toBe(false);
      expect(isSafeUrl('http://database.internal/')).toBe(false);
      expect(isSafeUrl('http://service.corp/')).toBe(false);
    });

    it('blocks non-HTTP protocols (file:, ftp:, gopher:, javascript:)', () => {
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeUrl('ftp://ftp.example.com/file')).toBe(false);
      expect(isSafeUrl('gopher://gopher.example.com/')).toBe(false);
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('isAllowedAssetOrigin()', () => {
    it('blocks all external assets when ALLOWED_ASSET_ORIGINS is unset', () => {
      expect(isAllowedAssetOrigin('https://images.unsplash.com/photo.jpg', '')).toBe(false);
      expect(isAllowedAssetOrigin('https://images.unsplash.com/photo.jpg', undefined)).toBe(false);
    });

    it('permits inline data URIs regardless of origin configuration', () => {
      expect(
        isAllowedAssetOrigin('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', '')
      ).toBe(true);
    });

    it('matches exact allowlisted domains', () => {
      const allowed = 'images.unsplash.com, cdn.newspaper.com';
      expect(isAllowedAssetOrigin('https://images.unsplash.com/photo.jpg', allowed)).toBe(true);
      expect(isAllowedAssetOrigin('https://cdn.newspaper.com/art.png', allowed)).toBe(true);
      expect(isAllowedAssetOrigin('https://evil.com/fake.png', allowed)).toBe(false);
    });

    it('blocks private or reserved destinations even if misconfigured in ALLOWED_ASSET_ORIGINS', () => {
      expect(isAllowedAssetOrigin('http://169.254.169.254/meta-data', '169.254.169.254')).toBe(false);
      expect(isAllowedAssetOrigin('http://127.0.0.1:8080/image.png', '127.0.0.1')).toBe(false);
      expect(isAllowedAssetOrigin('http://2130706433/image.png', '2130706433')).toBe(false);
    });
  });
});

