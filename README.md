# SMR Appointment Scheduler — The AA (Internal Tool)

An internal Service, Maintenance & Repair appointment scheduling system for a fictional AA branch network.

---

## How to Run

### Option 1 — VS Code (recommended for local dev)

**Prerequisites:** .NET 8 SDK, Node 20+, VS Code with the [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit) extension

1. Open the repo root in VS Code
2. Press **F5** and select **"Full Stack"** from the Run & Debug dropdown

This starts both simultaneously:
- API on **http://localhost:5050** (debugger attached)
- UI dev server on **http://localhost:5173** (browser opens automatically)

The API uses SQLite for local dev — the database file (`smr-scheduler.db`) is created automatically on first run and seeded with sample data. No database install required.

> **Swagger UI** is available at http://localhost:5050/swagger in Development mode.

---

### Option 2 — Terminal

```bash
# Terminal 1 — API (SQLite, auto-migrates and seeds on first run)
cd SmrScheduler.Api
dotnet run

# Terminal 2 — UI
cd smr-scheduler-ui
npm install   # first time only
npm run dev
```

---

### Option 3 — Docker (SQL Server)

**Prerequisites:** Docker Desktop running

```bash
docker compose up --build
```

This single command:
1. Pulls SQL Server 2022 Express and waits for it to be healthy
2. Builds and starts the API on **http://localhost:5050**
3. Builds the React UI and serves it via nginx on **http://localhost:5173**
4. Auto-migrates and seeds the database on first run

```bash
docker compose down      # stop, keep data
docker compose down -v   # stop and wipe database
```

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| API | ASP.NET Core 8 Web API | Strong typing, EF Core integration, minimal boilerplate with primary constructors |
| ORM | Entity Framework Core 8 | Code-first migrations, LINQ queries, no stored procs needed at this scale |
| Database | SQLite (local dev) / SQL Server 2022 (Docker) | SQLite needs zero install for local dev; SQL Server in Docker matches production environments |
| Frontend | React 18 + Vite + TypeScript | Fast dev server, type safety end-to-end, familiar ecosystem |
| Styling | Tailwind CSS v3 | Utility-first, no component library dependency, keeps bundle small |
| Routing | React Router v6 | Standard SPA routing, minimal API |
| Container | docker compose | Single command to run the full stack; SQL Server health check gates API startup |

---

## What's Done

- **Domain model** — 7 EF Core entities (Branch, Mechanic, ServiceType, Customer, AppointmentSlot, Appointment, WorkNote) with code-first migrations
- **Auto-initialisation** — migrations applied + seed data inserted on first startup; idempotent (skips if already seeded)
- **Seed data** — 2 branches, 4 mechanics, 4 service types, 7 weekdays of hourly slots (08:00–17:00), 3 sample appointments with work notes
- **Reference data API** — `GET /api/branches`, `/api/servicetypes`, `/api/mechanics`
- **Slots API** — `GET /api/slots` with branch/service type/date range filters; returns only available slots
- **Appointments API** — `POST /api/appointments` (book), `GET /api/appointments/{id}`, `POST /api/appointments/{id}/notes`, `PUT /api/appointments/{id}/status`
- **Mechanic API** — `GET /api/mechanics/{id}/appointments?date=today|tomorrow`
- **Schedule API** — `GET /api/schedule/today` grouped by mechanic
- **Double-booking guard** — atomic `ExecuteUpdate` (single `UPDATE WHERE IsAvailable=true`); returns 409 if already taken
- **Reference numbers** — sequential per day, format `AA-YYYYMMDD-NNN`; uniqueness enforced by DB index
- **Status transitions** — validated server-side: Scheduled→InProgress|NoShow, InProgress→Completed; terminal states reject further changes
- **React SPA** — three pages: Today's Schedule (admin + mechanic views), Book Appointment (3-step flow), Appointment Detail
- **"Acting as" context** — dropdown in nav switches between Admin and any Mechanic; persists across page navigation
- **Dual database support** — SQLite for local dev, SQL Server for Docker/production; provider auto-detected from connection string

## What's Not Done (Out of Scope)

- Authentication / authorisation — the "Acting as" dropdown is a UI-only convenience
- Email or SMS notifications on booking
- Rescheduling or cancelling appointments
- Recurring appointments
- Payments
- Mobile-optimised UI (responsive but not mobile-first)
- Pagination on the schedule/mechanic views

---

## Known Rough Edges

- **Slot generation is date-relative** — slots are seeded for "next 7 weekdays from today" at first run. If the database persists across days without reseeding, slots will appear in the past. Wipe and restart (`docker compose down -v && docker compose up --build`, or delete `smr-scheduler.db`) to regenerate.
- **No ongoing slot generation** — the initialiser is intentionally idempotent; new slots aren't added on subsequent days. A production version would need a background job or admin endpoint.
- **UTC everywhere** — all times stored and returned in UTC. The UI converts to `Europe/Dublin` locale for display, but there's no timezone selector.
- **Reference number race** — the sequential counter uses `COUNT(*) + 1` inside a transaction. Under extreme concurrent load on the same day this could produce a collision; the unique DB index would catch it and surface a 500. A production fix would use a DB sequence or retry loop.

---

## AI Tools Used

- **Claude (claude-sonnet-4-6 via Claude Code)** — generated the full solution: architecture planning, all C# entities/controllers/DbContext/seed data, React components/pages/API layer, Dockerfiles, VS Code config, and this README. Prompts were written by the developer; all output was reviewed before committing.

---

## Planning Notes

The project was built in 6 phases following a written [`PLAN.md`](PLAN.md):

1. **Solution scaffold** — .sln, 3 C# projects, project references, port config
2. **Domain & database** — entities, DbContext, EF migration, seed data initialiser
3. **API layer** — 5 controllers, DTOs, double-booking guard, status transition validation
4. **React frontend** — typed API layer, 3 pages, "Acting as" context, Tailwind styling
5. **Containerisation** — multi-stage Dockerfiles, docker compose with health checks
6. **Polish** — hardened double-booking guard (atomic `ExecuteUpdate`), SQLite local dev support, VS Code launch config, README
