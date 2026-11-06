-- ====================================================================
-- E-Paper Studio: Authentication, User Profiles, Publications & RBAC
-- Migration: 20261104000000_auth_and_profiles.sql
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Define Publication Roles ENUM
DO $$ BEGIN
    CREATE TYPE publication_role AS ENUM (
        'owner',
        'admin',
        'editor',
        'designer',
        'reporter',
        'viewer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    primary_language TEXT NOT NULL DEFAULT 'en' CHECK (primary_language IN ('en', 'hi')),
    preferred_page_size TEXT NOT NULL DEFAULT 'broadsheet' CHECK (preferred_page_size IN ('broadsheet', 'tabloid', 'berliner', 'a3', 'a4')),
    is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on email for fast profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies:
-- Users can view ONLY their own profile
-- Uses (SELECT auth.uid()) scalar subquery for optimizer InitPlan caching (O(1) vs O(N))
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

-- Users can update ONLY their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- NOTE: Direct client INSERT on public.profiles is disallowed by default (no INSERT policy).
-- New profile rows are provisioned strictly via the secure public.handle_new_user() trigger.

-- 4. Publications Table
CREATE TABLE IF NOT EXISTS public.publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tagline TEXT,
    primary_language TEXT NOT NULL DEFAULT 'en' CHECK (primary_language IN ('en', 'hi')),
    preferred_page_size TEXT NOT NULL DEFAULT 'broadsheet',
    logo_url TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_publications_created_by ON public.publications(created_by);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- 5. Publication Members (RBAC Mapping)
CREATE TABLE IF NOT EXISTS public.publication_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role publication_role NOT NULL DEFAULT 'editor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(publication_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pub_members_user ON public.publication_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pub_members_publication ON public.publication_members(publication_id);
CREATE INDEX IF NOT EXISTS idx_pub_members_user_role ON public.publication_members(user_id, role);

ALTER TABLE public.publication_members ENABLE ROW LEVEL SECURITY;

-- 5.1 Helper Security Definer Functions for Clean & Recursion-Free RLS Evaluation
-- These functions run with SECURITY DEFINER and SET search_path = public, allowing RLS
-- policies on publications and publication_members to evaluate access in O(1) without
-- recursive self-queries (preventing PostgreSQL SQLSTATE 42P17).

CREATE OR REPLACE FUNCTION public.is_publication_member(lookup_pub_id UUID)
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
    );
$$;

CREATE OR REPLACE FUNCTION public.is_publication_admin_or_owner(lookup_pub_id UUID)
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
        AND pm.role IN ('owner', 'admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_publication_owner(lookup_pub_id UUID)
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
        AND pm.role = 'owner'
    );
$$;

-- Restrict function execution: only authenticated users may call helper functions
REVOKE EXECUTE ON FUNCTION public.is_publication_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_publication_member(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_publication_admin_or_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_publication_admin_or_owner(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_publication_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_publication_owner(UUID) TO authenticated;

-- Publications RLS Policies:
-- Members can view publications they belong to
CREATE POLICY "Members can view publications they belong to"
    ON public.publications
    FOR SELECT
    TO authenticated
    USING (public.is_publication_member(id));

-- Owners and Admins can update their publication metadata
CREATE POLICY "Owners and Admins can update their publication"
    ON public.publications
    FOR UPDATE
    TO authenticated
    USING (public.is_publication_admin_or_owner(id))
    WITH CHECK (
        public.is_publication_admin_or_owner(id) AND
        created_by = (SELECT p.created_by FROM public.publications p WHERE p.id = publications.id)
    );

-- Owners can delete their publication
CREATE POLICY "Owners can delete their publication"
    ON public.publications
    FOR DELETE
    TO authenticated
    USING (public.is_publication_owner(id));

-- Authenticated users can create publications
CREATE POLICY "Users can create publications"
    ON public.publications
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = created_by);

-- Publication Members RLS Policies:
-- Members can view membership rosters in publications they belong to
CREATE POLICY "Members can view membership records in their publications"
    ON public.publication_members
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id OR
        public.is_publication_member(publication_id)
    );

-- Owners and Admins can add members (admins cannot assign owner role)
CREATE POLICY "Owners and Admins can add members"
    ON public.publication_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_publication_owner(publication_id) OR
        (public.is_publication_admin_or_owner(publication_id) AND role != 'owner')
    );

-- Owners and Admins can update member roles
CREATE POLICY "Owners and Admins can update member roles"
    ON public.publication_members
    FOR UPDATE
    TO authenticated
    USING (
        public.is_publication_owner(publication_id) OR
        (public.is_publication_admin_or_owner(publication_id) AND role != 'owner')
    )
    WITH CHECK (
        publication_id = publication_members.publication_id AND
        user_id = publication_members.user_id AND
        (
            public.is_publication_owner(publication_id) OR
            (public.is_publication_admin_or_owner(publication_id) AND role != 'owner')
        )
    );

-- Removal policy with strict anti-privilege escalation:
-- 1. Non-owners can voluntarily remove themselves (leave).
-- 2. Owners can remove any member (except self-removal if sole owner).
-- 3. Admins can only remove non-owners/non-admins.
CREATE POLICY "Owners, Admins, or self can remove members"
    ON public.publication_members
    FOR DELETE
    TO authenticated
    USING (
        ((SELECT auth.uid()) = user_id AND role != 'owner') OR
        (public.is_publication_owner(publication_id) AND (SELECT auth.uid()) != user_id) OR
        (public.is_publication_admin_or_owner(publication_id) AND role NOT IN ('owner', 'admin'))
    );

-- 6. Trigger to automatically provision profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        primary_language,
        is_onboarded
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'primary_language', 'en'),
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Revoke default public execution from trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Trigger to automatically provision owner role in publication_members upon publication creation
CREATE OR REPLACE FUNCTION public.handle_new_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.publication_members (
        publication_id,
        user_id,
        role
    ) VALUES (
        NEW.id,
        NEW.created_by,
        'owner'
    )
    ON CONFLICT (publication_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Revoke default public execution from trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_publication() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_publication_created ON public.publications;
CREATE TRIGGER on_publication_created
    AFTER INSERT ON public.publications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_publication();
