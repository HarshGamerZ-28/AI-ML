# AIML Club — GEC Ajmer

A full client-server rebuild of the club site: FastAPI backend, Next.js (React + TypeScript +
Tailwind + Framer Motion) frontend.

## Stack, and why

- **Backend — FastAPI + SQLite (SQLAlchemy).** Fast to run locally, no separate database server
  to install, and swapping SQLite for Postgres later is a one-line change to `DATABASE_URL`.
- **Frontend — Next.js + Framer Motion + Lenis.** Client-side routing means navigating between
  pages never reloads the page, which is what actually makes a site feel fast — no server round
  trip, no white flash. Framer Motion's `whileInView` drives every scroll reveal (it's a real
  `IntersectionObserver` under the hood, so it's cheap and doesn't run when nothing is animating).
  Lenis smooths the scroll wheel itself.

## Running it locally

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

First run creates `club.db` (SQLite) and seeds it automatically with demo members, events,
gallery items, achievements, and notices, plus one admin account:

```
username: admin
password: admin123
```

**Change that password before this goes anywhere near the internet** — there's no UI for it yet,
so either update it directly in the database or add a "change password" endpoint before deploying.

Copy `.env.example` to `.env` if you want to set a real `SECRET_KEY` or configure SMTP for the
broadcast-email feature (see below). Without SMTP configured, that feature still works — it just
reports that it isn't configured instead of sending anything.

API docs (interactive, auto-generated): `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local     # points the frontend at the backend
npm run dev
```

Visit `http://localhost:3000`.

For a production-like run: `npm run build && npm start`.

## Site structure

Almost everything lives on one continuously-scrolling homepage — Home, About, Events, Gallery,
Team, Projects, Achievements, Notices, and Join are all sections on `/`, linked via the header's
anchor nav (`/#events`, `/#gallery`, etc.), which scroll-spies the current section with a real
`IntersectionObserver`. Only content that genuinely needs its own page is a separate route:

| Page | Route |
|---|---|
| Home (with every section above) | `/` |
| Event detail (about, schedule, gallery highlights, register) | `/events/[slug]` |
| Shareable event registration page | `/register/[slug]` |
| Notice detail (with a PDF download link, if one was attached) | `/notices/[id]` |
| Member detail (photo, professional details, skills, about) | `/team/[id]` |
| Admin: edit a single member | `/mission-control/members/[id]` |

An event's "View full gallery" link goes to `/?event=<id>#gallery` — the gallery section reads
that query param to pre-filter, then the page scrolls to it. (That section needs `useSearchParams`,
which forces it into a Suspense boundary, so its content isn't in the very first server-rendered
HTML; there's a small client-side effect on the homepage that waits for it to mount before doing
the scroll, so the deep link still lands in the right place.)

## Member and admin access — hidden, not linked anywhere

There is **no visible link** to either login system anywhere in the header, footer, or any public
page. You have to know the URL:

- **Admin panel:** `/mission-control` (login at `/mission-control/login`)
- **Member portal:** `/crew-deck`

Rename either folder under `frontend/app/` any time you want a different (or more obscure) path —
the route guard lives in `app/mission-control/layout.tsx` and moves with the folder. As before:
**the JWT login is the real protection; the URL being unlisted only keeps it off search engines and
out of casual clicking.** Don't treat the hidden path itself as security.

From the panel:
- **Overview** — member/event/gallery counts, pending approvals at a glance, and the broadcast
  email tool (sends to every unique email across members, join requests, and event registrations —
  requires SMTP env vars, see `.env.example`).
- **Members** — approve/reject join requests, approve/reject member-submitted profile update
  requests (see below), toggle the **Admin** tag per member, edit or remove members. The Admin tag
  is only ever rendered on the frontend when the *viewer* is logged in as an admin — a regular
  visitor looking at `/team/[id]` never sees it, logged-in or not, unless they themselves have an
  admin session.
- **Events** — create/edit with a schedule editor (add/remove agenda rows inline), delete, see
  registration counts per event.
