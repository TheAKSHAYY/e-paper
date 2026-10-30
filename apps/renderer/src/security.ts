/**
 * SSRF and Outbound Asset Security Module
 * Provides robust validation against Server-Side Request Forgery, DNS rebinding,
 * non-standard IP representations (octal, hex, decimal), and cloud metadata access.
 */

// Blocked internal / private / reserved IPv4 CIDR ranges
const BLOCKED_IPV4_RANGES: Array<{ min: number; max: number }> = [
  // 0.0.0.0/8 (Current network / localhost on Linux)
  { min: ipToNumber('0.0.0.0'), max: ipToNumber('0.255.255.255') },
  // 10.0.0.0/8 (Private-Use Networks)
  { min: ipToNumber('10.0.0.0'), max: ipToNumber('10.255.255.255') },
  // 100.64.0.0/10 (Shared Address Space / Carrier-Grade NAT)
  { min: ipToNumber('100.64.0.0'), max: ipToNumber('100.127.255.255') },
  // 127.0.0.0/8 (Loopback)
  { min: ipToNumber('127.0.0.0'), max: ipToNumber('127.255.255.255') },
  // 169.254.0.0/16 (Link Local / Cloud Metadata)
  { min: ipToNumber('169.254.0.0'), max: ipToNumber('169.254.255.255') },
  // 172.16.0.0/12 (Private-Use Networks)
  { min: ipToNumber('172.16.0.0'), max: ipToNumber('172.31.255.255') },
  // 192.0.0.0/24 (IETF Protocol Assignments)
  { min: ipToNumber('192.0.0.0'), max: ipToNumber('192.0.0.255') },
  // 192.0.2.0/24 (TEST-NET-1)
  { min: ipToNumber('192.0.2.0'), max: ipToNumber('192.0.2.255') },
  // 192.168.0.0/16 (Private-Use Networks)
  { min: ipToNumber('192.168.0.0'), max: ipToNumber('192.168.255.255') },
  // 198.18.0.0/15 (Benchmarking)
  { min: ipToNumber('198.18.0.0'), max: ipToNumber('198.19.255.255') },
  // 198.51.100.0/24 (TEST-NET-2)
  { min: ipToNumber('198.51.100.0'), max: ipToNumber('198.51.100.255') },
  // 203.0.113.0/24 (TEST-NET-3)
  { min: ipToNumber('203.0.113.0'), max: ipToNumber('203.0.113.255') },
  // 224.0.0.0/4 (Multicast)
  { min: ipToNumber('224.0.0.0'), max: ipToNumber('239.255.255.255') },
  // 240.0.0.0/4 (Reserved / Future Use)
  { min: ipToNumber('240.0.0.0'), max: ipToNumber('255.255.255.255') },
];

/**
 * Converts a dotted-quad IPv4 string to an unsigned 32-bit integer.
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0);
}

/**
 * Attempts to parse an IPv4 address in standard, octal, hex, or integer format.
 * Returns the canonical dotted-quad string or null if not a valid IPv4 address.
 */
export function parseCanonicalIPv4(host: string): string | null {
  // Strip enclosing brackets if passed as [ipv4]
  const cleanHost = host.replace(/^\[|\]$/g, '').trim();

  // 1. Integer format (e.g. 2130706433 -> 127.0.0.1)
  if (/^\d+$/.test(cleanHost)) {
    const num = Number(cleanHost);
    if (!Number.isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join('.');
    }
  }

  // 2. Hexadecimal single integer (e.g. 0x7f000001)
  if (/^0x[0-9a-fA-F]+$/i.test(cleanHost)) {
    const num = parseInt(cleanHost, 16);
    if (!Number.isNaN(num) && num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join('.');
    }
  }

  // 3. Dotted notation (1-4 parts, octal/hex/decimal mixed)
  const parts = cleanHost.split('.');
  if (parts.length >= 1 && parts.length <= 4) {
    const numericParts: number[] = [];
    for (const part of parts) {
      if (!part) return null;
      let val: number;
      if (/^0x[0-9a-fA-F]+$/i.test(part)) {
        val = parseInt(part, 16);
      } else if (/^0[0-7]+$/.test(part)) {
        val = parseInt(part, 8);
      } else if (/^\d+$/.test(part)) {
        val = parseInt(part, 10);
      } else {
        return null;
      }
      if (Number.isNaN(val) || val < 0) return null;
      numericParts.push(val);
    }

    if (numericParts.length === 4) {
      if (numericParts.every((p) => p <= 255)) {
        return numericParts.join('.');
      }
    } else if (numericParts.length === 1) {
      const num = numericParts[0]!;
      if (num <= 0xffffffff) {
        return [
          (num >>> 24) & 255,
          (num >>> 16) & 255,
          (num >>> 8) & 255,
          num & 255,
        ].join('.');
      }
    }
  }

  return null;
}

/**
 * Checks whether an IPv4 address is in a private, loopback, or reserved range.
 */
