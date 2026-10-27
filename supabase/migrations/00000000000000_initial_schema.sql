-- ====================================================================
-- E-Paper Studio: Initial Schema Migration Placeholder
-- Migration: 00000000000000_initial_schema.sql
-- ====================================================================
-- Note: Setup only. Schema implementation deferred to product feature phase.
-- Planned entities:
-- 1. profiles & organizations (multitenancy, RBAC)
-- 2. publications & issues (e-paper content, edition trees)
-- 3. templates (layout geometry, AST definitions)
-- 4. render_jobs (worker queue status, rendered asset URLs)
-- 5. subscriptions (Stripe customer/subscription mapping)
-- 6. Storage buckets: epaper-documents, epaper-rendered-pdf, epaper-fonts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
