# BT3 Test Report

**Course:** Graduation Capstone 1 (Term 1, 2026-2027)
**Student:** Nguyen Pham Quang Thien — **Student ID:** 2374802011250
**Track:** Software Engineering (SE) — **Workflow:** L2
**Command:** `npm test`
**Observed environment:** Windows, Node.js 24.12.0, npm 11.6.2

## Result summary

On the host without a database URL, the suite reported **18 passed, 0 failed, 1 skipped**. After starting Docker, the full suite was run inside the API container with PostgreSQL enabled and reported **19 passed, 0 failed, 0 skipped**. The following 12 scenario-level cases map to the automated assertions; some are sub-scenarios within a single `node:test` declaration.

| ID | Preconditions | Steps | Test data | Expected result | Priority | Actual result | Status |
|---|---|---|---|---|---|---|---|
| TC-01 | Docker app is healthy. | POST login. | `frontdesk` and demo password. | HTTP 200; response identifies username and role `FRONTDESK`. | High | HTTP 200; `frontdesk`, `FRONTDESK`. Report image is cropped to remove the command containing the password. | PASS |
| TC-02 | Frontdesk account exists. | GET customer lookup by phone. | `0901234567`. | HTTP 200; returns customer and device. | High | HTTP 200; Nguyễn Văn A, iPhone 15 Pro Max, `SN12345678`. | PASS |
| TC-03 | Logged in as frontdesk. | POST a warranty ticket. | Customer 1, device 1, valid description, priority `CAO`. | HTTP 201; ticket code, `MOI` status, and SLA deadline are returned. | High | HTTP 201; ticket `BH20261112-001`; status `MOI`; SLA shown. | PASS |
| TC-04 | Docker app is healthy. | POST a ticket with a description at the valid boundary. | `issue_desc: "1234567890"`. | HTTP 201; exactly 10 characters accepted. | Medium | HTTP 201; description `1234567890`. | PASS |
| TC-05 | Docker app is healthy. | POST a ticket with a description below the valid boundary. | `issue_desc: "123456789"`. | HTTP 400; short description rejected. | High | Screenshot shows HTTP 400; response body is not visible. | PASS |
| TC-06 | Docker API container is running. | Run the two SLA tests using a `node --test` name pattern. | Cases crossing closing time/Saturday and excluding Sunday. | Both relevant SLA tests pass without failures. | High | 2 passed, 0 failed; 5 other tests skipped because they do not match the filter. | PASS |
| TC-07 | Logged in as frontdesk. | GET customer lookup with malformed phone. | `0901abc`. | HTTP 400; malformed phone rejected. | High | Screenshot shows HTTP 400; response body is not visible. | PASS |
| TC-08 | Logged in as technician; ticket is `DANG_XU_LY`. | PATCH status to `CHO_LINH_KIEN` without a reason. | Status `CHO_LINH_KIEN`; no reason. | HTTP 400; transition rejected. | High | Screenshot shows HTTP 400; response body is not visible. | PASS |
| TC-09 | Logged in as technician. | PATCH status of a nonexistent ticket. | Ticket ID `999999`. | HTTP 404; ticket not found. | Medium | Screenshot shows HTTP 404. | PASS |
| TC-10 | Logged in as technician. | GET technician 1's queue. | `technician_id: 1`. | HTTP 200; four middle phone digits are masked. | Critical | HTTP 200; phone rendered as `090****567`. | PASS |
| TC-11 | Docker app is healthy. | POST ticket creation without an Authorization header. | No token. | HTTP 401 Unauthorized. | High | Screenshot shows HTTP 401. | PASS |
| TC-12 | PostgreSQL containers are healthy. | Run `npm run db:init` twice, then count rows. | PostgreSQL 16 Compose database and existing baseline. | Both commands succeed; row counts are unchanged. | High | Both runs succeeded; before/after counts `1|1|2|3|3` for customers/devices/technicians/users/tickets. | PASS |

## Additional observed checks

- The PostgreSQL integration test passed inside Docker with `TEST_DATABASE_URL` set.
- An API regression test was added for server-error sanitization. It injects an internal database-style error and confirms the response contains only a generic message; it passed in the observed run.
- The user-provided screenshots for TC-01 through TC-12 are included in `docs/screenshots/BT3/` and in the Word report. Cropped `*-report.png` variants are used where the original image exposed the demo password. Do not distribute original screenshots that show credentials.
- `npm run db:init` was run twice against the Compose database; baseline seed counts remained unchanged.
- A separate clean-machine clone from tag `v1.0` remains outstanding.
