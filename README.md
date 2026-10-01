# Our Sunset

A once-a-day shared sunset. One question, one answer per person, floating into a small illustrated world.

- `index.html` — the whole front end (no build step, no framework).
- `netlify/functions/` — the backend: three small serverless functions talking to a Postgres database.
- `schema.sql` — the two tables the app needs.

## Deploy on Netlify

1. **Database.** In the Netlify dashboard, open this site → **Data & storage → Database** and provision **Netlify DB** if you haven't (you already have one). Open its **SQL console** and run everything in `schema.sql` once, to create the `responses` and `reactions` tables.
2. **Env vars.** Netlify DB sets `NETLIFY_DATABASE_URL` for you automatically. Add one more, in **Site configuration → Environment variables**:
   - `ADMIN_TOKEN` — any password you choose, used to unlock `#admin`.
3. **Deploy.** Push this repo to GitHub and connect it in Netlify (or drag-and-drop the folder in the Netlify UI). Netlify reads `netlify.toml`, installs `@neondatabase/serverless` from `package.json`, and publishes `index.html` plus the three functions under `/.netlify/functions/*` (mapped to `/api/*`).

That's it — no separate server to run.

## How the pieces fit together
- `index.html` calls `/api/responses`, `/api/reactions`, `/api/admin` with `fetch`.
- `netlify/functions/responses.js` — `GET ?day=YYYY-MM-DD&userId=…` returns that day's visible answers plus whether *you* already answered; `POST` submits one answer (the database itself rejects a second one per person per day via a unique constraint).
- `netlify/functions/reactions.js` — `POST` records or updates one reaction per person per response.
- `netlify/functions/admin.js` — requires the `x-admin-token` header to match `ADMIN_TOKEN`; lists, hides, or deletes responses. Visiting `#admin` in the app prompts for that password once per browser session (stored only in `sessionStorage`) and unlocks the dashboard — there's no visible admin button anywhere in the normal UI.

## If responses aren't saving, or you see a 404 for `responses`/`reactions`/`admin`
The front end calls Netlify's function URLs directly — `/.netlify/functions/responses`,
`/.netlify/functions/reactions`, `/.netlify/functions/admin`, `/.netlify/functions/health`
— which Netlify serves automatically for every deployed function, with no redirect rule
required. (`/api/*` still works too, via `netlify.toml` and `_redirects`, as a convenience —
but the app itself no longer depends on it.)

If you still get a 404 on those `/.netlify/functions/...` paths, the functions themselves
aren't deployed. Check, in the Netlify dashboard:
1. **Site → Functions tab.** If `responses`, `reactions`, `admin`, `health` aren't listed
   there at all, they never built. The most common cause is deploying by dragging a folder
   into Netlify instead of connecting the GitHub repo — a drag-and-drop deploy doesn't run
   `npm install`, so the function's one dependency (`@neondatabase/serverless`) is missing
   and the function fails to bundle. Fix: connect this repo via **Add new site → Import an
   existing project → GitHub**, so Netlify runs the build itself.
2. **Deploys tab → your latest deploy → deploy log.** Look for a "Functions bundling" step
   and any error mentioning `@neondatabase/serverless` or a missing module.
3. Make sure you've actually triggered a fresh deploy after pushing this code (a stale
   deploy from before these files existed will 404 for all of the above) — the
   **"Relaunch to update"** / **Trigger deploy** button in the dashboard does this.

Once functions are listed and deployed, visit `/.netlify/functions/health` to check the
database connection and whether the tables exist — see the next section.

## If the database itself is the problem

## Local testing
```
npm install
npx netlify dev
```
This runs the functions locally against your real Netlify DB (via `netlify link` first, so it can read your env vars).

## GitHub Pages workflow
`.github/workflows/pages.yml` still publishes `index.html` as a static preview if you push to `main`, but GitHub Pages can't run the `netlify/functions/` backend — a copy deployed there runs in local-only mode (per-browser answers, mock community, no `#admin`). Netlify is the one place this app is fully live.