- **Achievements** — approve/reject member submissions, delete.
- **Gallery** — upload images or videos (optionally tagged to an event), delete.
- **Notices** — create/edit/delete.

## Member accounts (separate from admin)

`/crew-deck` is a second, independent login system for existing club members — separate JWTs, separate
token storage, and a member's token is rejected by every `/mission-control/*` page and every
`/admin/*` API route (checked by role claim,
not just by which table the row came from). A member can sign up, log in, and submit a request to
change their own `bio`, `skills`, `github_url`, or `linkedin_url` — nothing else, and nothing is
written to the database until an admin approves it from the Members tab.

If someone signs up with an email that already exists as a plain roster entry (added by an admin
with no login yet), signup attaches a password to that existing record instead of creating a
duplicate.

## Event registration links

Every event detail page links to `/register/[slug]` — a minimal, standalone form built specifically
to be sent directly (WhatsApp, email, a poster QR code) without anyone needing to land on the main
site first. Submissions land in the `event_registrations` table and show up as a count in the admin
Events editor; there's no dedicated admin UI to browse individual registrations yet beyond the
count — pull them via `GET /events/{id}/registrations` (admin token required) or add a table to the
admin events page if you want to see them inline.

## Broadcast email

`POST /admin/broadcast-email` collects every distinct email address across members, join requests,
and event registrations, and sends via SMTP using credentials from environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourclub@gmail.com
SMTP_PASSWORD=an-app-password       # not your normal password, for Gmail specifically
SMTP_FROM=yourclub@gmail.com
```

Until those are set, the endpoint responds successfully with `configured: false` and a message
explaining why nothing was sent — it never fails loudly or silently drops the request.

## Projects section

A `Project` has a title, description, category, comma-separated tech stack, an optional repo/demo
link, and a live/deployed flag. Public list at `GET /projects`, full CRUD under admin →
**Projects**. Shown as a horizontal draggable rail on the homepage, between Team and Achievements.

## Notice PDF attachments

The admin notice form has a file input that accepts PDFs only (rejected server-side too, not just
in the browser). It uploads immediately to `POST /notices/upload-attachment`, gets back a URL, and
that URL rides along with the rest of the notice's fields when you hit Save. The public notice
detail page (`/notices/[id]`) shows a **Download PDF** button whenever one is attached.

## Bulk gallery import

Uploading event photos one at a time doesn't scale, so the admin Gallery page has three tabs:

- **Single file** — the original one-at-a-time uploader.
- **Zip of files** — upload one `.zip`, and every image/video inside it becomes its own gallery
  item automatically (anything else in the zip — `readme.txt`, macOS's `__MACOSX/` junk, etc. — is
  silently skipped). Tested with a real zip containing 3 images + 1 video + 2 non-media files:
  correctly imported 4, skipped 1 (the `__MACOSX` entry isn't even counted, it's just ignored).
- **Paste a link** — give it a direct download link to a zip, or a Google Drive share link, and the
  backend downloads and extracts it the same way. Be clear-eyed about what this can and can't do:
  it fetches **one shared zip file**, not a Drive *folder listing* — browsing a folder needs the
  Drive API with real OAuth credentials, which is a much bigger integration than "paste a link."
  For Drive links specifically, sharing has to be set to "Anyone with the link," and large files can
  hit Drive's virus-scan interstitial page instead of serving the raw file — if that happens, the
  error message says so and tells you to fall back to downloading the zip yourself and using the
  Zip tab. The URL-parsing logic (converting a normal Drive share link into its direct-download
  form) is unit-tested; the actual network fetch obviously can't be tested from a sandboxed
  environment with no general internet access, but it's the exact same download-and-extract code
  path already proven against a real zip in the upload tab.

## What's intentionally out of scope for this pass

- No password-reset flow for members or the admin account.
- No pagination — fine for a club-sized dataset, would need adding well before thousands of rows.
- No image resizing/compression on gallery upload — files are stored as-is.
- No automated tests. The backend was verified with live HTTP smoke tests covering every endpoint
  (auth, role isolation, CRUD, approval flows) during development; a `tests/` folder with `pytest`
  would be the natural next step before this handles real traffic.
