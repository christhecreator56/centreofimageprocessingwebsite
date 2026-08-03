import React, { useCallback, useMemo, useState } from 'react';
import { admin } from '../lib/api';
import { useResource } from './useResource';
import ImageField from './ImageField';
import { Banner, Button, Empty, Field, Input, Panel, Select, Textarea, Toggle } from './ui';

/* -------------------------------------------------------------------------- *
 * Shared row chrome
 * -------------------------------------------------------------------------- */

function Row({ children, onEdit, onDelete, published }) {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-ink/10 bg-background px-4 py-3">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${published ? 'bg-emerald-500' : 'bg-ink/25'}`}
        title={published ? 'Published' : 'Draft'}
      />
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" onClick={onEdit}>Edit</Button>
        <Button variant="danger" onClick={onDelete}>Delete</Button>
      </div>
    </li>
  );
}

function EditorFrame({ title, saving, onCancel, onSave, children }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="mb-6 space-y-4 rounded-2xl border border-ink/15 bg-background p-5"
    >
      <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{title}</h3>
      {children}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function Feedback({ r }) {
  return (
    <>
      <Banner kind="error" onDismiss={() => r.setError('')}>{r.error}</Banner>
      <Banner kind="success" onDismiss={() => r.setNotice('')}>{r.notice}</Banner>
    </>
  );
}

/* -------------------------------------------------------------------------- *
 * Projects
 * -------------------------------------------------------------------------- */

const BLANK_PROJECT = {
  year: String(new Date().getFullYear()),
  category: '',
  title: '',
  description: '',
  image_url: '',
  image_path: null,
  link_url: '',
  sort_order: 0,
  published: true,
};

export function ProjectsAdmin() {
  const loader = useCallback(() => admin.listProjects(), []);
  const r = useResource('projects', loader, BLANK_PROJECT);

  return (
    <Panel title="Applied research" action={<Button onClick={r.startNew}>New project</Button>}>
      <Feedback r={r} />

      {r.draft && (
        <EditorFrame
          title={r.draft.id ? 'Editing project' : 'New project'}
          saving={r.saving}
          onCancel={r.cancel}
          onSave={r.save}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Year">
              <Input value={r.draft.year} onChange={(e) => r.patch({ year: e.target.value })} required />
            </Field>
            <Field label="Category">
              <Input value={r.draft.category} onChange={(e) => r.patch({ category: e.target.value })} required />
            </Field>
            <Field label="Order" hint="Lower shows first">
              <Input
                type="number"
                value={r.draft.sort_order}
                onChange={(e) => r.patch({ sort_order: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Field label="Title">
            <Input value={r.draft.title} onChange={(e) => r.patch({ title: e.target.value })} required />
          </Field>

          <Field label="Description">
            <Textarea value={r.draft.description} onChange={(e) => r.patch({ description: e.target.value })} />
          </Field>

          <ImageField
            value={r.draft.image_url}
            path={r.draft.image_path}
            folder="projects"
            onChange={({ url, path }) => r.patch({ image_url: url, image_path: path })}
          />

          <Field label="Case study link">
            <Input
              type="url"
              placeholder="https://…"
              value={r.draft.link_url || ''}
              onChange={(e) => r.patch({ link_url: e.target.value })}
            />
          </Field>

          <Toggle
            checked={r.draft.published}
            onChange={(v) => r.patch({ published: v })}
            label={r.draft.published ? 'Published' : 'Draft'}
          />
        </EditorFrame>
      )}

      {r.loading ? (
        <Empty>Loading…</Empty>
      ) : r.rows.length === 0 ? (
        <Empty>No projects yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {r.rows.map((row) => (
            <Row key={row.id} published={row.published} onEdit={() => r.startEdit(row)} onDelete={() => r.remove(row)}>
              <p className="truncate text-sm font-medium text-ink">{row.title}</p>
              <p className="truncate text-xs text-muted">
                {row.year} / {row.category}
              </p>
            </Row>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * Events
 * -------------------------------------------------------------------------- */

const KINDS = ['symposium', 'workshop', 'review', 'lecture'];
const ACCENTS = ['emerald', 'cyan', 'purple', 'amber', 'rose', 'yellow'];

const BLANK_EVENT = {
  title: '',
  description: '',
  event_date: new Date().toISOString().slice(0, 10),
  kind: 'symposium',
  accent: 'emerald',
  location: '',
  published: true,
};

export function EventsAdmin() {
  const loader = useCallback(() => admin.listEvents(), []);
  const r = useResource('events', loader, BLANK_EVENT);

  return (
    <Panel title="Events" action={<Button onClick={r.startNew}>New event</Button>}>
      <Feedback r={r} />

      {r.draft && (
        <EditorFrame
          title={r.draft.id ? 'Editing event' : 'New event'}
          saving={r.saving}
          onCancel={r.cancel}
          onSave={r.save}
        >
          <Field label="Title">
            <Input value={r.draft.title} onChange={(e) => r.patch({ title: e.target.value })} required />
          </Field>

          <Field label="Description">
            <Textarea rows={3} value={r.draft.description} onChange={(e) => r.patch({ description: e.target.value })} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date" hint="The calendar month is derived from this">
              <Input
                type="date"
                value={r.draft.event_date}
                onChange={(e) => r.patch({ event_date: e.target.value })}
                required
              />
            </Field>
            <Field label="Kind">
              <Select value={r.draft.kind} onChange={(e) => r.patch({ kind: e.target.value })}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </Select>
            </Field>
            <Field label="Accent">
              <Select value={r.draft.accent} onChange={(e) => r.patch({ accent: e.target.value })}>
                {ACCENTS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Location">
            <Input value={r.draft.location || ''} onChange={(e) => r.patch({ location: e.target.value })} />
          </Field>

          <Toggle
            checked={r.draft.published}
            onChange={(v) => r.patch({ published: v })}
            label={r.draft.published ? 'Published' : 'Draft'}
          />
        </EditorFrame>
      )}

      {r.loading ? (
        <Empty>Loading…</Empty>
      ) : r.rows.length === 0 ? (
        <Empty>No events yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {r.rows.map((row) => (
            <Row key={row.id} published={row.published} onEdit={() => r.startEdit(row)} onDelete={() => r.remove(row)}>
              <p className="truncate text-sm font-medium text-ink">{row.title}</p>
              <p className="truncate text-xs text-muted">
                {row.event_date} · {row.kind}
              </p>
            </Row>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * Newsletter reports
 * -------------------------------------------------------------------------- */

const BLANK_REPORT = {
  slug: '',
  kicker: '',
  title: '',
  image_url: '',
  image_path: null,
  image_alt: '',
  caption: '',
  summary: '',
  published_on: '',
  read_time: '',
  team: '',
  tags: [],
  sort_order: 0,
  published: true,
};

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export function ReportsAdmin() {
  const loader = useCallback(() => admin.listReports(), []);
  const r = useResource('newsletter_reports', loader, BLANK_REPORT);

  return (
    <Panel title="Newsletter reports" action={<Button onClick={r.startNew}>New report</Button>}>
      <Feedback r={r} />

      {r.draft && (
        <EditorFrame
          title={r.draft.id ? 'Editing report' : 'New report'}
          saving={r.saving}
          onCancel={r.cancel}
          onSave={r.save}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={r.draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  // Only auto-fill the slug while it is still untouched, so
                  // renaming a published report never breaks its URL.
                  r.patch(r.draft.id ? { title } : { title, slug: slugify(title) });
                }}
                required
              />
            </Field>
            <Field label="Slug" hint="Unique; used as the record key">
              <Input value={r.draft.slug} onChange={(e) => r.patch({ slug: slugify(e.target.value) })} required />
            </Field>
          </div>

          <Field label="Kicker" hint="e.g. Report / Q2 2026">
            <Input value={r.draft.kicker} onChange={(e) => r.patch({ kicker: e.target.value })} />
          </Field>

          <ImageField
            value={r.draft.image_url}
            path={r.draft.image_path}
            folder="reports"
            onChange={({ url, path }) => r.patch({ image_url: url, image_path: path })}
          />

          <Field label="Image alt text" hint="Describe the picture for screen readers">
            <Input value={r.draft.image_alt} onChange={(e) => r.patch({ image_alt: e.target.value })} />
          </Field>

          <Field label="Caption" hint="The short line shown over the card and in the popup">
            <Textarea rows={2} value={r.draft.caption} onChange={(e) => r.patch({ caption: e.target.value })} />
          </Field>

          <Field label="Summary" hint="Body copy inside the popup">
            <Textarea rows={5} value={r.draft.summary} onChange={(e) => r.patch({ summary: e.target.value })} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Published on"><Input value={r.draft.published_on || ''} onChange={(e) => r.patch({ published_on: e.target.value })} /></Field>
            <Field label="Read time"><Input value={r.draft.read_time || ''} onChange={(e) => r.patch({ read_time: e.target.value })} /></Field>
            <Field label="Team"><Input value={r.draft.team || ''} onChange={(e) => r.patch({ team: e.target.value })} /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tags" hint="Comma separated">
              <Input
                value={(r.draft.tags || []).join(', ')}
                onChange={(e) =>
                  r.patch({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
                }
              />
            </Field>
            <Field label="Order">
              <Input
                type="number"
                value={r.draft.sort_order}
                onChange={(e) => r.patch({ sort_order: Number(e.target.value) })}
              />
            </Field>
          </div>

          <Toggle
            checked={r.draft.published}
            onChange={(v) => r.patch({ published: v })}
            label={r.draft.published ? 'Published' : 'Draft'}
          />
        </EditorFrame>
      )}

      {r.loading ? (
        <Empty>Loading…</Empty>
      ) : r.rows.length === 0 ? (
        <Empty>No reports yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {r.rows.map((row) => (
            <Row key={row.id} published={row.published} onEdit={() => r.startEdit(row)} onDelete={() => r.remove(row)}>
              <p className="truncate text-sm font-medium text-ink">{row.title}</p>
              <p className="truncate text-xs text-muted">{row.kicker}</p>
            </Row>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------------------- *
 * Contact submissions
 * -------------------------------------------------------------------------- */

function toCsv(rows) {
  const header = ['name', 'email', 'interest', 'handled', 'created_at'];
  // Quote everything and double any embedded quotes — names with commas are
  // common enough that a naive join corrupts the file.
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [header.join(','), ...rows.map((r) => header.map((h) => esc(r[h])).join(','))].join('\n');
}

export function SubmissionsAdmin() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await admin.listSubmissions());
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.interest].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    );
  }, [rows, query]);

  const download = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cip-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleHandled = async (row) => {
    // Optimistic: the checkbox should feel instant, and a failure re-syncs.
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, handled: !r.handled } : r)));
    try {
      await admin.save('contact_submissions', { id: row.id, handled: !row.handled });
    } catch (err) {
      setError(err.message || 'Could not update.');
      load();
    }
  };

  return (
    <Panel
      title="Registry submissions"
      action={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={load}>Refresh</Button>
          <Button onClick={download} disabled={!filtered.length}>Export CSV</Button>
        </div>
      }
    >
      <Banner kind="error" onDismiss={() => setError('')}>{error}</Banner>

      <Input
        placeholder="Search name, email or interest…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <Empty>Loading…</Empty>
      ) : filtered.length === 0 ? (
        <Empty>{rows.length ? 'Nothing matches that search.' : 'No submissions yet.'}</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                <th className="py-2 pr-4 font-normal">Name</th>
                <th className="py-2 pr-4 font-normal">Email</th>
                <th className="py-2 pr-4 font-normal">Interest</th>
                <th className="py-2 pr-4 font-normal">Received</th>
                <th className="py-2 font-normal">Handled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-ink/5 align-top">
                  <td className="py-3 pr-4 text-ink">{row.name}</td>
                  <td className="py-3 pr-4">
                    <a href={`mailto:${row.email}`} className="text-ink underline decoration-ink/30 underline-offset-4">
                      {row.email}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-muted">{row.interest || '—'}</td>
                  <td className="py-3 pr-4 text-muted">
                    {new Date(row.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={row.handled}
                      onChange={() => toggleHandled(row)}
                      aria-label={`Mark ${row.name} handled`}
                      className="h-4 w-4 accent-current"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        {filtered.length} of {rows.length} shown.
      </p>
    </Panel>
  );
}
