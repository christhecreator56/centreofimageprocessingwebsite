-- ============================================================================
-- Centre of Image Processing — database schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New
-- query → paste → Run). It is idempotent: re-running it will not duplicate
-- data or error on objects that already exist.
--
-- Design notes
--   * Everything the public site reads is gated on `published`, so the admin
--     can draft a row without it appearing on the live site.
--   * Writes are restricted to rows in `admins`. Membership is granted by
--     hand (see the bottom of this file) — there is deliberately no
--     self-service signup path to the admin table.
--   * `contact_submissions` is the one table the anonymous role may INSERT
--     into, and it may never read back from it.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Who is allowed to administer the site
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allow-list of auth users who may write content. Add rows manually.';

-- Helper used by every write policy. SECURITY DEFINER so the policy check can
-- read `admins` without the caller needing select rights on it, and pinned to
-- an empty search_path so it cannot be hijacked by a shadowed table name.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

-- Keeps updated_at honest without the client having to remember.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Applied research projects  (the sticky card stack / mobile carousel)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  year        text        not null,
  category    text        not null,
  title       text        not null,
  description text        not null default '',
  image_url   text,
  image_path  text,                       -- storage object path, for cleanup
  link_url    text,
  sort_order  integer     not null default 0,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_order_idx
  on public.projects (published, sort_order, created_at desc);

-- ---------------------------------------------------------------------------
-- Calendar events
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_kind') then
    create type public.event_kind as enum ('symposium', 'workshop', 'review', 'lecture');
  end if;
end $$;

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  description text        not null default '',
  -- A real date, rather than the month/day-offset structure the static site
  -- used: the calendar grid is derived on the client, so admins only ever
  -- pick a date and the layout follows.
  event_date  date        not null,
  kind        public.event_kind not null default 'symposium',
  accent      text        not null default 'emerald',
  location    text,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (published, event_date);

