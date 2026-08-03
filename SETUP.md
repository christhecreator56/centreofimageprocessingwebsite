# Backend & admin setup

The public site runs with **no backend at all** — it falls back to the content
bundled in `src/lib/content.js`. Everything below is what turns that static
content into something you can edit from `/admin`.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Any region; the
   free tier is plenty.
2. Wait for it to finish provisioning (~2 min).

## 2. Create the schema

Open **SQL Editor → New query**, paste the entire contents of
[`supabase/schema.sql`](supabase/schema.sql), and hit **Run**.

That single file creates:

| Object | What it is |
| --- | --- |
| `projects` | Applied-research cards |
| `events` | Calendar entries (a real `date` — the calendar grid is derived from it) |
| `newsletter_reports` | Report cards and their popup detail |
| `contact_submissions` | "Join the Matrix" form entries |
| `admins` | Allow-list of accounts that may write |
| `media` bucket | Storage for uploaded images |

It also enables row-level security on every table and seeds the content the
static site shipped with, so the site looks identical the moment you connect it.

It is safe to re-run — every statement is idempotent.

## 3. Make yourself an admin

**Authentication → Users → Add user.** Set an email and password, and tick
**Auto Confirm User**.

Then run this in the SQL editor with that email:

```sql
insert into public.admins (id, email)
select id, email from auth.users where email = 'you@example.com'
on conflict (id) do nothing;
```

This is the only way to create an admin, deliberately — there is no signup
form, so a stranger cannot grant themselves write access.

## 4. Point the app at it

**Project Settings → API**, then:

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Add `.env` to your
`.gitignore` if it isn't already.

Both values are safe in the browser: the anon key only ever gets the access
that the RLS policies allow it, which is "read published rows, insert one
contact submission". Everything else requires a session belonging to a row in
`admins`.

```bash
npm install
npm run dev
```

Visit `/admin`, sign in, and you're editing the live site.

---

## Security model in one paragraph

Every table has RLS on. The anonymous role can `select` rows where
`published = true`, and can `insert` into `contact_submissions` — it cannot
read submissions back, so the form can't be used to harvest the list. All
writes, and reads of unpublished drafts, go through `public.is_admin()`, which
checks the caller's `auth.uid()` against the `admins` table. That function is
`security definer` with a pinned `search_path` so the policy check can't be
subverted by a shadowed table. Storage follows the same shape: the `media`
bucket is world-readable but admin-write.

## Deploying

The admin lives at `/admin` in the same single-page app, so the host has to
serve `index.html` for unknown paths or a refresh on `/admin` 404s.

- **Netlify** — `public/_redirects` is already in the repo and handles it.
- **Vercel** — add a `vercel.json` with a rewrite of `/(.*)` → `/index.html`.
- **GitHub Pages** — copy `dist/index.html` to `dist/404.html` after building.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
in the host's dashboard; Vite inlines them at build time, so you must rebuild
after changing them.

## Notes

- **Deleting a row also deletes its uploaded image** from the bucket, but only
  if the image was uploaded rather than pasted in as a URL — `image_path` is
  what distinguishes the two.
- **Unpublishing** is safer than deleting for anything you might want back: the
  admin still sees drafts, the public site doesn't.
- The **contact form works without a backend too** — it simulates success so
  the page can be demoed offline. Check the `demo` flag from `submitContact()`
  if you ever want to surface that difference in the UI.
