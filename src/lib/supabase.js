import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True when the project has been pointed at a Supabase instance.
 *
 * The public site has to keep working without one — a fresh clone, a
 * reviewer running `npm run dev`, or a build where the env vars were not
 * wired up should still render the site from its bundled content rather
 * than showing empty sections. Every read in `api.js` falls back on this.
 */
export const isBackendConfigured = Boolean(url && anonKey);

export const supabase = isBackendConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'cip-admin-auth',
      },
    })
  : null;

export default supabase;
