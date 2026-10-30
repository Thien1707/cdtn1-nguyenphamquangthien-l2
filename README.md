# Mekong Mobile Smart CRM — Luồng L2 (Tiếp nhận & phân loại bảo hành)

**Sinh viên:** Nguyễn Phạm Quang Thiện · **MSSV:** 2374802011250 · **Track SE**  
**Repo:** https://github.com/Thien1707/cdtn1-nguyenphamquangthien-l2

Hệ thống hỗ trợ tiếp nhận yêu cầu bảo hành, tra cứu khách hàng/thiết bị, tính SLA theo giờ làm việc, phân công kỹ thuật viên và báo cáo phiếu quá hạn. Kiến trúc: **Routes → Controllers → Services → Repositories → PostgreSQL** (hoặc memory demo).

## 1. Yêu cầu môi trường

- Node.js 18+ hoặc 20+
- npm 9+
- PostgreSQL 14+ (**đường chạy chính thức để GV chấm**)
- PowerShell hoặc bash

## 2. Cấu hình `.env`

```powershell
copy src\.env.example src\.env
```

Chỉnh tối thiểu: `DATABASE_URL`, `JWT_SECRET` (chuỗi ngẫu nhiên ≥32 ký tự). Giờ làm việc SLA mặc định: **Thứ Hai–Thứ Bảy, 08:00–17:00** (UTC+7), không tính Chủ nhật — xem biến `BUSINESS_*` trong `src/.env.example`.

## 3. Hướng dẫn chạy (PostgreSQL — từng bước một lệnh)

1. `npm install`
2. `copy src\.env.example src\.env` rồi sửa `DATABASE_URL` và `JWT_SECRET`
3. Tạo database rỗng `mekong_crm` trên PostgreSQL
4. `npm run db:init`
5. Tạo manager (PowerShell):

```powershell
$env:NEW_USERNAME='manager'; $env:NEW_PASSWORD='YourSecurePass123!'; $env:NEW_ROLE='MANAGER'; npm run user:create
```

6. `npm run dev`
7. Mở trình duyệt: http://localhost:3000 — đăng nhập tài khoản vừa tạo

**Chạy lại seed (C5):** `npm run db:init` lần 2 — không nhân đôi dữ liệu nhờ `ON CONFLICT DO NOTHING` trong `seed.sql`.

### Demo nhanh không PostgreSQL

Trong `src/.env`: `STORAGE_DRIVER=memory`  
Tài khoản: `frontdesk` / `manager` / `technician` — mật khẩu `Welcome123!` (chỉ demo).

## 4. Kiểm thử

```powershell
npm test
```

- 17 test pass (memory), 1 skip nếu chưa có `TEST_DATABASE_URL`
- PostgreSQL: `$env:TEST_DATABASE_URL='postgres://.../mekong_crm_test'; npm run test:db`

Chi tiết: `docs/test-report.md`

## 5. Xác minh hệ thống chạy đúng

1. Đăng nhập frontdesk (memory) hoặc user đã tạo (postgres)
2. Tra cứu SĐT `0901234567` → chọn thiết bị → tạo phiếu (mô tả ≥10 ký tự) → thấy mã `BH...`
3. Manager: phân công phiếu cho KTV level ≥3
4. Technician: xem queue — SĐT dạng `090****567`
5. `npm test` → pass hết

## 6. API tiêu biểu

| Method | URL | Mô tả |
|--------|-----|--------|
| POST | `/api/v1/auth/login` | JWT |
| GET | `/api/v1/customers/search?phone=` | Tra cứu (QT-01) |
| GET/POST/PATCH/DELETE | `/api/v1/customers`, `/api/v1/customers/:id` | CRUD khách |
| GET/POST/PATCH/DELETE | `/api/v1/devices/:id` | CRUD thiết bị |
| POST | `/api/v1/tickets` | Tạo phiếu + SLA (QT-03, QT-04) |
| POST | `/api/v1/tickets/:id/assign` | Phân công level ≥3 |
| GET | `/api/v1/reports/overdue-tickets` | Báo cáo quá hạn |

Bearer token bắt buộc (trừ login).

## 7. Cấu trúc thư mục

- `src/routes`, `controllers`, `services`, `repositories` — backend 3 lớp
- `src/public/api/client.js` — API client frontend
- `src/db/schema.sql`, `seed.sql` — DDL + seed
- `tests/` — unit/API tests
- `docs/` — SRS, thay đổi thiết kế, kiến trúc thực tế, checklist ảnh BT2

## 8. Tài liệu BT2

- `docs/thay-doi-thiet-ke.md` — TD-01 … TD-12
- `docs/architecture-thuc-te.md` — sơ đồ kiến trúc đã hiện thực
- `docs/screenshot-checklist.md` — ảnh minh chứng cần chụp
- `docs/rubric-self-check.md` — tự tick rubric

## 9. Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|-------------|-----------|
| `DATABASE_URL must be configured` | Đặt `STORAGE_DRIVER=memory` hoặc cấu hình PostgreSQL |
| 401 mọi API | Đăng nhập lại; kiểm tra `JWT_SECRET` |
| Frontend “Không kết nối được máy chủ” | Chạy `npm run dev`; bấm **Thử lại** |
| `npm run db:init` lỗi quyền | Kiểm tra user/password trong `DATABASE_URL` |

## 10. Tag nộp BT2

Sau khi pass test + clone sạch:

```powershell
git tag -a v0.2 -m "Bai tap 2"
git push origin main
git push origin v0.2
```
