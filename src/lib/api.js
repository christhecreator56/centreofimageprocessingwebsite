import { supabase, isBackendConfigured } from './supabase';
import { FALLBACK_EVENTS, FALLBACK_PROJECTS, FALLBACK_REPORTS } from './content';

/**
 * Data access for the public site and the admin panel.
 *
 * Reads never throw: if the backend is absent or a query fails, they resolve
 * to the bundled fallback content so the site still renders. Writes do throw —
 * the admin needs to know when a save did not land.
 */

const BUCKET = 'media';

function readOr(fallback) {
  return (result) => {
    if (!result || result.error) {
      if (result?.error) console.warn('[cip] falling back to bundled content:', result.error.message);
      return fallback;
    }
    return result.data?.length ? result.data : fallback;
  };
}

/* ------------------------------- public reads ----------------------------- */

export async function fetchProjects() {
  if (!isBackendConfigured) return FALLBACK_PROJECTS;
  return supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .then(readOr(FALLBACK_PROJECTS));
}

export async function fetchEvents() {
  if (!isBackendConfigured) return FALLBACK_EVENTS;
  return supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .order('event_date', { ascending: true })
    .then(readOr(FALLBACK_EVENTS));
}

export async function fetchReports() {
  if (!isBackendConfigured) return FALLBACK_REPORTS;
  return supabase
    .from('newsletter_reports')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .then(readOr(FALLBACK_REPORTS));
}

/** Returns { ok, demo } — `demo: true` means there was nowhere to store it. */
export async function submitContact({ name, email, interest }) {
  if (!isBackendConfigured) {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, demo: true };
  }
  const { error } = await supabase
    .from('contact_submissions')
    .insert({ name, email, interest: interest || null });
  if (error) throw error;
  return { ok: true, demo: false };
}

/* ------------------------------- admin reads ------------------------------ */

function requireBackend() {
  if (!isBackendConfigured) {
    throw new Error(
      'No Supabase project configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
}

async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export const admin = {
  /* --- session --- */
  async signIn(email, password) {
    requireBackend();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isBackendConfigured) return;
    await supabase.auth.signOut();
  },

  /** Confirms the signed-in user is on the allow-list, not merely authenticated. */
  async isAdmin(userId) {
    if (!isBackendConfigured || !userId) return false;
    const { data, error } = await supabase.from('admins').select('id').eq('id', userId).maybeSingle();
    if (error) return false;
    return Boolean(data);
  },

  /* --- lists (admin sees drafts too) --- */
  listProjects: () => (requireBackend(), unwrap(supabase.from('projects').select('*').order('sort_order'))),
  listEvents: () => (requireBackend(), unwrap(supabase.from('events').select('*').order('event_date'))),
  listReports: () => (requireBackend(), unwrap(supabase.from('newsletter_reports').select('*').order('sort_order'))),
  listSubmissions: () =>
    (requireBackend(),
    unwrap(supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }))),

  /* --- writes --- */
  save: async (table, row) => {
    requireBackend();
    const payload = { ...row };
    delete payload.created_at;
    delete payload.updated_at;
    if (payload.id) {
      const { id, ...rest } = payload;
      return unwrap(supabase.from(table).update(rest).eq('id', id).select().single());
    }
    delete payload.id;
    return unwrap(supabase.from(table).insert(payload).select().single());
  },

  remove: async (table, id) => {
    requireBackend();
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  /* --- storage --- */
  async uploadImage(file, folder = 'uploads') {
    requireBackend();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    // Collision-proof without needing a round trip to check for an existing key.
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '31536000', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
  },

  async removeImage(path) {
    if (!isBackendConfigured || !path) return;
    await supabase.storage.from(BUCKET).remove([path]);
  },
};

export { isBackendConfigured };
