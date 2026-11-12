# AI Tool Use Disclosure — BT3

**Course:** Graduation Capstone 1 (Term 1, 2026-2027)
**Student:** Nguyen Pham Quang Thien — **Student ID:** 2374802011250
**Track:** Software Engineering (SE) — **Workflow:** L2

| Tool | Purpose | Files or functions affected | How the work was checked |
|---|---|---|---|
| Gemini / ChatGPT (BT1) | Suggested the SRS structure, diagrams, and initial SQL outline. | `docs/srs.md`, original Draw.io files. | Compared with the case study and instructor feedback recorded in `docs/thay-doi-thiet-ke.md`. |
| Cursor AI (BT2) | Assisted with CRUD, the API client, tests, and technical-document drafts. | Service/controller/repository files, `src/public/api/client.js`, BT2 documentation. | Ran the BT2 test suite at the time and manually reviewed changes. |
| Copilot AI assistant in VS Code (BT3) | Reviewed the supplied BT3 assignment against the repository; helped identify inaccurate claims, update deployment/security/test documentation, add server-error response sanitization and a regression test, pin safe runtime dependencies, fix the PostgreSQL test cleanup, and draft this report. | `.dockerignore`, `Dockerfile`, `docker-compose.yml`, `package.json`, `package-lock.json`, `scripts/docker-entrypoint.sh`, `src/controllers/error-response.js`, controller files, `tests/*`, `docs/*`, and `scripts/build_bt3_report_docx.py`. | Ran the container suite with PostgreSQL (19 pass, 0 fail, 0 skipped), ran `npm run db:init` twice and checked seed counts, confirmed healthy containers and HTTP health response, `npm audit --omit=dev` (0 vulnerabilities), and full `npm audit` (2 moderate dev-dependency findings). |

## Student responsibility

AI assistance does not replace the student's understanding or verification. Review every submitted test and document, rerun the documented checks, and correct this disclosure if any tool or validation detail is inaccurate.

## Commitment

I am responsible for the submitted work. AI-generated suggestions were reviewed and changed as needed; claims that could not be independently verified are explicitly marked as pending or unverified.

**BT3 disclosure date:** 13 November 2026
