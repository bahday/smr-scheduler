# Project: SMR Appointment Scheduler

### Stack
- Backend: ASP.NET Core 8 Web API (C#)
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Database: SQL Server (Docker) via EF Core code-first
- Containerisation: docker-compose

---

## Phase 1 — Solution Scaffold

Tasks:
- [ ] Create solution folder structure: /SmrScheduler.Api, /SmrScheduler.Core, /SmrScheduler.Infrastructure, /smr-scheduler-ui
- [ ] Initialise .NET solution file and add projects
- [ ] Add project references (Api → Core + Infrastructure, Infrastructure → Core)
- [ ] Configure launchSettings.json — API on port 5050

---

## Phase 2 — Domain & Database

Tasks:
- [ ] Define entities in SmrScheduler.Core/Entities: Branch, ServiceType, Mechanic, Customer, AppointmentSlot, Appointment, WorkNote
- [ ] Add enums: AppointmentStatus (Scheduled, InProgress, Completed, NoShow)
- [ ] Create SmrScheduler.Infrastructure/Data/AppDbContext with all DbSets and relationships
- [ ] Add EF Core + SQL Server NuGet packages
- [ ] Create initial migration
- [ ] Write DbInitialiser: auto-migrate on startup + seed data (2 branches, 4 mechanics, 4 service types, slots for next 7 days 08:00–17:00 hourly, 3 sample appointments)

---

## Phase 3 — API Layer

Tasks:
- [ ] Register DbContext, CORS (allow http://localhost:5173), Swagger in Program.cs
- [ ] Call DbInitialiser from Program.cs on startup
- [ ] ReferenceDataController: GET /api/branches, GET /api/servicetypes, GET /api/mechanics
- [ ] SlotsController: GET /api/slots?branchId&serviceTypeId&fromDate&toDate — return only available slots
- [ ] AppointmentsController:
      POST /api/appointments — validate slot available, create customer+appointment, mark slot unavailable, return reference number (format: AA-YYYYMMDD-NNN)
      GET  /api/appointments/{id} — return appointment with customer, slot, work notes
      POST /api/appointments/{id}/notes — add WorkNote with timestamp
      PUT  /api/appointments/{id}/status — update AppointmentStatus; return 400 if invalid transition
- [ ] MechanicsController: GET /api/mechanics/{id}/appointments?date=today|tomorrow
- [ ] ScheduleController: GET /api/schedule/today — all today's appointments grouped by mechanic

---

## Phase 4 — React Frontend

Tasks:
- [ ] Scaffold Vite + React + TypeScript project in /smr-scheduler-ui
- [ ] Install and configure Tailwind CSS
- [ ] Install React Router v6
- [ ] Create api.ts service layer (typed fetch wrappers for every endpoint)
- [ ] Create types.ts with TypeScript interfaces matching API DTOs
- [ ] Implement "Acting As" context (React context + dropdown in nav — select mechanic or admin)
- [ ] Layout component with top nav showing current user + nav links
- [ ] Page: Home / Today's Schedule (/)
      Admin view: appointments table grouped by mechanic
      Mechanic view: own today + tomorrow appointments as cards
- [ ] Page: Book Appointment (/book)
      Step 1: branch + service type selectors → load slot grid
      Step 2: slot picker (calendar-style grid, next 7 days)
      Step 3: customer details form (name, phone, vehicle reg, notes)
      Confirmation screen: reference number + summary card
- [ ] Page: Appointment Detail (/appointments/:id)
      Customer info + vehicle + service type + status badge
      Status action buttons (contextual: Start Work / Complete / No Show)
      Work notes timeline (newest first, timestamped)
      Add work note form

---

## Phase 5 — Containerisation

Tasks:
- [ ] Dockerfile for SmrScheduler.Api (multi-stage: sdk build → aspnet runtime)
- [ ] Dockerfile for smr-scheduler-ui (node build → nginx serve)
- [ ] docker-compose.yml: sql-server, api, ui services with correct env vars + depends_on + health checks
- [ ] Verify single command: docker-compose up --build brings up full stack

---

## Phase 6 — Polish & Docs

Tasks:
- [ ] README.md: how to run, stack choice, done/not done, known issues, AI tools used, planning notes
- [ ] Review all API responses for consistent error shapes (ProblemDetails)
- [ ] Double-booking guard: pessimistic — check + update slot in a single transaction
- [ ] Confirm reference number uniqueness (sequential per day)
- [ ] Out of scope (document, do not implement): auth, email/SMS, rescheduling, recurring, payments

---

## Commit Plan

```
feat: scaffold solution structure and projects
feat: add domain entities and EF Core DbContext
feat: add migrations and seed data initialiser
feat: implement reference data and slots API
feat: implement appointments API with double-booking guard
feat: implement mechanic and schedule API endpoints
feat: scaffold React app with routing and API service layer
feat: implement home and today schedule page
feat: implement booking flow with slot picker and confirmation
feat: implement appointment detail with work notes and status updates
feat: add Dockerfiles and docker-compose
docs: add README
```
