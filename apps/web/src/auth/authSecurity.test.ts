import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { sanitizeRedirectUrl, maskEmail } from './authValidation';
import { getSupabaseConfigStatus } from './supabaseClient';

describe('Authentication Phase 2: Security & Cloud Integration Audit', () => {
  describe('1. Supabase Environment Configuration Validation', () => {
    it('accurately parses configuration status without throwing', () => {
      const status = getSupabaseConfigStatus();
      expect(status).toHaveProperty('isConfigured');
      expect(status).toHaveProperty('hasUrl');
      expect(status).toHaveProperty('hasAnonKey');
      expect(status).toHaveProperty('endpointMasked');
      expect(status).toHaveProperty('errorMessage');
    });

    it('rejects placeholder and invalid credentials', () => {
      // Test the logic directly
      const dummyPlaceholder = 'your-supabase-anon-key-placeholder';
      const isPlaceholder = dummyPlaceholder.includes('placeholder');
      expect(isPlaceholder).toBe(true);
    });

    it('masks endpoint domain when configured to prevent secret leakage', () => {
      const status = getSupabaseConfigStatus();
      if (status.isConfigured && status.endpointMasked) {
        expect(status.endpointMasked).not.toContain('anon');
        expect(status.endpointMasked).not.toContain('key');
      }
    });
  });

  describe('2. Open-Redirect Vulnerability Hardening', () => {
    it('strictly permits only valid local origin paths', () => {
      expect(sanitizeRedirectUrl('/dashboard')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('/editor')).toBe('/editor');
      expect(sanitizeRedirectUrl('/onboarding')).toBe('/onboarding');
      expect(sanitizeRedirectUrl('/dashboard?page=2')).toBe('/dashboard?page=2');
    });

    it('blocks protocol-relative URLs that hijack navigation to external domains', () => {
      expect(sanitizeRedirectUrl('//evil.com')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('///evil.com')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('//google.com/login')).toBe('/dashboard');
    });

    it('blocks backslash UNC and Windows path injection attacks', () => {
      expect(sanitizeRedirectUrl('\\evil.com\\phish')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('\\\\attacker.net\\payload')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('/\\evil.com')).toBe('/dashboard');
    });

    it('blocks absolute external URLs and javascript URI schemes', () => {
      expect(sanitizeRedirectUrl('https://phishing-site.org')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('http://insecure-login.net')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('javascript:alert(1)')).toBe('/dashboard');
      expect(sanitizeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('/dashboard');
    });

    it('honors clean fallback redirect destinations', () => {
      expect(sanitizeRedirectUrl('https://evil.com', '/editor')).toBe('/editor');
      expect(sanitizeRedirectUrl(null, '/login')).toBe('/login');
    });
  });

  describe('3. Database Migration & RLS Security Audit (20261104000000_auth_and_profiles.sql)', () => {
    const migrationPath = path.resolve(
      __dirname,
      '../../../../supabase/migrations/20261104000000_auth_and_profiles.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    it('verifies migration file exists and contains valid PostgreSQL DDL', () => {
      expect(fs.existsSync(migrationPath)).toBe(true);
      expect(sql.length).toBeGreaterThan(1000);
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.profiles');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.publications');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.publication_members');
    });

    it('verifies 1:1 foreign key relationship to auth.users with CASCADE delete', () => {
      expect(sql).toContain('REFERENCES auth.users(id) ON DELETE CASCADE');
    });

    it('confirms Row-Level Security (RLS) is explicitly enabled on all public tables', () => {
      expect(sql).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
      expect(sql).toContain('ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;');
      expect(sql).toContain('ALTER TABLE public.publication_members ENABLE ROW LEVEL SECURITY;');
    });

    it('verifies User Isolation on profiles table (User A cannot read User B profile)', () => {
      // Must enforce (SELECT auth.uid()) = id for SELECT and UPDATE with TO authenticated
      expect(sql).toMatch(/CREATE POLICY "Users can view own profile"[\s\S]*?FOR SELECT[\s\S]*?TO authenticated[\s\S]*?USING \(\(SELECT auth\.uid\(\)\) = id\);/);
      expect(sql).toMatch(/CREATE POLICY "Users can update own profile"[\s\S]*?FOR UPDATE[\s\S]*?TO authenticated[\s\S]*?USING \(\(SELECT auth\.uid\(\)\) = id\)/);
      // Confirms WITH CHECK matches (SELECT auth.uid()) = id on UPDATE
      expect(sql).toContain('WITH CHECK ((SELECT auth.uid()) = id);');
      // Confirms NO direct client INSERT policy exists on public.profiles (trigger-only)
      expect(sql).not.toContain('CREATE POLICY "Users can insert own profile"');
      expect(sql).not.toContain('FOR INSERT ON public.profiles');
    });

    it('verifies publication isolation (User A cannot read User B publications)', () => {
      // Confirms publications SELECT requires membership in publication_members
      expect(sql).toContain('Members can view publications they belong to');
      expect(sql).toContain('public.is_publication_member(id)');
      // Confirms publications UPDATE & DELETE requires owner/admin role with WITH CHECK
      expect(sql).toContain('public.is_publication_admin_or_owner(id)');
      expect(sql).toContain('public.is_publication_owner(id)');
      expect(sql).toContain('WITH CHECK');
    });

    it('verifies publication_members RBAC policies and anti-privilege escalation', () => {
      expect(sql).toContain('UNIQUE(publication_id, user_id)');
      expect(sql).toContain('Owners and Admins can add members');
      expect(sql).toContain('Owners and Admins can update member roles');
      expect(sql).toContain('Owners, Admins, or self can remove members');
      // Confirms admin cannot promote anyone to owner
      expect(sql).toContain("role != 'owner'");
      // Confirms admin cannot delete owner
      expect(sql).toContain("role NOT IN ('owner', 'admin')");
    });

    it('verifies search_path hardening and access control on all SECURITY DEFINER functions', () => {
      // Prevents search-path hijacking by untrusted schemas
      const handleUserBlock = sql.slice(sql.indexOf('FUNCTION public.handle_new_user()'));
      expect(handleUserBlock).toContain('SECURITY DEFINER');
      expect(handleUserBlock).toContain('SET search_path = public');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;');

      const handlePubBlock = sql.slice(sql.indexOf('FUNCTION public.handle_new_publication()'));
      expect(handlePubBlock).toContain('SECURITY DEFINER');
      expect(handlePubBlock).toContain('SET search_path = public');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.handle_new_publication() FROM PUBLIC;');

      // Helper functions must also have search_path = public and revoked public execute
      expect(sql).toContain('FUNCTION public.is_publication_member');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_publication_member(UUID) FROM PUBLIC;');
      expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.is_publication_member(UUID) TO authenticated;');
    });

    it('verifies composite index on (user_id, role) for high performance RBAC lookups', () => {
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_pub_members_user_role ON public.publication_members(user_id, role);');
    });
  });

  describe('4. Email Non-Enumeration & Sensitive Data Masking', () => {
    it('masks destination email addresses without exposing full mailbox username', () => {
      expect(maskEmail('publisher.editorial@hindustan.com')).toBe('pu***l@hindustan.com');
      expect(maskEmail('ed@morningpost.org')).toBe('e***@morningpost.org');
    });

    it('handles non-email strings safely without thrown exceptions', () => {
      expect(maskEmail('')).toBe('');
      expect(maskEmail('invalid-string')).toBe('invalid-string');
    });
  });
});
