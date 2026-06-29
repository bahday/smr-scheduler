# SMR Appointment Scheduler

Internal Service, Maintenance & Repair appointment scheduling system for a fictional roadside assistance company.

---

## How to Run

**Quickest — VS Code (no database install needed):**
Open the repo in VS Code, press **F5**, select **"Full Stack"**. Opens API on http://localhost:5050 and UI on http://localhost:5173 automatically. Uses SQLite, seeded on first run.

**Terminal:**
```bash
cd SmrScheduler.Api && dotnet run        # API on :5050
cd smr-scheduler-ui && npm i && npm run dev  # UI on :5173
```

**Docker (SQL Server):**
```bash
docker compose up --build
```

---

## Stack & Why

| | Choice | Why |
|---|---|---|
| API | ASP.NET Core 8 | Strong typing, EF Core fits naturally, minimal setup |
| DB | SQLite (dev) / SQL Server (Docker) | SQLite needs zero install locally; SQL Server in prod |
| ORM | EF Core 8 code-first | Migrations, LINQ, no raw SQL needed at this scale |
| Frontend | React + Vite + TypeScript | Fast dev loop, type-safe API calls end-to-end |
| Styling | Tailwind CSS v3 | No component library needed, small bundle |

---

## What's Done

- 7 EF Core entities, code-first migrations, auto-migrate + seed on startup
- REST API: slots, appointments (book/detail/notes/status), mechanic view, today's schedule
- Atomic double-booking guard (`UPDATE WHERE IsAvailable=true`, returns 409 on conflict)
- Status transition validation server-side (Scheduled→InProgress→Completed / NoShow)
- Reference numbers: `AA-YYYYMMDD-NNN`, unique DB index
- React SPA: Today's Schedule (admin + mechanic views), Book Appointment (3-step), Appointment Detail
- "Acting as" dropdown — switch between Admin and any Mechanic without auth
- Swagger UI at `/swagger` in dev mode
- Docker: multi-stage builds, SQL Server health check gates API startup
- VS Code: F5 launches full stack

## What's Not Done / Would Do With More Time

- **Auth** — "Acting as" is UI-only; would add JWT or cookie auth
- **Slot regeneration** — slots seed once; would add a nightly background job to create next-day slots
- **Rescheduling / cancellation** — out of scope, obvious next feature
- **Pagination** — schedule and mechanic views load all records; needs paging at scale
- **Tests** — no unit or integration tests; would add xUnit for controllers + React Testing Library for UI
- **Notifications** — no email/SMS on booking

---

## Known Bugs / Rough Edges

- Slots seed relative to "today" — if the DB persists across days, past slots appear. Wipe and restart to regenerate.
- Reference number uses `COUNT+1` in a transaction — race condition under extreme load; unique index catches it but surfaces a 500.
- All times stored in UTC, displayed in `Europe/Dublin` — no timezone selector.

---

## AI Tools Used

Claude (claude-sonnet-4-6 via Claude Code) — used for the full build. See below.

---

## Planning

Wrote a detailed [`PLAN.md`](PLAN.md) upfront covering all 6 phases, every task, and the full commit plan before writing any code. Claude was asked to produce the plan first and wait for approval before starting each phase.

---

## Prompts Used

The session followed a structured approach — one prompt per phase:

1. *"Before writing any code, create a detailed implementation plan… output a markdown file called PLAN.md…"* — full phase/task breakdown with commit plan
2. *"Start phase 1"* through *"Start phase 6"* — each phase was a single instruction; Claude worked through the task list autonomously
3. Corrections made mid-session: switching to .NET 8 (template defaulted to 9), adding SQLite when LocalDB wasn't available, adding VS Code launch config

---

## What I Wrote Myself

- The project brief / requirements (the spec fed to Claude)
- [`PLAN.md`](PLAN.md) prompt — structured to force planning before coding
- Phase-by-phase approval decisions (reviewing each phase before saying "start next phase")
- Corrections when Claude went off-spec (e.g. prompted .NET 8 retargeting, SQLite fallback)
- This section
