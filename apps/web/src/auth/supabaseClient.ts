import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  isPlaceholderUrl: boolean;
  isPlaceholderKey: boolean;
  isHttpsOrHttp: boolean;
  endpointMasked: string | null;
  errorMessage: string | null;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const hasUrl = Boolean(url && url.trim().length > 0);
  const hasAnonKey = Boolean(key && key.trim().length > 0);
  const isPlaceholderUrl = url.includes('placeholder') || url.includes('your-supabase');
  const isPlaceholderKey = key.includes('placeholder') || key.includes('your-supabase');
  const isHttpsOrHttp = url.startsWith('http://') || url.startsWith('https://');

  const isConfigured = hasUrl && hasAnonKey && !isPlaceholderUrl && !isPlaceholderKey && isHttpsOrHttp;

  let errorMessage: string | null = null;
  if (!isConfigured) {
    if (!hasUrl && !hasAnonKey) {
      errorMessage = 'Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.';
    } else if (!hasUrl) {
      errorMessage = 'Missing VITE_SUPABASE_URL environment variable.';
    } else if (!hasAnonKey) {
      errorMessage = 'Missing VITE_SUPABASE_ANON_KEY environment variable.';
    } else if (isPlaceholderUrl || isPlaceholderKey) {
      errorMessage = 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY contains template placeholder values.';
    } else if (!isHttpsOrHttp) {
      errorMessage = 'VITE_SUPABASE_URL must be a valid http:// or https:// URL.';
    }
  }

  let endpointMasked: string | null = null;
  if (isConfigured && url) {
    try {
      const parsed = new URL(url);
      endpointMasked = parsed.host;
    } catch {
      endpointMasked = 'configured-host';
    }
  }

  return {
    isConfigured,
    hasUrl,
    hasAnonKey,
    isPlaceholderUrl,
    isPlaceholderKey,
    isHttpsOrHttp,
    endpointMasked,
    errorMessage,
  };
}

export const isSupabaseConfigured = getSupabaseConfigStatus().isConfigured;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'epaper_studio_auth_token',
      },
    })
  : null;
