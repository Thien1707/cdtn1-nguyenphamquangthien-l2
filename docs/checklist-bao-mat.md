# BT3 Security Self-Assessment

**Course:** Graduation Capstone 1 (Term 1, 2026-2027)  
**Student:** Nguyen Pham Quang Thien — **Student ID:** 2374802011250  
**Track:** SE — **Workflow:** L2

Statuses are evidence-based. "Partial / not verified" is intentional where the required command or environment was unavailable.

| # | Security check | Status | Evidence / limitation |
|---:|---|---|---|
| 1 | No production secrets in the repository or Git history | **PARTIAL** | `git ls-files .env src/.env` and `git log --all -- .env src/.env` returned no tracked environment file/history entry. `.dockerignore` excludes local `.env` files from the build context. The Compose database credential is a public local-demo credential, not a production secret; a full secret scan of all repository history has not been run. |
| 2 | Application-layer input validation | **DONE** | `src/services/ticket.service.js` validates phone numbers, required fields, descriptions, priorities, transitions, technician levels, and ownership. `npm test` covers invalid phone/description, assignment, and status-reason cases. |
| 3 | Role and owner access control (OWASP A01) | **DONE** | `src/middleware/auth.js`, `src/routes/ticket.routes.js`, and `src/services/ticket.service.js` enforce roles and technician ownership. The API test rejects an attempt to access another technician's queue and denies an unassigned technician access to status logs. |
| 4 | Password and sensitive-data handling | **PARTIAL** | `src/services/auth.service.js` hashes created passwords with bcrypt; `src/db/seed.sql` stores bcrypt hashes; the technician queue masks the middle four phone digits. Password-hash-at-rest and response-redaction checks were not run against PostgreSQL in this environment. |
| 5 | Error responses do not disclose internal details | **DONE FOR TESTED CONTROLLERS** | Regression test `server errors do not expose internal error details` injects an internal database-style exception into `GET /api/v1/tickets`; response is HTTP 500 with a generic message and no exception text. Other routes should be reviewed when added. |
| 6 | Logs avoid secrets and unnecessary personal data | **NOT VERIFIED** | No runtime log-capture review was performed. `src/db/pool.js` logs PostgreSQL error messages; review the actual deployment logs before claiming this criterion is complete. |
| 7 | Dependencies are locked and basic vulnerability checks run | **PARTIAL** | `package-lock.json` and `npm ci` are used. `npm audit --omit=dev` reported 0 vulnerabilities after pinning `body-parser` 2.4.0 and `qs` 6.17.1 via `package.json` overrides. Full `npm audit` still reports 2 moderate issues through the development-only `nodemon` → `minimatch` dependency; the suggested forced fix would downgrade nodemon outside the declared range and was not applied. |

## Operational notes

- The Compose database credential is intended only for the isolated local demonstration network; PostgreSQL is not published to a host port.
- The API container generates a random JWT secret when `JWT_SECRET` is absent. Configure a durable secret through the deployment environment for any persistent deployment.
- Docker image and containers were started and checked in this workspace; a clean-machine clone from tag `v1.0` remains outstanding.
