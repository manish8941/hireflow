import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variable getter across Vite browser environment and Node.js test runner
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return String(import.meta.env[key]);
    }
  } catch {
    // Fall back to process.env if available
  }
  try {
    const proc = (globalThis as unknown as { process?: { env?: Record<string, string> } }).process;
    if (proc?.env && proc.env[key]) {
      return String(proc.env[key]);
    }
  } catch {
    // Ignore in non-Node environments
  }
  return '';
};

// Retrieve credentials safely
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL').trim();
const supabaseKey = (
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY')
).trim();

// Check if valid credentials (non-empty and not dummy placeholder) are configured
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseKey) return false;
  if (supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-supabase')) return false;
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
