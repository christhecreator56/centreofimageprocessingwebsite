import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { admin, isBackendConfigured } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useTheme } from '../components/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';
import { Banner, Button, Field, Input, Panel } from './ui';
import { EventsAdmin, ProjectsAdmin, ReportsAdmin, SubmissionsAdmin } from './sections';

const TABS = [
  { to: '/admin', label: 'Projects', end: true },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/reports', label: 'Newsletter' },
  { to: '/admin/submissions', label: 'Submissions' },
];

/* -------------------------------------------------------------------------- */

function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Panel title="Backend not configured">
        <p className="mb-4 text-sm leading-relaxed text-muted">
          The console needs a Supabase project. Create one, run{' '}
          <code className="rounded bg-ink/10 px-1.5 py-0.5 text-ink">supabase/schema.sql</code> in the
          SQL editor, then copy <code className="rounded bg-ink/10 px-1.5 py-0.5 text-ink">.env.example</code>{' '}
          to <code className="rounded bg-ink/10 px-1.5 py-0.5 text-ink">.env</code> and fill in:
        </p>
        <pre className="overflow-x-auto rounded-xl border border-ink/10 bg-background p-4 text-xs text-ink">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
        </pre>
        <p className="mt-4 text-sm text-muted">
          The public site keeps working without this — it renders its bundled content instead.
        </p>
        <div className="mt-6">
          <Link to="/"><Button variant="ghost">Back to site</Button></Link>
        </div>
      </Panel>
    </div>
  );
}

function Login({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = await admin.signIn(email, password);
      if (!(await admin.isAdmin(user.id))) {
        // Authenticating is not the same as being allowed in: the account has
        // to be on the allow-list, or every signed-up user would get a console.
        await admin.signOut();
        throw new Error('That account is not an administrator.');
      }
      onSignedIn(user);
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">CIP // Console</p>
        <h1 className="mb-8 text-3xl font-medium tracking-tighter text-ink">Sign in</h1>

        <Banner kind="error" onDismiss={() => setError('')}>{error}</Banner>

        <div className="space-y-4">
          <Field label="Email">
            <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" disabled={busy}>{busy ? 'Checking…' : 'Enter'}</Button>
          <Link to="/" className="text-xs uppercase tracking-widest text-muted hover:text-ink">
            Back to site
          </Link>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function Admin() {
  const [session, setSession] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  useTheme(); // re-render on theme change so tokens stay in sync

  // The public site hides the OS cursor for its custom one. The console has no
  // custom cursor, so it has to hand the real one back.
  useEffect(() => {
    const prev = document.body.style.cursor;
    document.body.style.cursor = 'auto';
    return () => {
      document.body.style.cursor = prev;
    };
  }, []);

  useEffect(() => {
    if (!isBackendConfigured) {
      setChecking(false);
      return;
    }
    let alive = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      const user = data.session?.user ?? null;
      setSession(user);
      setAllowed(user ? await admin.isAdmin(user.id) : false);
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!alive) return;
      const user = s?.user ?? null;
      setSession(user);
      setAllowed(user ? await admin.isAdmin(user.id) : false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await admin.signOut();
    setSession(null);
    setAllowed(false);
  }, []);

  if (!isBackendConfigured) {
    return <div className="min-h-screen bg-background text-ink"><SetupNotice /></div>;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-xs uppercase tracking-[0.3em] text-muted">
        Verifying session…
      </div>
    );
  }

  if (!session || !allowed) {
    return (
      <div className="min-h-screen bg-background text-ink">
        <Login onSignedIn={(u) => { setSession(u); setAllowed(true); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-4">
          <Link to="/" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted hover:text-ink">
            CIP // Console
          </Link>
          <span className="flex-1" />
          <span className="hidden text-xs text-muted sm:block">{session.email}</span>
          <ThemeToggle />
          <Button variant="ghost" onClick={signOut}>Sign out</Button>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 pb-3">
          {TABS.map((tab) => {
            const active = tab.end ? location.pathname === tab.to : location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${
                  active ? 'bg-ink text-background' : 'text-muted hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <Routes>
          <Route index element={<ProjectsAdmin />} />
          <Route path="events" element={<EventsAdmin />} />
          <Route path="reports" element={<ReportsAdmin />} />
          <Route path="submissions" element={<SubmissionsAdmin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
