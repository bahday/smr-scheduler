# SMR Appointment Scheduler — The AA (Internal Tool)

An internal Service, Maintenance & Repair appointment scheduling system for a fictional AA branch network.

---

## How to Run

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose)

### Start everything

```bash
docker compose up --build
```

This single command:
1. Pulls SQL Server 2022 Express and waits for it to be healthy
2. Builds and starts the ASP.NET Core 8 API on **http://localhost:5050**
3. Builds the React UI and serves it via nginx on **http://localhost:5173**
4. On first run the API auto-migrates the database and seeds all reference data + sample appointments

Open **http://localhost:5173** in your browser.

### Stop and clean up

```bash
docker compose down          # stop containers, keep DB volume
docker compose down -v       # stop containers and wipe DB volume
```

### Run without Docker (local dev)

**Prerequisites:** .NET 8 SDK, Node 20+, SQL Server LocalDB

```bash
# Backend
cd SmrScheduler.Api
dotnet run

# Frontend (new terminal)
cd smr-scheduler-ui
npm install
npm run dev
```

The API reads `appsettings.json` for its LocalDB connection string.
The UI reads `VITE_API_URL` from `.env` (defaults to `http://localhost:5050`).

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| API | ASP.NET Core 8 Web API | Strong typing, EF Core integration, minimal boilerplate with primary constructors |
| ORM | Entity Framework Core 8 + SQL Server | Code-first migrations, LINQ queries, no stored procs needed at this scale |
| Database | SQL Server 2022 (Docker) / LocalDB (dev) | Matches common enterprise .NET environments; LocalDB needs zero setup for local dev |
| Frontend | React 18 + Vite + TypeScript | Fast dev server, type safety end-to-end, familiar ecosystem |
| Styling | Tailwind CSS v3 | Utility-first, no component library dependency, keeps bundle small |
| Routing | React Router v6 | Standard SPA routing, minimal API |
| Container | docker compose | Single command to run the full stack; SQL Server health check gates API startup |

---

## What's Done

- **Domain model** — 7 EF Core entities (Branch, Mechanic, ServiceType, Customer, AppointmentSlot, Appointment, WorkNote) with code-first migrations
- **Auto-initialisation** — migrations applied + seed data inserted on first startup; idempotent (checks before seeding)
- **Seed data** — 2 branches, 4 mechanics, 4 service types, 7 weekdays of hourly slots (08:00–17:00), 3 sample appointments with work notes
- **Reference data API** — `GET /api/branches`, `/api/servicetypes`, `/api/mechanics`
- **Slots API** — `GET /api/slots` with branch/service type/date range filters; returns only available slots
- **Appointments API** — `POST /api/appointments` (book), `GET /api/appointments/{id}`, `POST /api/appointments/{id}/notes`, `PUT /api/appointments/{id}/status`
- **Mechanic API** — `GET /api/mechanics/{id}/appointments?date=today|tomorrow`
- **Schedule API** — `GET /api/schedule/today` grouped by mechanic
- **Double-booking guard** — atomic `ExecuteUpdate` (single UPDATE WHERE IsAvailable=true); returns 409 if already taken
- **Reference numbers** — sequential per day, format `AA-YYYYMMDD-NNN`; uniqueness enforced by DB index
- **Status transitions** — validated server-side: Scheduled→InProgress|NoShow, InProgress→Completed; terminal states reject further changes
- **React SPA** — three pages: Today's Schedule (admin + mechanic views), Book Appointment (3-step flow), Appointment Detail
- **"Acting as" context** — dropdown in nav switches between Admin and any Mechanic; persists across page navigation
- **Swagger UI** — available at `http://localhost:5050/swagger` in Development mode

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

- **WDAC (Windows Application Control)** — if running locally on a locked-down Windows machine, the compiled DLLs may be blocked. Use Docker in that case.
- **Slot generation is date-relative** — slots are generated for "next 7 weekdays from today" at seed time. If the app is left running across days without reseeding, old slots will show as past. Re-running `docker compose down -v && docker compose up --build` regenerates them.
- **No slot re-seeding** — the initialiser is intentionally idempotent (skips if any branches exist), so new slots aren't added on subsequent days. A production version would need a background job or admin endpoint.
- **UTC everywhere** — all times stored and returned in UTC. The UI converts to `Europe/Dublin` locale for display, but there's no timezone selector.
- **Reference number race** — the sequential counter uses `COUNT(*) + 1` inside a transaction. Under extreme concurrent load on the same day this could produce duplicates; the unique DB index would catch it and surface a 500. A production fix would use a sequence or retry loop.

---

## AI Tools Used

- **Claude (claude-sonnet-4-6 via Claude Code)** — generated the full solution: architecture planning, all C# entities/controllers/DbContext/seed data, React components/pages/API layer, Dockerfiles, and this README. Prompts were written by the developer; all output was reviewed before committing.

---

## Planning Notes

The project was built in 6 phases following a written `PLAN.md`:

1. **Solution scaffold** — .sln, 3 C# projects, project references, port config
2. **Domain & database** — entities, DbContext, EF migration, seed data initialiser
3. **API layer** — 5 controllers, DTOs, double-booking guard, status transition validation
4. **React frontend** — typed API layer, 3 pages, "Acting as" context, Tailwind styling
5. **Containerisation** — multi-stage Dockerfiles, docker compose with health checks
6. **Polish** — hardened double-booking guard (atomic `ExecuteUpdate`), README

Total git commits: 7 (feat) + 2 (chore).
