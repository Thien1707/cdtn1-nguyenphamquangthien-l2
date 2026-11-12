# API Reference

**Service:** Mekong Mobile Smart CRM — L2  
**Base URL:** `http://localhost:8000` in Docker; API routes use `/api/v1`.  
**Authentication:** `Authorization: Bearer <JWT>` except `GET /health` and `POST /api/v1/auth/login`. JWT lifetime is 8 hours. Roles are `FRONTDESK`, `MANAGER`, and `TECHNICIAN`.

All examples below were captured from the in-memory Express API with the repository's sample fixture on 13 November 2026. JWTs are omitted. IDs and timestamps can differ between runs.

## Response conventions

Success responses use `{"status":"success","data":...}`; ticket status updates also return `log`. Expected errors use `{"status":"fail","message":"..."}`. Validation errors are generally 400, unauthenticated requests are 401, role/ownership denials are 403, missing resources are 404, and duplicate records are 409. Unexpected server errors return a generic message, not the underlying exception.

## Endpoint reference

| Method and path | Business purpose | Authentication | Parameters and request body | Successful response | Error responses | Example request → observed response |
|---|---|---|---|---|---|---|
| `GET /health` | Container/API health probe. | None | None | 200; `status`, `uptime`, `timestamp`. | 500 if the service fails. | `GET /health` → `{"status":"healthy","uptime":0.96,"timestamp":"<ISO-8601>"}` |
| `POST /api/v1/auth/login` | Issue an 8-hour JWT. | None | JSON: `username`, `password`. | 200; token and user claims. | 400 missing fields; 401 invalid credentials. | `{"username":"manager","password":"Welcome123!"}` → 200; user role `MANAGER`, token omitted. |
| `GET /api/v1/auth/me` | Return the authenticated token claims. | Any valid role | None | 200; user claims and JWT timestamps. | 401 missing/invalid/expired token. | `Authorization: Bearer <JWT>` → 200; `{"username":"manager","role":"MANAGER",...}` |
| `POST /api/v1/auth/users` | Create an account. | `MANAGER` | JSON: `username` (>=3 chars), `password` (>=10 chars), `role`; `technician_id` required for a technician. | 201; user ID, username, role, technician ID; no password hash. | 400 invalid fields; 401/403 auth; 409 duplicate username. | `{"username":"apidoc-user","password":"ExamplePassword123!","role":"FRONTDESK"}` → 201; `{"user_id":4,"username":"apidoc-user","role":"FRONTDESK","technician_id":null}` |
| `GET /api/v1/tickets` | List tickets for reception/management. | `FRONTDESK`, `MANAGER` | None | 200; array of tickets with customer/device summary. | 401/403; 500 generic internal error. | `GET /api/v1/tickets` → 200; first item includes `ticket_code:"BH20261019-001"` and customer fields. |
| `POST /api/v1/tickets` | Create a warranty ticket and calculate SLA. | `FRONTDESK`, `MANAGER` | JSON: `customer_id`, `device_id`, `center_id`, `issue_desc` (>=10 trimmed chars), `priority` (`CAO`, `TRUNG_BINH`, `THAP`); optional `issue_category`. | 201; ticket including generated code, `MOI`, timestamps, SLA. | 400 invalid fields/priority/device; 401/403. | `{"customer_id":1,"device_id":501,"center_id":1,"issue_desc":"API example screen issue","priority":"CAO"}` → 201; status `MOI`, code generated. |
| `GET /api/v1/customers/search?phone={phone}` | Find a customer by phone and list devices. | `FRONTDESK`, `MANAGER` | Query: `phone` (10 digits). | 200; customer and devices. | 400 invalid phone; 404 absent customer (includes `next_action: CREATE_CUSTOMER`); 401/403. | `GET .../customers/search?phone=0901234567` → 200; customer `Nguyễn Văn A`, device serial `SN12345678`. |
| `GET /api/v1/customers` | List customers. | `FRONTDESK`, `MANAGER` | None | 200; customer array. | 401/403; 500 generic internal error. | `GET .../customers` → 200; first customer ID `1`. |
| `GET /api/v1/customers/{customerId}` | Read one customer and associated devices. | `FRONTDESK`, `MANAGER` | Path: `customerId`. | 200; customer object. | 404 missing customer; 401/403. | `GET .../customers/1` → 200; phone `0901234567`. |
| `POST /api/v1/customers` | Create a customer. | `FRONTDESK`, `MANAGER` | JSON: `full_name`, `phone`; optional `email`, `address`. | 201; created customer and empty devices array. | 400 invalid fields; 409 duplicate phone; 401/403. | `{"full_name":"API Example","phone":"0950000001"}` → 201; customer ID `2`. |
| `PATCH /api/v1/customers/{customerId}` | Update customer details. | `FRONTDESK`, `MANAGER` | Path ID; JSON may include `full_name`, `phone`, `email`, `address`. | 200; updated customer. | 400 invalid fields; 404 missing customer; 409 duplicate phone; 401/403. | `{"full_name":"API Example Updated"}` → 200; updated name returned. |
| `DELETE /api/v1/customers/{customerId}` | Delete a customer without tickets/devices. | `FRONTDESK`, `MANAGER` | Path ID. | 200; deleted customer ID. | 404 missing; 409 customer has tickets/devices; 401/403. | `DELETE .../customers/2` → 200; `{"customer_id":2}`. |
| `GET /api/v1/customers/{customerId}/devices` | List a customer's devices. | `FRONTDESK`, `MANAGER` | Path: `customerId`. | 200; device array. | 404 missing customer; 401/403. | `GET .../customers/1/devices` → 200; serial `SN12345678`. |
| `GET /api/v1/devices/{deviceId}` | Read a device. | `FRONTDESK`, `MANAGER` | Path: `deviceId`. | 200; device object. | 404 missing device; 401/403. | `GET .../devices/501` → 200; product `iPhone 15 Pro Max`. |
| `POST /api/v1/devices` | Register a device for a customer. | `FRONTDESK`, `MANAGER` | JSON: `customer_id`, `serial_no`, `product_name`; optional `phone`, `purchase_date`, `warranty_months`. | 201; device object. | 400 invalid/customer mismatch; 409 duplicate serial; 401/403. | `{"customer_id":2,"phone":"0950000001","product_name":"Demo Phone","serial_no":"DOC-SERIAL-1","warranty_months":12}` → 201; device ID `502`. |
| `PATCH /api/v1/devices/{deviceId}` | Update device details. | `FRONTDESK`, `MANAGER` | Path ID; JSON may include `serial_no`, `product_name`, `purchase_date`, `warranty_months`. | 200; updated device. | 400 invalid fields/customer change; 404 missing; 409 duplicate serial; 401/403. | `{"product_name":"Demo Phone Plus"}` → 200; updated product returned. |
| `DELETE /api/v1/devices/{deviceId}` | Delete a device without tickets. | `FRONTDESK`, `MANAGER` | Path ID. | 200; deleted device ID. | 404 missing; 409 device has tickets; 401/403. | `DELETE .../devices/502` → 200; `{"device_id":502}`. |
| `POST /api/v1/tickets/suggest-category` | Suggest an issue category from description keywords. | `FRONTDESK`, `MANAGER` | JSON: `issue_desc` (>=10 trimmed chars). | 200; `issue_category`. | 400 missing/short description; 401/403. | `{"issue_desc":"display flicker issue"}` → 200; `{"issue_category":"MAN_HINH"}`. |
| `POST /api/v1/tickets/{ticketId}/assign` | Assign an eligible technician to a ticket. | `MANAGER` | Path: `ticketId`; JSON: `technician_id`. | 200; ticket with technician and assignment time. | 400 technician level/center mismatch; 404 ticket/technician; 401/403. | `{"technician_id":1}` → 200; assigned technician ID `1`. |
| `GET /api/v1/technicians/eligible` | List active technicians meeting assignment rules. | `MANAGER` | None | 200; eligible technician array. | 401/403; 500 generic internal error. | `GET .../technicians/eligible` → 200; technician ID `1`, level `3`. |
| `GET /api/v1/technicians/{technicianId}/tickets` | Get a technician's queue ordered by SLA. | `TECHNICIAN` | Path: `technicianId` must match token owner. | 200; ticket array; phone middle four digits masked. | 401 invalid token; 403 other technician; 404 inactive/missing technician. | `GET .../technicians/1/tickets` → 200; `customer_phone:"090****567"`. |
| `PATCH /api/v1/tickets/{ticketId}/status` | Change an assigned ticket's status and append history. | `TECHNICIAN` | Path ID; JSON: `status`; `reason` required for `CHO_LINH_KIEN`. | 200; updated ticket and status log. | 400 invalid transition/missing reason; 403 not assigned to caller; 404 missing ticket; 401. | `{"status":"DANG_XU_LY"}` → 200; `MOI` → `DANG_XU_LY`, history appended. |
| `GET /api/v1/tickets/{ticketId}/status-logs` | Read a ticket's status history. | `MANAGER`; `TECHNICIAN` only for own assigned ticket | Path: `ticketId`. | 200; ordered log array. | 401/403 owner check/404 missing ticket. | `GET .../tickets/2/status-logs` → 200; entries include `from_status`, `to_status`, `reason`, and `changed_at`. |
| `GET /api/v1/reports/overdue-tickets` | Count unfinished overdue tickets by technician. | `MANAGER` | None | 200; technician summary array. | 401/403; 500 generic internal error. | `GET .../reports/overdue-tickets` → 200; rows contain technician identity and `overdue_count`. |

## Representative error examples

```json
{"status":"fail","message":"Cần đăng nhập để tiếp tục."}
{"status":"fail","message":"Bạn không có quyền thực hiện thao tác này."}
{"status":"fail","message":"DU_LIEU_KHONG_HOP_LE: Số điện thoại phải bao gồm đúng 10 chữ số"}
{"status":"fail","message":"Đã xảy ra lỗi nội bộ."}
```

The in-memory examples verify API contract shape, not PostgreSQL persistence. The database integration test remains conditional on `TEST_DATABASE_URL`.
