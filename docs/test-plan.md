# BT3 Test Plan

**Course:** Graduation Capstone 1 (Term 1, 2026-2027)  
**Student:** Nguyen Pham Quang Thien — **Student ID:** 2374802011250  
**Track:** Software Engineering (SE) — **Workflow:** L2, Warranty Request Intake and Triage

## 1. Scope

### In scope

- Authentication, role authorization, and technician ownership checks.
- Customer and device lookup and CRUD API workflows.
- Ticket creation, required fields, description length, unique code generation, and priority-to-SLA mapping.
- Business-hour SLA calculations across closing time, Saturday, Sunday, and configured holidays.
- Technician assignment, status transitions, status history, and overdue reporting.
- Safe API error responses and repeatability of the automated test command.

### Deliberately out of scope

- Browser compatibility, visual design, and usability testing beyond the API contract.
- Load, stress, penetration, and external-integration testing; these are outside this prototype assignment.
- PostgreSQL persistence in this run because neither a PostgreSQL client/server nor a running Docker daemon is available. The PostgreSQL integration test is retained but skipped unless `TEST_DATABASE_URL` is provided.

## 2. Test levels and selection

The repository uses Node.js built-in `node:test`. The current suite has **7 service/unit declarations, 11 in-memory API declarations, and 1 conditional PostgreSQL integration declaration** (19 total; 18 pass and 1 skipped in this environment):

- **Unit/service:** SLA arithmetic, validation, ticket code uniqueness, and business rules.
- **API/integration:** Express routes, authentication, authorization, CRUD, and response contracts, using the in-memory repository.
- **Database integration:** PostgreSQL persistence test enabled with `TEST_DATABASE_URL` inside the Compose network.
- **Repeatability:** run the complete suite against PostgreSQL and run `npm run db:init` twice; compare seeded row counts.

Boundary-value analysis covers 9 versus 10 characters for `issue_desc`, business-hours closing, and Sunday/holiday skipping. Equivalence classes cover valid/invalid phone numbers, roles, status transitions, and priorities.

## 3. Measurable exit criteria

- `npm test` reports **0 failures**; all executable tests pass.
- The same test command produces the same pass/skip totals on a second run.
- Each implemented L2 rule in scope has at least one assertion.
- Invalid input returns a client error and a useful message; missing resources return 404; unauthenticated/unauthorized requests return 401/403.
- Technician requests for another technician's queue or unassigned ticket data are denied.
- Server errors do not return internal exception details.
- PostgreSQL persistence test passes against the Compose database.
- Two consecutive `npm run db:init` executions succeed and leave baseline row counts unchanged.

## 4. Environment and fixtures

- **Observed run:** Windows, Node.js 24.12.0, npm 11.6.2, Node test runner.
- **Supported package/runtime baseline:** Node.js 20+; Docker image uses `node:20-alpine`; PostgreSQL image uses `postgres:16-alpine`.
- **Executed data:** repository's in-memory fixtures, including manager/front-desk/technician accounts and seeded customer/device/ticket records.
- **Database integration:** PostgreSQL 16 Compose service, reached through `TEST_DATABASE_URL`.
- **Cleanup:** API tests use the in-memory driver. The PostgreSQL integration test removes records it creates in its `finally` path.

## Coverage limitation

The Compose build, container health, PostgreSQL integration test, and seed re-initialization have been verified in this workspace. A separate clean-machine clone/test and BT3 screenshots have not been produced. The conditional PostgreSQL integration test uses the local Compose database, not an isolated disposable database.
