# Báo cáo kiểm thử BT2

**Ngày chạy:** 2026-10-29 (môi trường agent)  
**Lệnh:** `npm test`  
**Kết quả:** **17 pass**, **0 fail**, **1 skipped** (PostgreSQL integration khi thiếu `TEST_DATABASE_URL`)

## Phân loại test

| Loại | File / test | Mô tả |
|------|-------------|--------|
| Luồng đúng | `crud.api.test.js`, `ticket-workflows.api.test.js` | CRUD customer/device, tạo phiếu, phân công, báo cáo |
| Biên | `ticket.service.test.js` | SLA qua tối thứ Bảy, bỏ Chủ nhật; mô tả 9 vs 10 ký tự |
| Dữ liệu sai | `ticket.service.test.js`, workflows | SĐT sai, priority invalid, level KTV thấp, thiếu lý do |

## Ghi chú

- Test chạy với `STORAGE_DRIVER=memory`, không phụ thuộc PostgreSQL local.
- Integration: `npm run test:db` khi đã cấu hình `TEST_DATABASE_URL`.