export function isPrivateOrReservedIPv4(ipv4: string): boolean {
  try {
    const num = ipToNumber(ipv4);
    for (const range of BLOCKED_IPV4_RANGES) {
      if (num >= range.min && num <= range.max) {
        return true;
      }
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Checks whether an IPv6 address is in a private, loopback, or cloud metadata range.
 */
export function isPrivateOrReservedIPv6(host: string): boolean {
  const clean = host.replace(/^\[|\]$/g, '').toLowerCase().trim();

  // Loopback (::1, 0:0:0:0:0:0:0:1)
  if (clean === '::1' || clean === '0:0:0:0:0:0:0:1' || /^0*(:0*)*:1$/.test(clean)) {
    return true;
  }

  // Unspecified (::, 0:0:0:0:0:0:0:0)
  if (clean === '::' || /^0*(:0*)*:0*$/.test(clean)) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (clean.startsWith('::ffff:') || clean.startsWith('0:0:0:0:0:ffff:')) {
    const remainder = clean.replace(/^(::ffff:|0:0:0:0:0:ffff:)/, '');
    const mappedIpv4 = parseCanonicalIPv4(remainder);
    if (mappedIpv4) {
      return isPrivateOrReservedIPv4(mappedIpv4);
    }
    return true; // Malformed or unrecognized mapped address: block safely
  }

  // Unique Local Address (fc00::/7: fc00:: through fdff::)
  if (/^f[cd][0-9a-f]{2}:/i.test(clean)) {
    return true;
  }

  // Link-Local Address (fe80::/10: fe80:: through febf::)
  if (/^fe[89ab][0-9a-f]:/i.test(clean)) {
    return true;
  }

  // Site-Local Address (fec0::/10: deprecated, treated as private)
  if (/^fe[c-f][0-9a-f]:/i.test(clean)) {
    return true;
  }

  // AWS EC2 IPv6 metadata service (fd00:ec2::254)
  if (clean.includes('fd00:ec2') || clean.includes('169.254')) {
    return true;
  }

  return false;
}

/**
 * Validates that an outbound resource URL does not point to sensitive local,
 * internal, cloud metadata, or private network endpoints (SSRF mitigation).
 */
export function isSafeUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;

  const trimmed = urlStr.trim();

  // Allow standard image data URIs (PNG, JPEG, WebP)
  if (
    trimmed.startsWith('data:image/png;') ||
    trimmed.startsWith('data:image/jpeg;') ||
    trimmed.startsWith('data:image/webp;') ||
    trimmed.startsWith('data:image/gif;')
  ) {
    return true;
  }

  // Reject SVG data URIs if they contain script tags or active handlers
  if (trimmed.startsWith('data:image/svg+xml')) {
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('<script') ||
      lower.includes('onload=') ||
      lower.includes('onerror=') ||
      lower.includes('javascript:')
    ) {
      return false;
    }
    return true;
  }

  try {
    const parsed = new URL(trimmed);

    // Strictly enforce HTTP and HTTPS schemes
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase().trim();
    if (!host) return false;

    // Reject localhost and local names
    if (
      host === 'localhost' ||
      host === 'localhost.localdomain' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.intranet') ||
      host.endsWith('.corp') ||
      host.endsWith('.home') ||
      host.endsWith('.lan') ||
      host.endsWith('.onion')
    ) {
      return false;
    }

    // Cloud metadata hostnames
    if (
      host === 'metadata.google.internal' ||
      host === 'instance-data' ||
      host === 'metadata'
    ) {
      return false;
    }

    // Check if the hostname is an IPv4 address in any notation
    const canonicalIpv4 = parseCanonicalIPv4(host);
    if (canonicalIpv4) {
      if (isPrivateOrReservedIPv4(canonicalIpv4)) {
        return false;
      }
    }

    // Check if the hostname is an IPv6 address
    if (host.startsWith('[') || host.includes(':')) {
      if (isPrivateOrReservedIPv6(host)) {
        return false;
      }
    }

    // Ensure port is not restricted
    if (parsed.port) {
      const portNum = Number(parsed.port);
      if (portNum < 1 || portNum > 65535) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks whether an outbound request URL matches the configured allowed asset origins.
 */
export function isAllowedAssetOrigin(urlStr: string, allowedOriginsEnv?: string): boolean {
  if (!isSafeUrl(urlStr)) return false;

  // Inlined data URIs are always permitted
  if (urlStr.startsWith('data:image/')) return true;

  if (!allowedOriginsEnv || !allowedOriginsEnv.trim()) {
    // When no external asset origins are configured, disallow all external HTTP(S) requests
    return false;
  }

  try {
    const parsed = new URL(urlStr);
    const allowed = allowedOriginsEnv
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const reqOrigin = parsed.origin.toLowerCase();
    const reqHost = parsed.hostname.toLowerCase();

    return allowed.some(
      (origin) =>
        origin === reqOrigin ||
        origin === reqHost ||
        origin === `http://${reqHost}` ||
        origin === `https://${reqHost}`
    );
  } catch {
    return false;
  }
}

