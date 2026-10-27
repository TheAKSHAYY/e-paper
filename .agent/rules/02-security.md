# Security & Compliance Rules

1. **Secrets & Credentials**:
   - Never commit API keys, service role tokens, or private certificates.
   - All external keys must be loaded via typed environment variables (`.env`).
   - Service role keys must ONLY be accessed in backend/worker processes, never bundled into `apps/web`.

2. **Multi-Tenancy & Authorization**:
   - All Supabase database tables must have Row Level Security (RLS) enabled.
   - Enforce organization and user boundaries at the database level, not only in client application code.

3. **Content Sanitization**:
   - User input rendered into HTML/PDF templates must be sanitized to eliminate Cross-Site Scripting (XSS) or Server-Side Request Forgery (SSRF) during Playwright execution.
   - Remote fonts and images must be restricted to allowlisted hostnames or served from internal buckets.
