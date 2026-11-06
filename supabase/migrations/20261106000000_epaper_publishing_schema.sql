-- ====================================================================
-- E-Paper Studio: Phase 3 — Database & Storage Infrastructure
-- Migration: 20261106000000_epaper_publishing_schema.sql
-- ====================================================================
-- Covers:
-- 1. Helper security functions for granular RBAC (Editor, Designer, Reporter)
-- 2. Issues (Daily/Weekly Newspaper Editions)
-- 3. Documents (Editable layout AST, Mastheads, Geometric Canvas configurations)
-- 4. Pages (Individual layout folios, Column grids & Modular sections)
-- 5. Articles (Headlines, Copy, Banners, Byline, Continuation linkages)
-- 6. Media Assets (Photo & Vector catalog metadata referencing Storage)
-- 7. Render Jobs (Queue and execution logs for PDF & E-Ink raster generation)
-- 8. Supabase Storage buckets & Storage RLS policies
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Helper Functions for Role Hierarchies & Storage Path Resolution
-- --------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_publication_editor_or_above(lookup_pub_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.publication_members pm
        WHERE pm.publication_id = lookup_pub_id
        AND pm.user_id = (SELECT auth.uid())
        AND pm.role IN ('owner', 'admin', 'editor', 'designer')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_publication_reporter_or_above(lookup_pub_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.publication_members pm
        WHERE pm.publication_id = lookup_pub_id
        AND pm.user_id = (SELECT auth.uid())
        AND pm.role IN ('owner', 'admin', 'editor', 'designer', 'reporter')
    );
$$;

-- Safely extracts publication UUID from standard storage path prefix ("<pub_id>/<file>")
CREATE OR REPLACE FUNCTION public.storage_path_publication_id(path TEXT)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    first_segment TEXT;
BEGIN
    first_segment := split_part(path, '/', 1);
    RETURN first_segment::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Function access grants
REVOKE EXECUTE ON FUNCTION public.is_publication_editor_or_above(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_publication_editor_or_above(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_publication_reporter_or_above(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_publication_reporter_or_above(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.storage_path_publication_id(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.storage_path_publication_id(TEXT) TO authenticated;

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- --------------------------------------------------------------------
-- 2. Newspaper Issues
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    issue_number TEXT NOT NULL,
    volume_number INT NOT NULL DEFAULT 1 CHECK (volume_number > 0),
    publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL DEFAULT '',
    tagline TEXT,
    cover_summary TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
    total_pages INT NOT NULL DEFAULT 1 CHECK (total_pages > 0),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(publication_id, issue_number, volume_number)
);

CREATE INDEX IF NOT EXISTS idx_issues_pub_date ON public.issues(publication_id, publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_issues_created_by ON public.issues(created_by);

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Issues RLS Policies
CREATE POLICY "Members can view publication issues"
    ON public.issues
    FOR SELECT
    TO authenticated
    USING (public.is_publication_member(publication_id));

CREATE POLICY "Editors and above can create issues"
    ON public.issues
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_publication_editor_or_above(publication_id) AND
        (SELECT auth.uid()) = created_by
    );

CREATE POLICY "Editors and above can update issues"
    ON public.issues
    FOR UPDATE
    TO authenticated
    USING (public.is_publication_editor_or_above(publication_id))
    WITH CHECK (
        public.is_publication_editor_or_above(publication_id) AND
        created_by = (SELECT i.created_by FROM public.issues i WHERE i.id = issues.id)
    );

CREATE POLICY "Owners and Admins can delete issues"
    ON public.issues
    FOR DELETE
    TO authenticated
    USING (public.is_publication_admin_or_owner(publication_id));

DROP TRIGGER IF EXISTS trg_issues_updated_at ON public.issues;
CREATE TRIGGER trg_issues_updated_at
    BEFORE UPDATE ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- --------------------------------------------------------------------
-- 3. Editable Documents & AST Layout Data
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'issue_edition' CHECK (document_type IN ('issue_edition', 'master_template', 'standalone_page')),
    schema_version TEXT NOT NULL DEFAULT '1.1.0' CHECK (schema_version IN ('1.0.0', '1.1.0')),
    page_size_preset TEXT NOT NULL DEFAULT 'broadsheet' CHECK (page_size_preset IN ('broadsheet', 'tabloid', 'berliner', 'a3', 'a4', 'a5', 'custom')),
    orientation TEXT NOT NULL DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
    width_pt NUMERIC(8,2) NOT NULL DEFAULT 1080.00 CHECK (width_pt > 0),
    height_pt NUMERIC(8,2) NOT NULL DEFAULT 1638.00 CHECK (height_pt > 0),
    layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    masthead_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    ast_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number > 0),
    locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_documents_pub ON public.documents(publication_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_issue ON public.documents(issue_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_locked_by ON public.documents(locked_by);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Documents RLS Policies
CREATE POLICY "Members can view publication documents"
    ON public.documents
    FOR SELECT
    TO authenticated
    USING (public.is_publication_member(publication_id));

CREATE POLICY "Editors and Designers can create documents"
    ON public.documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_publication_editor_or_above(publication_id) AND
        (SELECT auth.uid()) = created_by
    );

CREATE POLICY "Editors and Designers can update documents"
    ON public.documents
    FOR UPDATE
    TO authenticated
    USING (public.is_publication_editor_or_above(publication_id))
    WITH CHECK (
        public.is_publication_editor_or_above(publication_id) AND
        publication_id = (SELECT d.publication_id FROM public.documents d WHERE d.id = documents.id)
    );

CREATE POLICY "Owners and Admins can delete documents"
    ON public.documents
    FOR DELETE
    TO authenticated
    USING (public.is_publication_admin_or_owner(publication_id));

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- --------------------------------------------------------------------
-- 4. Newspaper Pages
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    page_number INT NOT NULL CHECK (page_number > 0),
    section_name TEXT NOT NULL DEFAULT 'Front Page',
    layout_mode TEXT NOT NULL DEFAULT 'standard_grid' CHECK (layout_mode IN ('standard_grid', 'free_canvas', 'modular')),
    column_count INT NOT NULL DEFAULT 8 CHECK (column_count BETWEEN 1 AND 12),
    grid_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    sequence_order INT NOT NULL DEFAULT 1 CHECK (sequence_order > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(document_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_pages_doc_seq ON public.pages(document_id, sequence_order ASC);
CREATE INDEX IF NOT EXISTS idx_pages_pub ON public.pages(publication_id);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Pages RLS Policies
CREATE POLICY "Members can view publication pages"
    ON public.pages
    FOR SELECT
    TO authenticated
    USING (public.is_publication_member(publication_id));

CREATE POLICY "Editors and Designers can insert pages"
    ON public.pages
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_publication_editor_or_above(publication_id));

CREATE POLICY "Editors and Designers can update pages"
    ON public.pages
    FOR UPDATE
    TO authenticated
    USING (public.is_publication_editor_or_above(publication_id))
    WITH CHECK (
        public.is_publication_editor_or_above(publication_id) AND
        document_id = (SELECT p.document_id FROM public.pages p WHERE p.id = pages.id)
    );

CREATE POLICY "Editors and Designers can delete pages"
    ON public.pages
    FOR DELETE
    TO authenticated
    USING (public.is_publication_editor_or_above(publication_id));

DROP TRIGGER IF EXISTS trg_pages_updated_at ON public.pages;
CREATE TRIGGER trg_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- --------------------------------------------------------------------
-- 5. Newspaper Articles & Content Blocks
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    subdeck TEXT,
    byline TEXT,
    dateline TEXT,
    body_content TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'minor' CHECK (priority IN ('lead', 'major', 'minor', 'brief')),
    column_span INT NOT NULL DEFAULT 2 CHECK (column_span BETWEEN 1 AND 12),
    row_span INT NOT NULL DEFAULT 2 CHECK (row_span >= 1),
    borders_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    continued_from_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
    continued_to_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
    continuation_page INT,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_articles_doc_page ON public.articles(document_id, page_id);
CREATE INDEX IF NOT EXISTS idx_articles_pub ON public.articles(publication_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_by ON public.articles(created_by);
CREATE INDEX IF NOT EXISTS idx_articles_continued_from ON public.articles(continued_from_id);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles RLS Policies
CREATE POLICY "Members can view publication articles"
    ON public.articles
    FOR SELECT
    TO authenticated
    USING (public.is_publication_member(publication_id));

CREATE POLICY "Reporters and above can create articles"
    ON public.articles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_publication_reporter_or_above(publication_id) AND
        (SELECT auth.uid()) = created_by
    );

CREATE POLICY "Authors or Editors can update articles"
    ON public.articles
    FOR UPDATE
    TO authenticated
    USING (
        (public.is_publication_reporter_or_above(publication_id) AND (SELECT auth.uid()) = created_by) OR
        public.is_publication_editor_or_above(publication_id)
    )
    WITH CHECK (
        (
            (public.is_publication_reporter_or_above(publication_id) AND (SELECT auth.uid()) = created_by) OR
            public.is_publication_editor_or_above(publication_id)
        ) AND
        document_id = (SELECT a.document_id FROM public.articles a WHERE a.id = articles.id)
    );

CREATE POLICY "Authors or Editors can delete articles"
    ON public.articles
    FOR DELETE
    TO authenticated
    USING (
        (public.is_publication_reporter_or_above(publication_id) AND (SELECT auth.uid()) = created_by) OR
        public.is_publication_editor_or_above(publication_id)
    );

DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- --------------------------------------------------------------------
-- 6. Media Asset Metadata
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'epaper-assets' CHECK (storage_bucket IN ('epaper-assets', 'epaper-rendered-pdf', 'epaper-documents')),
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/svg+xml')),
    width_px INT CHECK (width_px > 0),
    height_px INT CHECK (height_px > 0),
    aspect_ratio NUMERIC(5,2),
    caption TEXT,
    credit TEXT,
    alt_text TEXT,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi')),
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(storage_bucket, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_media_pub ON public.media_assets(publication_id);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media_assets(uploaded_by);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Media Assets RLS Policies
CREATE POLICY "Members can view publication media assets"
    ON public.media_assets
    FOR SELECT
    TO authenticated
    USING (public.is_publication_member(publication_id));

CREATE POLICY "Reporters and above can insert media assets"
    ON public.media_assets
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_publication_reporter_or_above(publication_id) AND
        (SELECT auth.uid()) = uploaded_by
    );

CREATE POLICY "Uploaders or Editors can update media assets"
    ON public.media_assets
    FOR UPDATE
    TO authenticated
    USING (
        (public.is_publication_reporter_or_above(publication_id) AND (SELECT auth.uid()) = uploaded_by) OR
        public.is_publication_editor_or_above(publication_id)
    )
    WITH CHECK (
        (
            (public.is_publication_reporter_or_above(publication_id) AND (SELECT auth.uid()) = uploaded_by) OR
            public.is_publication_editor_or_above(publication_id)
        ) AND
        storage_path = (SELECT m.storage_path FROM public.media_assets m WHERE m.id = media_assets.id)
    );

CREATE POLICY "Owners and Admins can delete media assets"
    ON public.media_assets
    FOR DELETE
    TO authenticated
    USING (public.is_publication_admin_or_owner(publication_id));

-- --------------------------------------------------------------------
-- 7. Render Jobs Queue & Output Catalog
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.render_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
    output_format TEXT NOT NULL DEFAULT 'pdf' CHECK (output_format IN ('pdf', 'png_1bit', 'png_8bit', 'svg')),
    target_device TEXT NOT NULL DEFAULT 'print_broadsheet',
    dither_algorithm TEXT NOT NULL DEFAULT 'none' CHECK (dither_algorithm IN ('floyd_steinberg', 'atkinson', 'none')),
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    storage_bucket TEXT NOT NULL DEFAULT 'epaper-rendered-pdf',
    storage_path TEXT,
    file_size_bytes BIGINT,
    page_count INT CHECK (page_count > 0),
    duration_ms INT,
    worker_id TEXT,
    error_message TEXT,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_render_jobs_status_queue ON public.render_jobs(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_render_jobs_doc ON public.render_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_pub ON public.render_jobs(publication_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_requested_by ON public.render_jobs(requested_by);

ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;

-- Render Jobs RLS Policies
CREATE POLICY "Members can view publication render jobs"
    ON public.render_jobs
    FOR SELECT
    TO authenticated
    USING (public.is_publication_member(publication_id));

CREATE POLICY "Reporters and above can request render jobs"
    ON public.render_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_publication_reporter_or_above(publication_id) AND
        (SELECT auth.uid()) = requested_by
    );

CREATE POLICY "Editors and above can update render jobs"
    ON public.render_jobs
    FOR UPDATE
    TO authenticated
    USING (public.is_publication_editor_or_above(publication_id))
    WITH CHECK (
        public.is_publication_editor_or_above(publication_id) AND
        document_id = (SELECT r.document_id FROM public.render_jobs r WHERE r.id = render_jobs.id)
    );

CREATE POLICY "Owners and Admins can delete render jobs"
    ON public.render_jobs
    FOR DELETE
    TO authenticated
    USING (public.is_publication_admin_or_owner(publication_id));

-- --------------------------------------------------------------------
-- 8. Supabase Storage Buckets & Policies
-- --------------------------------------------------------------------

-- Provision storage buckets safely (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    (
        'epaper-assets',
        'epaper-assets',
        TRUE,
        52428800, -- 50 MB
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    ),
    (
        'epaper-rendered-pdf',
        'epaper-rendered-pdf',
        FALSE,
        104857600, -- 100 MB
        ARRAY['application/pdf', 'image/png']
    ),
    (
        'epaper-documents',
        'epaper-documents',
        FALSE,
        20971520, -- 20 MB
        ARRAY['application/json']
    )
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS on storage.objects:
-- Path convention strictly enforces "<publication_id>/<filename>" prefix.

-- 8.1 epaper-assets:
-- Public can view assets if bucket is public, or authenticated publication members
CREATE POLICY "Public and members can view epaper-assets"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'epaper-assets' AND
        (
            (SELECT auth.uid()) IS NULL OR
            public.is_publication_member(public.storage_path_publication_id(name))
        )
    );

-- Editors and Designers can upload/upsert into their publication prefix
CREATE POLICY "Editors can upload publication assets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'epaper-assets' AND
        public.is_publication_editor_or_above(public.storage_path_publication_id(name))
    );

CREATE POLICY "Editors can update publication assets"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'epaper-assets' AND
        public.is_publication_editor_or_above(public.storage_path_publication_id(name))
    )
    WITH CHECK (
        bucket_id = 'epaper-assets' AND
        public.is_publication_editor_or_above(public.storage_path_publication_id(name))
    );

CREATE POLICY "Admins and Owners can delete publication assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'epaper-assets' AND
        public.is_publication_admin_or_owner(public.storage_path_publication_id(name))
    );

-- 8.2 epaper-rendered-pdf:
CREATE POLICY "Members can view rendered publication PDFs"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'epaper-rendered-pdf' AND
        public.is_publication_member(public.storage_path_publication_id(name))
    );

CREATE POLICY "Editors can upload rendered publication PDFs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'epaper-rendered-pdf' AND
        public.is_publication_editor_or_above(public.storage_path_publication_id(name))
    );

CREATE POLICY "Admins and Owners can delete rendered PDFs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'epaper-rendered-pdf' AND
        public.is_publication_admin_or_owner(public.storage_path_publication_id(name))
    );

-- 8.3 epaper-documents:
CREATE POLICY "Members can view backed up document archives"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'epaper-documents' AND
        public.is_publication_member(public.storage_path_publication_id(name))
    );

CREATE POLICY "Editors can save document archives"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'epaper-documents' AND
        public.is_publication_editor_or_above(public.storage_path_publication_id(name))
    );

CREATE POLICY "Admins and Owners can delete document archives"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'epaper-documents' AND
        public.is_publication_admin_or_owner(public.storage_path_publication_id(name))
    );

