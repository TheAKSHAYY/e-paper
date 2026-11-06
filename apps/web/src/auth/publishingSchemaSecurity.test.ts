import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 3: Database & Storage Infrastructure Security Audit', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../../supabase/migrations/20261106000000_epaper_publishing_schema.sql'
  );
  const sql = fs.readFileSync(migrationPath, 'utf8');

  describe('1. Migration File & DDL Structure', () => {
    it('confirms Phase 3 migration file exists and is populated', () => {
      expect(fs.existsSync(migrationPath)).toBe(true);
      expect(sql.length).toBeGreaterThan(3000);
    });

    it('defines all 6 core newspaper publishing tables', () => {
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.issues');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.documents');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.pages');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.articles');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.media_assets');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.render_jobs');
    });

    it('enforces foreign key cascades and constraints', () => {
      // Issues cascade on publication delete
      expect(sql).toContain('REFERENCES public.publications(id) ON DELETE CASCADE');
      // Documents cascade on publication delete, set null on issue delete
      expect(sql).toContain('REFERENCES public.issues(id) ON DELETE SET NULL');
      // Pages cascade on document delete
      expect(sql).toContain('REFERENCES public.documents(id) ON DELETE CASCADE');
      // Articles link to document and page
      expect(sql).toContain('REFERENCES public.pages(id) ON DELETE SET NULL');
      // Articles continuation self-references
      expect(sql).toContain('REFERENCES public.articles(id) ON DELETE SET NULL');
    });
  });

  describe('2. Row-Level Security (RLS) Enforcement on All Tables', () => {
    it('explicitly enables Row-Level Security on all 6 tables', () => {
      expect(sql).toContain('ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;');
      expect(sql).toContain('ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;');
      expect(sql).toContain('ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;');
      expect(sql).toContain('ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;');
      expect(sql).toContain('ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;');
      expect(sql).toContain('ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;');
    });

    it('binds all client-facing RLS policies to authenticated role (TO authenticated)', () => {
      const policyMatches = sql.match(/CREATE POLICY "[^"]+"\s+ON public\.\w+\s+FOR (SELECT|INSERT|UPDATE|DELETE)\s+TO authenticated/g);
      expect(policyMatches).not.toBeNull();
      // Should have at least 20 authenticated policies across the 6 tables
      expect(policyMatches!.length).toBeGreaterThanOrEqual(20);
    });

    it('utilizes (SELECT auth.uid()) scalar subquery for optimizer InitPlan caching', () => {
      // Must not use bare auth.uid() = ... in policies
      expect(sql).toContain('(SELECT auth.uid()) = created_by');
      expect(sql).toContain('(SELECT auth.uid()) = uploaded_by');
      expect(sql).toContain('(SELECT auth.uid()) = requested_by');
    });

    it('enforces WITH CHECK on all UPDATE policies to prevent IDOR / privilege escalation', () => {
      // Issues update has WITH CHECK
      expect(sql).toMatch(/CREATE POLICY "Editors and above can update issues"[\s\S]*?WITH CHECK/);
      // Documents update has WITH CHECK
      expect(sql).toMatch(/CREATE POLICY "Editors and Designers can update documents"[\s\S]*?WITH CHECK/);
      // Pages update has WITH CHECK
      expect(sql).toMatch(/CREATE POLICY "Editors and Designers can update pages"[\s\S]*?WITH CHECK/);
      // Articles update has WITH CHECK
      expect(sql).toMatch(/CREATE POLICY "Authors or Editors can update articles"[\s\S]*?WITH CHECK/);
      // Media assets update has WITH CHECK
      expect(sql).toMatch(/CREATE POLICY "Uploaders or Editors can update media assets"[\s\S]*?WITH CHECK/);
      // Render jobs update has WITH CHECK
      expect(sql).toMatch(/CREATE POLICY "Editors and above can update render jobs"[\s\S]*?WITH CHECK/);
    });
  });

  describe('3. Helper Security Functions & Surface Area Hardening', () => {
    it('defines is_publication_editor_or_above with SECURITY DEFINER and search_path = public', () => {
      const editorBlock = sql.slice(sql.indexOf('FUNCTION public.is_publication_editor_or_above'));
      expect(editorBlock).toContain('SECURITY DEFINER');
      expect(editorBlock).toContain('SET search_path = public');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_publication_editor_or_above(UUID) FROM PUBLIC;');
      expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.is_publication_editor_or_above(UUID) TO authenticated;');
    });

    it('defines is_publication_reporter_or_above with SECURITY DEFINER and search_path = public', () => {
      const reporterBlock = sql.slice(sql.indexOf('FUNCTION public.is_publication_reporter_or_above'));
      expect(reporterBlock).toContain('SECURITY DEFINER');
      expect(reporterBlock).toContain('SET search_path = public');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_publication_reporter_or_above(UUID) FROM PUBLIC;');
      expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.is_publication_reporter_or_above(UUID) TO authenticated;');
    });

    it('defines storage_path_publication_id safe UUID extractor', () => {
      expect(sql).toContain('FUNCTION public.storage_path_publication_id');
      expect(sql).toContain('first_segment::UUID');
      expect(sql).toContain('WHEN OTHERS THEN');
      expect(sql).toContain('RETURN NULL;');
    });
  });

  describe('4. Supabase Storage Buckets & Storage RLS', () => {
    it('provisions the three required Storage buckets idempotently', () => {
      expect(sql).toContain("'epaper-assets'");
      expect(sql).toContain("'epaper-rendered-pdf'");
      expect(sql).toContain("'epaper-documents'");
      expect(sql).toContain('INSERT INTO storage.buckets');
      expect(sql).toContain('ON CONFLICT (id) DO UPDATE');
    });

    it('enforces publication-scoped access on storage.objects', () => {
      expect(sql).toContain('CREATE POLICY "Public and members can view epaper-assets"');
      expect(sql).toContain('CREATE POLICY "Editors can upload publication assets"');
      expect(sql).toContain('CREATE POLICY "Admins and Owners can delete publication assets"');
      expect(sql).toContain('CREATE POLICY "Members can view rendered publication PDFs"');
      expect(sql).toContain('CREATE POLICY "Members can view backed up document archives"');
    });

    it('enforces both INSERT and UPDATE policies for Storage upsert compatibility', () => {
      expect(sql).toContain('CREATE POLICY "Editors can upload publication assets"\n    ON storage.objects\n    FOR INSERT');
      expect(sql).toContain('CREATE POLICY "Editors can update publication assets"\n    ON storage.objects\n    FOR UPDATE');
    });
  });
});

