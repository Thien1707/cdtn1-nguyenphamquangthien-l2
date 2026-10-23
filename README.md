# Quản lý tiếp nhận và phân loại yêu cầu bảo hành cho Mekong Mobile 
**Sinh viên:** Nguyễn Phạm Quang Thiện - 2374802011250 - Track SE 
**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027 
**Luồng nghiệp vụ:** L2 – Tiếp nhận và phân loại yêu cầu bảo hành
## 1. Mục tiêu
Xây dựng phân hệ tiếp nhận và phân loại yêu cầu bảo hành nhằm tự động hóa quy trình ghi nhận, phân loại mức độ ưu tiên và tính hạn cam kết SLA cho Mekong Mobile.
## 2. Yêu cầu môi trường 
- **Ngôn ngữ & Runtime:** Node.js (v18+ hoặc v20+)
- **Package Manager:** npm (v9+)
- **Cơ sở dữ liệu:** PostgreSQL (hoặc SQLite cho môi trường Local Development)
- **Cấu hình môi trường:**
    1. Sao chép file cấu hình mẫu `src/.env.example` thành `src/.env`.
    2. Cài đặt các thư viện phụ thuộc: `npm install`
    3. Khởi chạy ứng dụng ở chế độ phát triển: `npm run dev` (hoặc `node src/app.js`)
    4. Địa chỉ API mặc định: `http://localhost:3000/api/v1`
## 3. Hướng dẫn chạy
1. Cài dependencies: `npm install`.
2. Sao chép `src/.env.example` thành `src/.env`, đặt `DATABASE_URL` và thay `JWT_SECRET` bằng chuỗi ngẫu nhiên dài.
3. Tạo database PostgreSQL rỗng tên `mekong_crm`, rồi khởi tạo schema/seed: `npm run db:init`.
4. Tạo tài khoản quản lý đầu tiên trong PowerShell:
    `$env:NEW_USERNAME='manager'; $env:NEW_PASSWORD='your-long-password'; $env:NEW_ROLE='MANAGER'; npm run user:create`
5. Đăng nhập bằng tài khoản vừa tạo; manager có thể tạo tài khoản nhân viên qua `POST /api/v1/auth/users`.
6. Khởi chạy: `npm run dev`; mở `http://localhost:3000`.

Chế độ demo không cần PostgreSQL: đặt `STORAGE_DRIVER=memory` trong `src/.env`. Tài khoản demo `frontdesk`, `manager`, `technician` dùng mật khẩu `Welcome123!` chỉ tồn tại trong memory mode; không dùng các tài khoản này khi triển khai thật.
## 4. Cấu trúc thư mục 
- `docs/`: Tài liệu đặc tả yêu cầu (SRS) và minh chứng AI 
- `src/`: Mã nguồn ứng dụng 
- `tests/`: Mã kiểm thử
-`data/`: Dữ liệu mẫu của case study 
## 5. Kiểm thử
- Test service/API chạy bằng memory adapter: `npm test`.
- PostgreSQL integration test: đặt `TEST_DATABASE_URL` trỏ tới database test riêng rồi chạy `npm run test:db`. Test này sẽ tạo và xóa dữ liệu fixture.
- `src/db/schema.sql` là schema chuẩn; `data/schema.sql` là wrapper psql tương thích.
## 6. Trạng thái hiện tại 
- [x] **Xử lý phản hồi BT1:** Đã tạo `docs/thay-doi-thiet-ke.md` ghi lại 6 mã điều chỉnh (TD-01 đến TD-06) và điền `docs/ai-disclosure.md`.
- [x] **Khung kiến trúc mã nguồn:** Đã tổ chức thư mục `src/` theo chuẩn 3 lớp (`routes/`, `controllers/`, `services/`, `repositories/`, `config/`, `db/`).
- [x] **Cơ sở dữ liệu:** Đã tạo script DDL Migration (`src/db/schema.sql`) và Seed Data (`src/db/seed.sql`).
- [x] **Module cốt lõi (Tickets):**
    - [x] `GET /api/v1/tickets`: Lấy danh sách phiếu bảo hành.
    - [x] `POST /api/v1/tickets`: Tạo mới phiếu bảo hành (có validation bắt lỗi mô tả trống).

