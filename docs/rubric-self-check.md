# Rubric tự đánh giá BT2 (SE)

| Mục | Trạng thái | Bằng chứng |
|-----|------------|-----------|
| C1 Chạy theo README | Chưa xác minh clone sạch | Cần sinh viên chạy phép thử mục README |
| C2 Tách lớp | **Đạt** | `routes` → `controllers` → `services` → `repositories` |
| C3 ≥2 quy tắc NV | **Đạt** | QT-01 SĐT, QT-03 mô tả, QT-04 SLA, level KTV, che SĐT |
| C4 ≥3 test 3 loại | **Đạt** | `npm test` 17 pass — xem `docs/test-report.md` |
| C5 Chạy lại init | Chưa xác minh | Seed dùng `ON CONFLICT DO NOTHING` — cần chụp S09 |
| C6 .env.example | **Đạt** | `src/.env.example` |
| C7 Input sai | **Đạt** | 400 + message, không stack trace |
| S1 CRUD 2 entity | **Đạt** | `customer` + `device` — `tests/crud.api.test.js` |
| S2 Service sạch HTTP | **Đạt** | `ticket.service.js` |
| S3 Migration + seed | **Đạt** | `schema.sql`, `seed.sql`, `npm run db:init` |
| S4 UI + client + 3 state | **Đạt một phần** | `api/client.js`, loading/empty/error/retry — ảnh S07 chưa chụp |
| Tag v0.2 | **Chưa** | Tạo sau khi clone sạch + PDF nộp |
| AI disclosure BT2 | **Đạt một phần** | Đã cập nhật cột kiểm chứng — sinh viên rà lại |
| Ảnh minh chứng | **Chưa** | `docs/screenshot-checklist.md` |
