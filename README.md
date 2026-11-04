# Taskly — MERN To-Do List

A complete MERN to-do app built for the SDE-1 assessment: create, edit, delete and search
tasks, organise them into Monday→Sunday weeks, and see weekly progress at a glance.
The UI follows the supplied Figma mobile design and extends it into a full desktop layout.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS · Express + Mongoose + Zod · MongoDB

---

## Features

| Requirement | Where it lives |
| --- | --- |
| Create a task (title **required**, description optional, date **and** start time **required**, priority optional) | `client/src/components/TaskModal.tsx`, `server/src/validators/task.validator.js` |
| Edit a task | Pencil icon / task row → same modal in edit mode |
| Delete a task | Trash icon, **swipe the row left**, or the Delete button in the edit sheet |
| Search tasks | Search fields on Home and All Tasks + `GET /api/tasks?search=` |
| Weeks run Monday → Sunday | `client/src/lib/week.ts`, `server/src/utils/date.js` |
| Weekly cards with open/completed counts that expand to show their tasks | `client/src/components/WeekCard.tsx` |
| Mark tasks completed / in progress | Checkbox (completed = filled blue + strikethrough); filters on All Tasks |
| Fully responsive | Mobile-first Figma layout, desktop gets a sidebar + two-column overview |

Extras: optimistic completion toggles with rollback, toasts, keyboard-accessible modal
(Escape to close, focus moves to the title field), skeleton loaders, empty states and
retry when the API is unreachable.

---

## Screens

1. **Onboarding** (`/onboarding`) — blue chevron-pattern hero + "Manage What To Do" panel.
   Shown once, remembered in `localStorage` (`taskly:onboarded`).
2. **Home** (`/`) — search, Sun–Sat style week strip, completion/pending stat cards,
   weekly progress bar, "Tasks Today" list with a floating add button, expandable week cards.
3. **All Tasks** (`/tasks`) — back arrow, global search, All / In progress / Completed filters,
   tasks grouped into week cards.
4. **Add / Edit Task** — bottom sheet on mobile, centered dialog on tablet and desktop.

---

## Project structure

```
.
├── client/                 # React + TypeScript + Tailwind frontend
│   ├── src/components/     # UI: TaskRow, WeekCard, WeekStrip, TaskModal, AppShell…
│   ├── src/context/        # Tasks store, toast queue, modal state
│   ├── src/lib/            # date/week math, API client, classnames
│   └── src/pages/          # Onboarding, Home, AllTasks, NotFound
├── server/                 # Express + Mongoose REST API
│   ├── src/models/         # Task schema (weekStart is derived + indexed)
│   ├── src/controllers/    # list / get / create / update / delete
│   ├── src/validators/     # Zod request validation
│   └── src/config/db.js    # MongoDB connection (or embedded fallback)
├── netlify.toml            # client deploy config (SPA redirect)
└── render.yaml             # API deploy blueprint
```

---

## Running locally

Requires **Node 18.18+**.

```bash
npm install     # installs client + server workspaces
npm run dev     # API on :5000, Vite on :5173
```

Open <http://localhost:5173>.

**No database setup is needed.** If `MONGODB_URI` is not set the API starts an embedded
MongoDB (via `mongodb-memory-server`) and keeps its files in `server/.data/mongo`, so data
survives restarts. The first run downloads the MongoDB binary once (~600 MB).

To use a real database instead:

```bash
cp .env.example .env       # optional, values also read from the shell
# MONGODB_URI=mongodb://127.0.0.1:27017/taskly
```

The first boot on an empty database inserts 13 demo tasks spread over last, this and next
week so every screen has content. Disable with `SEED_DEMO=false`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Run API + client together |
| `npm run dev:server` / `npm run dev:client` | Run one side only |
| `npm run build` | Type-check and build the client into `client/dist` |
| `npm start` | Start the API in production mode |
| `npm run seed` | Insert demo tasks if the database is empty |
| `npm run typecheck` | TypeScript only |

---

## API

Base URL `http://localhost:5000/api`.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/health` | Liveness probe |
| `GET` | `/tasks` | Query: `search`, `status` (`all\|open\|completed`), `week` (any date in the week), `from`, `to` |
| `GET` | `/tasks/:id` | Single task |
| `POST` | `/tasks` | `{ title, dueDate, startTime, description?, endTime?, priority? }` |
| `PATCH` | `/tasks/:id` | Partial update; also `{ completed: true }` |
| `DELETE` | `/tasks/:id` | Removes the task |

Example:

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Doing Homework","dueDate":"2026-11-04","startTime":"16:00","endTime":"18:00","priority":"high"}'
```

Validation failures return `400` with per-field messages, which the form shows inline:

```json
{ "message": "Please check the highlighted fields.", "errors": { "title": "Title is required" } }
```

---

## Design notes

- **Dates are calendar strings** (`YYYY-MM-DD`) and times are `HH:mm`, never timezone-shifted
  `Date` objects, so a task never lands on the wrong day for a user in another timezone.
- `weekStart` (Monday) is derived from `dueDate` in a Mongoose hook and indexed, so weekly
  queries are cheap.
- The client derives weekly buckets and counts from the task list — one source of truth, and
  optimistic updates stay consistent without extra round-trips.
- Palette: brand `#4353E8`, lavender `#E9ECFC`, pink `#FDEAEA`, ink `#131A2E`, muted `#98A2B3`,
  line `#EAECF5`. Type: Poppins (display) + Inter (UI).

---

## Deployment

**API → Render** (`render.yaml` is included): create a Web Service with root directory
`server`, build `npm install`, start `npm start`, and set `MONGODB_URI` (MongoDB Atlas),
`CORS_ORIGIN` (your Netlify URL) and `SEED_DEMO`.

**Client → Netlify** (`netlify.toml` is included): connect the repo, base directory `client`,
build `npm install && npm run build`, publish `dist`. Add the environment variable
`VITE_API_URL=https://<your-api>.onrender.com` and redeploy.

Hard refreshes on `/tasks` work because of the SPA redirect in `netlify.toml`.