## Kế hoạch sau buổi 10
- [x] Tra cứu khách hàng theo số điện thoại: kiểm tra 10 chữ số, trả thông tin khách hàng và thiết bị, phản hồi 404 khi chưa tồn tại.
- [x] US4: Đề xuất nhóm sự cố theo từ khóa trong mô tả lỗi.
- [x] US5: Gán kỹ thuật viên cùng trung tâm, yêu cầu `level >= 3`.
- [x] US6: Cập nhật trạng thái theo luồng hợp lệ và ghi nhật ký thay đổi.
- [x] US7: Xem phiếu của kỹ thuật viên, sắp xếp theo hạn SLA tăng dần.
- [x] Bổ sung kiểm thử tự động cho API.
- [x] SLA tính theo giờ làm việc; mặc định thứ Hai–thứ Sáu, 09:00–17:00 giờ Việt Nam.
- [x] Khách chưa tồn tại được gợi ý tạo mới; API tạo khách giữ sẵn số điện thoại tra cứu.
- [x] US8: Báo cáo số phiếu quá hạn theo kỹ thuật viên.
- [ ] Kết nối các repository với PostgreSQL; dữ liệu hiện tại vẫn là in-memory demo.

### Xác thực và giao diện
- API yêu cầu JWT Bearer; vai trò `FRONTDESK`, `MANAGER`, `TECHNICIAN` được giới hạn theo nghiệp vụ.
- Kỹ thuật viên chỉ xem/cập nhật phiếu được giao và response che số điện thoại khách.
- Giao diện chạy tại `/`; dữ liệu người dùng được nhập/xem theo quyền tài khoản.
- PostgreSQL integration test nằm ở `tests/postgres.integration.test.js`; chưa chạy được nếu thiếu `TEST_DATABASE_URL` và PostgreSQL test database.

### API mới
- `GET /api/v1/customers/search?phone=0901234567`: Tra cứu khách hàng và thiết bị.
- `POST /api/v1/customers` với `{ "full_name": "Nguyễn Văn B", "phone": "0912345678", "email": "b@example.com", "address": "Quận 1" }`: Tạo khách hàng mới.
- `POST /api/v1/tickets/suggest-category` với `{ "issue_desc": "Màn hình sọc xanh" }`: Đề xuất nhóm sự cố.
- `POST /api/v1/tickets/:ticketId/assign` với `{ "technician_id": 1 }`: Phân công kỹ thuật viên.
- `PATCH /api/v1/tickets/:ticketId/status` với `{ "status": "CHO_LINH_KIEN", "reason": "Thiếu linh kiện màn hình" }`: Cập nhật trạng thái và ghi log.
- `GET /api/v1/tickets/:ticketId/status-logs`: Xem lịch sử trạng thái.
- `GET /api/v1/technicians/:technicianId/tickets`: Xem phiếu được giao, xếp theo hạn SLA tăng dần.
- `GET /api/v1/reports/overdue-tickets`: Đếm phiếu quá hạn chưa hoàn tất theo kỹ thuật viên.
- `POST /api/v1/auth/login`: Đăng nhập, nhận JWT.
- `GET /api/v1/auth/me`: Xem tài khoản hiện tại.
- `POST /api/v1/auth/users`: Manager tạo tài khoản nhân viên.
- `GET /api/v1/technicians/eligible`: Manager xem kỹ thuật viên đạt level tối thiểu.
- `POST /api/v1/devices`: Nhân viên tạo hồ sơ thiết bị cho khách.

## Kịch bản demo
1. Đăng nhập `frontdesk`, tra cứu `0901234567`, chọn thiết bị, mô tả lỗi và tạo phiếu.
2. Đăng nhập `manager`, mở Phân công, chọn phiếu và technician level 3, rồi xem Báo cáo quá hạn.
3. Đăng nhập `technician`, mở Phiếu được giao; xác nhận số điện thoại đã che và chuyển phiếu sang `CHO_LINH_KIEN` với lý do.

## Ghi chú SLA
- SLA cộng giờ làm việc theo ưu tiên: CAO 24 giờ, TRUNG BÌNH 72 giờ, THẤP 120 giờ. Mặc định làm việc thứ Hai–thứ Sáu, 09:00–17:00, múi giờ UTC+7; không tính ngày lễ nếu chưa khai báo.
- Có thể cấu hình lịch bằng `BUSINESS_TIMEZONE_OFFSET_MINUTES`, `BUSINESS_START_HOUR`, `BUSINESS_END_HOUR`, `BUSINESS_WORKING_DAYS` (0=Chủ nhật, 1=thứ Hai, ...), và `BUSINESS_HOLIDAYS` (danh sách `YYYY-MM-DD`, phân tách bằng dấu phẩy) trong `src/.env`.