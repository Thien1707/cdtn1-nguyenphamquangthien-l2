# BT3 Bug Log

**Student:** Nguyen Pham Quang Thien — **Student ID:** 2374802011250  
**Repository:** https://github.com/Thien1707/cdtn1-nguyenphamquangthien-l2

Only fixes whose source and commit can be checked are counted as completed. A previous draft claimed that commit `20514fd` fixed seed idempotence; inspection shows that commit does not contain a seed SQL file, so that claim is withdrawn and the database issue is not counted as resolved.

## BUG-01 — Major — Technician queue exposed an unmasked customer phone

1. **Detected by:** TC-09 / authorization and data-masking assertions.
2. **Symptom:** A technician queue response could expose the full customer phone instead of masking its middle four digits.
3. **Reproduction:** Authenticate as the seeded `technician` user and request `GET /api/v1/technicians/1/tickets`.
4. **Root cause:** The technician queue response did not consistently transform the customer phone before serialization.
5. **Fix:** Mask the middle four digits before returning technician queue records.
6. **Commit and verification:** [c3a3dc3](https://github.com/Thien1707/cdtn1-nguyenphamquangthien-l2/commit/c3a3dc363724f1971feb9dbc499910bc8f58271b) changes the controller path; the public commit URL was verified and current automated ownership/masking assertions pass.
7. **Status:** Resolved in the referenced repository history.

## BUG-02 — Major — Status transition accepted a missing parts-wait reason

1. **Detected by:** TC-11 / status transition assertions.
2. **Symptom:** A transition to `CHO_LINH_KIEN` could proceed without a meaningful reason.
3. **Reproduction:** Authenticate as the assigned technician and send `PATCH /api/v1/tickets/1/status` with `{"status":"CHO_LINH_KIEN"}` and no `reason`.
4. **Root cause:** The service transition path did not enforce a non-empty reason for the parts-wait state.
5. **Fix:** Validate the reason before writing the status and history record.
6. **Commit and verification:** [116a33f](https://github.com/Thien1707/cdtn1-nguyenphamquangthien-l2/commit/116a33f4638e90bce2db0f2d272b0469bdc8173d) contains the validation; the public commit URL was verified and the current API test verifies the request is rejected and valid transitions are logged.
7. **Status:** Resolved in the referenced repository history.

## BUG-03 — Major — Server errors returned internal exception details

1. **Detected by:** Regression test `server errors do not expose internal error details` added during BT3 work.
2. **Symptom:** Controller catch blocks could return a raw exception message to API clients.
3. **Reproduction:** Cause the ticket-list service to throw an internal error and request `GET /api/v1/tickets`.
4. **Root cause:** Error handlers serialized `error.message` without distinguishing expected client errors from unexpected server errors.
5. **Fix:** Add a shared error responder that preserves client-validation messages but replaces 5xx details with a generic message.
6. **Commit and verification:** Commit [`d1352d5`](https://github.com/Thien1707/cdtn1-nguyenphamquangthien-l2/commit/d1352d58e8ba94484a3afb0f5d963c2bed4ffb0e) contains `src/controllers/error-response.js` and the regression test; the test passed in the full host suite. The commit exists locally; its GitHub URL will be available after it is pushed.
7. **Status:** Resolved in local commit `d1352d5`; not yet published.

## Items not claimed as resolved

- PostgreSQL seed/migration idempotence has not been run against a database in this environment. Although the current seed uses `ON CONFLICT DO NOTHING`, no execution evidence or verified fix commit is available here.
- All three listed fixes have commit references. BUG-03 is in local commit `d1352d5`; publishing that commit is still required before its GitHub link can be verified.
