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
    1. Sao chép file cấu hình mẫu: `cp .env.example .env`
    2. Cài đặt các thư viện phụ thuộc: `npm install`
    3. Khởi chạy ứng dụng ở chế độ phát triển: `npm run dev` (hoặc `node src/app.js`)
    4. Địa chỉ API mặc định: `http://localhost:3000/api/v1`
## 3. Hướng dẫn chạy *(Sẽ hoàn thiện ở các buổi sau)* 
## 4. Cấu trúc thư mục 
- `docs/`: Tài liệu đặc tả yêu cầu (SRS) và minh chứng AI 
- `src/`: Mã nguồn ứng dụng 
- `tests/`: Mã kiểm thử
-`data/`: Dữ liệu mẫu của case study 
## 5. Kiểm thử 
*(Sẽ hoàn thiện ở các buổi sau)* 
## 6. Trạng thái hiện tại 
- [x] **Xử lý phản hồi BT1:** Đã tạo `docs/thay-doi-thiet-ke.md` ghi lại 6 mã điều chỉnh (TD-01 đến TD-06) và điền `docs/ai-disclosure.md`.
- [x] **Khung kiến trúc mã nguồn:** Đã tổ chức thư mục `src/` theo chuẩn 3 lớp (`routes/`, `controllers/`, `services/`, `repositories/`, `config/`, `db/`).
- [x] **Cơ sở dữ liệu:** Đã tạo script DDL Migration (`src/db/schema.sql`) và Seed Data (`src/db/seed.sql`).
- [x] **Module cốt lõi (Tickets):**
    - [x] `GET /api/v1/tickets`: Lấy danh sách phiếu bảo hành.
    - [x] `POST /api/v1/tickets`: Tạo mới phiếu bảo hành (có validation bắt lỗi mô tả trống).