-- ====================================================================
-- E-Paper Studio: Database Schema & RLS pgTAP Verification Suite
-- File: supabase/tests/schema.test.sql
-- ====================================================================

BEGIN;
SELECT plan(48);

-- 1. Table Existence Checks (9 tables)
SELECT has_table('public', 'profiles', 'Table public.profiles exists');
SELECT has_table('public', 'publications', 'Table public.publications exists');
SELECT has_table('public', 'publication_members', 'Table public.publication_members exists');
SELECT has_table('public', 'issues', 'Table public.issues exists');
SELECT has_table('public', 'documents', 'Table public.documents exists');
SELECT has_table('public', 'pages', 'Table public.pages exists');
SELECT has_table('public', 'articles', 'Table public.articles exists');
SELECT has_table('public', 'media_assets', 'Table public.media_assets exists');
SELECT has_table('public', 'render_jobs', 'Table public.render_jobs exists');

-- 2. Row Level Security (RLS) Active Checks (9 tables)
SELECT row_security_active('public', 'profiles', 'RLS is enabled on public.profiles');
SELECT row_security_active('public', 'publications', 'RLS is enabled on public.publications');
SELECT row_security_active('public', 'publication_members', 'RLS is enabled on public.publication_members');
SELECT row_security_active('public', 'issues', 'RLS is enabled on public.issues');
SELECT row_security_active('public', 'documents', 'RLS is enabled on public.documents');
SELECT row_security_active('public', 'pages', 'RLS is enabled on public.pages');
SELECT row_security_active('public', 'articles', 'RLS is enabled on public.articles');
SELECT row_security_active('public', 'media_assets', 'RLS is enabled on public.media_assets');
SELECT row_security_active('public', 'render_jobs', 'RLS is enabled on public.render_jobs');

-- 3. Required Columns on Profiles
SELECT has_column('public', 'profiles', 'id', 'profiles.id exists');
SELECT has_column('public', 'profiles', 'email', 'profiles.email exists');
SELECT has_column('public', 'profiles', 'is_onboarded', 'profiles.is_onboarded exists');

-- 4. Required Columns on Publications & Members
SELECT has_column('public', 'publications', 'id', 'publications.id exists');
SELECT has_column('public', 'publications', 'name', 'publications.name exists');
SELECT has_column('public', 'publication_members', 'role', 'publication_members.role exists');

-- 5. Required Columns on Issues
SELECT has_column('public', 'issues', 'id', 'issues.id exists');
SELECT has_column('public', 'issues', 'publication_id', 'issues.publication_id exists');
SELECT has_column('public', 'issues', 'issue_number', 'issues.issue_number exists');
SELECT has_column('public', 'issues', 'status', 'issues.status exists');

-- 6. Required Columns on Documents
SELECT has_column('public', 'documents', 'id', 'documents.id exists');
SELECT has_column('public', 'documents', 'publication_id', 'documents.publication_id exists');
SELECT has_column('public', 'documents', 'ast_payload', 'documents.ast_payload exists');
SELECT has_column('public', 'documents', 'locked_by', 'documents.locked_by exists');

-- 7. Required Columns on Pages & Articles
SELECT has_column('public', 'pages', 'id', 'pages.id exists');
SELECT has_column('public', 'pages', 'document_id', 'pages.document_id exists');
SELECT has_column('public', 'pages', 'page_number', 'pages.page_number exists');
SELECT has_column('public', 'articles', 'id', 'articles.id exists');
SELECT has_column('public', 'articles', 'headline', 'articles.headline exists');
SELECT has_column('public', 'articles', 'continued_from_id', 'articles.continued_from_id exists');

-- 8. Required Columns on Media Assets & Render Jobs
SELECT has_column('public', 'media_assets', 'storage_path', 'media_assets.storage_path exists');
SELECT has_column('public', 'media_assets', 'file_size_bytes', 'media_assets.file_size_bytes exists');
SELECT has_column('public', 'render_jobs', 'status', 'render_jobs.status exists');
SELECT has_column('public', 'render_jobs', 'output_format', 'render_jobs.output_format exists');

-- 9. Helper Security Functions Exist (6 functions)
SELECT has_function('public', 'is_publication_member', ARRAY['uuid'], 'Function is_publication_member exists');
SELECT has_function('public', 'is_publication_admin_or_owner', ARRAY['uuid'], 'Function is_publication_admin_or_owner exists');
SELECT has_function('public', 'is_publication_owner', ARRAY['uuid'], 'Function is_publication_owner exists');
SELECT has_function('public', 'is_publication_editor_or_above', ARRAY['uuid'], 'Function is_publication_editor_or_above exists');
SELECT has_function('public', 'is_publication_reporter_or_above', ARRAY['uuid'], 'Function is_publication_reporter_or_above exists');
SELECT has_function('public', 'storage_path_publication_id', ARRAY['text'], 'Function storage_path_publication_id exists');

SELECT * FROM finish();
ROLLBACK;