-- ---------------------------------------------------------------------------
-- Newsletter reports  (cards + the detail popup)
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_reports (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  kicker       text        not null default '',
  title        text        not null,
  image_url    text,
  image_path   text,
  image_alt    text        not null default '',
  caption      text        not null default '',   -- short line shown on hover
  summary      text        not null default '',   -- body of the popup
  published_on text,                              -- display string, e.g. 'June 2026'
  read_time    text,
  team         text,
  tags         text[]      not null default '{}',
  sort_order   integer     not null default 0,
  published    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists reports_order_idx
  on public.newsletter_reports (published, sort_order, created_at desc);

-- ---------------------------------------------------------------------------
-- Contact form submissions  (write-only for the public)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  interest   text,
  handled    boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists submissions_recent_idx
  on public.contact_submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

drop trigger if exists reports_touch on public.newsletter_reports;
create trigger reports_touch before update on public.newsletter_reports
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Row level security
-- ============================================================================
alter table public.admins              enable row level security;
alter table public.projects            enable row level security;
alter table public.events              enable row level security;
alter table public.newsletter_reports  enable row level security;
alter table public.contact_submissions enable row level security;

-- admins: you may see your own row (so the app can confirm you are an admin),
-- and nobody may write through the API at all.
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select using (id = auth.uid());

-- Content: world-readable when published, admin-readable always, admin-writable.
do $$
declare t text;
begin
  foreach t in array array['projects', 'events', 'newsletter_reports'] loop
    execute format('drop policy if exists "public reads published" on public.%I', t);
    execute format($f$
      create policy "public reads published" on public.%I
        for select using (published or public.is_admin())
    $f$, t);

    execute format('drop policy if exists "admins insert" on public.%I', t);
    execute format($f$
      create policy "admins insert" on public.%I
        for insert with check (public.is_admin())
    $f$, t);

    execute format('drop policy if exists "admins update" on public.%I', t);
    execute format($f$
      create policy "admins update" on public.%I
        for update using (public.is_admin()) with check (public.is_admin())
    $f$, t);

    execute format('drop policy if exists "admins delete" on public.%I', t);
    execute format($f$
      create policy "admins delete" on public.%I
        for delete using (public.is_admin())
    $f$, t);
  end loop;
end $$;

-- Submissions: anyone may drop one in the box; only admins may look inside.
drop policy if exists "anyone submits" on public.contact_submissions;
create policy "anyone submits" on public.contact_submissions
  for insert with check (true);

drop policy if exists "admins read submissions" on public.contact_submissions;
create policy "admins read submissions" on public.contact_submissions
  for select using (public.is_admin());

drop policy if exists "admins update submissions" on public.contact_submissions;
create policy "admins update submissions" on public.contact_submissions
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete submissions" on public.contact_submissions;
create policy "admins delete submissions" on public.contact_submissions
  for delete using (public.is_admin());

-- ============================================================================
-- Storage: a public bucket for project / report imagery
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- ============================================================================
-- Seed — the content the static site shipped with.
-- Safe to re-run: each insert is keyed on something unique.
-- ============================================================================
insert into public.projects (year, category, title, description, image_url, sort_order)
values
  ('2026', 'Architecture', 'Project Genesis',
   'Real-time multispectral satellite imaging analysis utilizing quantum-inspired neural networks to map topographical anomalies.',
   'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80', 1),
  ('2025', 'Automation', 'Ocular V2',
   'Automated defect detection in micro-manufacturing pipelines. Capable of analyzing 10,000 components per minute with zero false positives.',
   'https://images.unsplash.com/photo-1616161560417-66d4db528429?auto=format&fit=crop&w=1200&q=80', 2),
  ('2024', 'Medical', 'Neural Mesh',
   'High-fidelity 3D reconstruction of cellular structures from 2D electron microscopy scans, revolutionizing non-invasive diagnostics.',
   'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', 3)
on conflict do nothing;

insert into public.events (title, description, event_date, kind, accent)
values
  ('Edge AI Benchmark',        'Comparative latency and compute testing of real-time vision pipelines.',              date '2026-07-10', 'symposium', 'purple'),
  ('Optical Flow Workshop',    'Collaborative session designing dense pixel flow motion estimators.',                 date '2026-07-24', 'workshop',  'amber'),
  ('Quantum Imaging Symposium','Annual gathering of lead researchers discussing photon-level image reconstruction.',   date '2026-08-15', 'symposium', 'emerald'),
  ('Project Genesis Review',   'Quarterly internal review of the Genesis architecture and performance metrics.',      date '2026-08-28', 'review',    'cyan'),
  ('Neural Fields Masterclass','Deep dive into coordinate-based neural representations and volumetric rendering.',     date '2026-09-08', 'workshop',  'rose'),
  ('CIP Advisory Meeting',     'Bi-annual review panel evaluating funding, patents, and paper submissions.',          date '2026-09-22', 'review',    'yellow')
on conflict do nothing;

insert into public.newsletter_reports
  (slug, kicker, title, image_url, image_alt, caption, summary, published_on, read_time, team, tags, sort_order)
values
  ('ocular-v2', 'Report / Q2 2026', 'Ocular V2 Launch Highlights',
   'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
   'Researcher at a workstation reviewing defect-detection output',
   'Bench run of the V2 inference head, taken during the final calibration pass before deployment.',
   'The second generation of our defect-detection stack moved inference to the edge, cutting round-trip latency to under a millisecond and removing the cloud dependency entirely. This report walks through the calibration methodology, the false-positive audit across 40,000 sample components, and what the line operators told us after four weeks of live use.',
   'June 2026', '12 min', 'Perception Systems',
   array['Edge inference', 'Quality control', 'Benchmarks'], 1),
  ('vision-conference', 'Retrospective / 2025', 'Annual Vision Conference Post-Mortem',
   'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&q=80',
   'Auditorium during a conference keynote session',
   'Closing keynote of the 2025 programme, where the open dataset release was announced.',
   'Three days, nineteen talks, and the first public release of our annotated urban-scene dataset. This retrospective covers what landed, what did not, the attendance and submission numbers against the previous two years, and the format changes we are carrying into the next edition.',
   'December 2025', '9 min', 'Programme Committee',
   array['Events', 'Open data', 'Community'], 2)
on conflict (slug) do nothing;

-- ============================================================================
-- Granting yourself admin access
-- ============================================================================
-- 1. Dashboard → Authentication → Users → "Add user", set an email + password
--    and tick "Auto Confirm User".
-- 2. Run the statement below with that email. It is the only step that
--    creates an admin, on purpose — there is no signup form.
--
--   insert into public.admins (id, email)
--   select id, email from auth.users where email = 'you@example.com'
--   on conflict (id) do nothing;
-- ============================================================================
