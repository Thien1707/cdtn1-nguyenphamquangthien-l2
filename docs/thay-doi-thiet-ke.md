# Nhật ký thay đổi thiết kế
## Sau phản hồi Bài tập 1 (Buổi 8, ngày 19/10/2026)
### TD-01 Bổ sung phụ lục khai báo AI và dòng cam kết
- Phản hồi của GV : Bài thiếu phụ lục khai báo AI và dòng cam kết; file ai-disclosure.md trong repo đang rỗng.
- Quyết định : SỬA
- Lý do : Đáp ứng đúng quy định bắt buộc về tính minh bạch và tiêu chí trình bày của môn học.
- Ảnh hưởng : Điền đầy đủ thông tin vào file `docs/ai-disclosure.md` và bổ sung bảng khai báo AI kèm dòng cam kết vào cuối tài liệu nộp.

### TD-02 Bổ sung chú thích ký hiệu cho Use Case Diagram và ERD
- Phản hồi của GV : Use Case Diagram và ERD chưa có chú thích ký hiệu.
- Quyết định : SỬA - Lý do : Giúp sơ đồ chuẩn hóa, dễ đọc và đáp ứng đầy đủ tiêu chí kỹ thuật.
- Ảnh hưởng : Cập nhật tệp `docs/usecase.drawio` (bổ sung Legend giải thích Actor, Use case, <<include>>, <<extend>>) và `docs/erd.drawio` (giải thích ký hiệu quan hệ Crow's Foot 1-N).

### TD-03 Chuẩn hóa mã Use Case khớp với Bảng truy vết yêu cầu
- Phản hồi của GV : Mã UC trên sơ đồ không khớp bảng truy vết: UC3 trên sơ đồ là tạo khách hàng nhưng SRS là tính SLA, có hai UC5, không có UC6.
- Quyết định : SỬA
- Lý do : Đảm bảo tính nhất quán 100% giữa Sơ đồ Use Case, Bảng truy vết yêu cầu và các User Story trong SRS.
- Ảnh hưởng : Đánh số lại Use Case trên `docs/usecase.drawio` và SRS: UC1 (Tra cứu KH), UC2 (Tạo phiếu), UC3 (Tính SLA), UC4 (Đề xuất nhóm sự cố), UC5 (Phân công KTV), UC6 (Cập nhật trạng thái phiếu), UC7 (Xem danh sách phiếu theo SLA).

### TD-04 Cập nhật hình ERD khớp với DDL SQL và thống nhất tên cột
- Phản hồi của GV : Hình ERD thiếu nhiều cột so với DDL (email, address, changed\_by). US5 dùng proficiency nhưng bảng technician dùng cột level.
- Quyết định : SỬA
- Lý do : Đảm bảo mô hình dữ liệu trên hình vẽ khớp chính xác từng trường dữ liệu với file lệnh SQL DDL và mô tả nghiệp vụ.
- Ảnh hưởng : Bổ sung các cột `email`, `address` vào bảng `customer`, `changed_by` vào bảng `ticket_status_log` trên `docs/erd.drawio`; thống nhất dùng tên cột `level` (hoặc ghi rõ quy đổi `proficiency` ➔ `level`) trong SRS và DDL.

### TD-05 Bổ sung con số đo được cho NFR3 (Bảo mật)
- Phản hồi của GV : NFR3 nên có con số, ví dụ 100% response cho vai trò Kỹ thuật viên đều che SĐT.
- Quyết định : SỬA
- Lý do : Đảm bảo toàn bộ Yêu cầu phi chức năng (NFR) đều có ngưỡng định lượng đo lường được.
- Ảnh hưởng : Chỉnh sửa lại NFR3 trong SRS thành: "100% dữ liệu phản hồi API (response JSON) cho vai trò Kỹ thuật viên phải che 4 số giữa của SĐT khách hàng (dạng 090****567)".

### TD-06 Chuẩn hóa thông tin trang bìa, tên file và nộp file `.drawio` gốc
- Phản hồi của GV : Tên file sai mẫu; trang bìa thiếu track, mã luồng và link GitHub; repo chưa có file .drawio gốc.
- Quyết định : SỬA
- Lý do : Hoàn thiện hồ sơ theo đúng quy chuẩn đóng gói và lưu trữ nguồn thiết kế trên GitHub.
- Ảnh hưởng : Đặt lại tên file PDF theo chuẩn `BT1_2374802011250_NguyenPhamQuangThien.pdf`; cập nhật trang bìa đầy đủ Track SE, Luồng L2, Link GitHub; đẩy các file gốc `usecase.drawio`, `erd.drawio`, `architecture.drawio` vào thư mục `docs/`.

## Bài tập 2 (BT2) — Hiện thực module cốt lõi

### TD-07 CRUD đầy đủ cho `customer` và `device`
- Thiết kế BT1 : SRS tập trung tra cứu/tạo khách và thiết bị khi tiếp nhận; không mô tả API xóa phiếu.
- Thay đổi BT2 : Bổ sung GET/PATCH/DELETE cho khách hàng và thiết bị; **không** thêm xóa phiếu bảo hành.
- Lý do : Rubric BT2 (S1) yêu cầu hai thực thể CRUD; xóa phiếu trái quy tắc nghiệp vụ tiếp nhận.
- Ảnh hưởng : `src/routes/ticket.routes.js`, service/repository, tab **Khách & thiết bị** trên UI.
- Kiểm chứng : `tests/crud.api.test.js`, Postman/curl.

### TD-08 Tách lớp API client frontend
- Thiết kế BT1 / slide buổi 10 : Gợi ý `src/api/client.js` riêng.
- Thay đổi BT2 : `src/public/api/client.js` + `ui-state.js`; `app.js` chỉ render màn hình.
- Lý do : Rubric S4 — mọi gọi API qua một client, xử lý JWT và lỗi mạng tập trung.
- Kiểm chứng : Tìm `fetch(` trong `app.js` → không còn; tắt backend → thông báo + **Thử lại**.

### TD-09 QT-03 — Mô tả lỗi tối thiểu 10 ký tự
- Thiết kế BT1 : AC chỉ nêu “không để trống”.
- Thay đổi BT2 : Validate service: trim ≥ 10 ký tự (`issue_desc`).
- Lý do : Prompt BT2 / quy tắc QT-03 bổ sung ngưỡng đo được.
- Kiểm chứng : `tests/crud.api.test.js`, `ticket.service.test.js`.

### TD-10 Lịch giờ làm việc SLA (Thứ Hai–Thứ Bảy, 08:00–17:00)
- Thiết kế BT1 README : Thứ Hai–Thứ Sáu, 09:00–17:00.
- Thay đổi BT2 : Mặc định `.env` `BUSINESS_START_HOUR=8`, `BUSINESS_WORKING_DAYS=1,2,3,4,5,6`.
- Lý do : Prompt hoàn thiện BT2 thống nhất giờ làm việc L2; vẫn cấu hình qua biến môi trường.
- Kiểm chứng : Test SLA trong `ticket.service.test.js`.

### TD-11 Ghi log trạng thái MOI khi tạo phiếu (transaction)
- Thiết kế BT1 : Nhật ký khi chuyển trạng thái.
- Thay đổi BT2 : Insert `ticket_status_logs` cùng transaction tạo phiếu (MOI).
- Lý do : Yêu cầu DB — không mất lịch sử ngay từ tiếp nhận.
- Kiểm chứng : PostgreSQL integration test / query log sau POST ticket.

### TD-12 Tài liệu kiến trúc thực tế
- Thiết kế BT1 : `docs/drawio/architecture.drawio` (thiết kế).
- Thay đổi BT2 : Thêm `docs/architecture-thuc-te.md`, `docs/diagrams/erd-thuc-te.mmd`.
- Kiểm chứng : Đối chiếu sơ đồ với cấu trúc thư mục `src/` thực tế.

## Sau phản hồi Bài tập 2 (Buổi 14, ngày 13/11/2026)

### TD-13 Tạo và đẩy git tag v0.2 lên GitHub repository
- Phản hồi của GV : Repo chưa có tag v0.2 (báo cáo ghi có).
- Quyết định : SỬA
- Lý do : Đảm bảo tính nhất quán giữa báo cáo nộp và trạng thái thực tế của repository, phục vụ việc đánh giá mốc nộp BT2 của giảng viên.
- Ảnh hưởng : Tạo tag `v0.2` trên Git (`git tag v0.2 c3a3dc3`) và đẩy lên remote GitHub (`git push origin v0.2`).

### TD-14 Định dạng link GitHub dạng văn bản có thể click trực tiếp trên trang bìa
- Phản hồi của GV : Link repo chỉ có trong ảnh trang bìa nên không click được.
- Quyết định : SỬA
- Lý do : Giúp giảng viên bấm trực tiếp vào liên kết repository từ file báo cáo PDF/Word mà không phải gõ lại thủ công.
- Ảnh hưởng : Trên trang bìa báo cáo, nhúng hyperlink dạng văn bản trực tiếp (Text link: `https://github.com/Thien1707/cdtn1-nguyenphamquangthien-l2`), không dùng hình ảnh chụp lại link.

## Bài tập 3 (BT3) — Kiểm thử và đóng gói prototype

### TD-15 Làm kín phản hồi lỗi và ổn định Docker build trên Windows
- Phát hiện : Một số controller trả trực tiếp `error.message` với lỗi máy chủ; Dockerfile sao chép toàn bộ repository vào image.
- Quyết định : SỬA.
- Lý do : Tránh lộ chi tiết lỗi nội bộ qua API và ngăn đưa `.env`/tài liệu/test không cần thiết vào build context/image.
- Ảnh hưởng : Thêm `src/controllers/error-response.js`, kiểm thử hồi quy trong `tests/ticket-workflows.api.test.js`, `.dockerignore` để loại `.env` khỏi build context nhưng vẫn giữ bộ test trong image, entrypoint tạo JWT secret ngẫu nhiên, và chuẩn hóa line ending script trong Docker image để chạy được khi checkout trên Windows.
- Kiểm chứng : `npm test` trên host (18 pass, 1 PostgreSQL test skip); sau khi bật Docker, cả hai container healthy và `/health` trả 200.

### TD-16 Khóa bản vá cho dependency runtime
- Phát hiện : `npm audit --omit=dev` ban đầu phát hiện lỗ hổng mức High/Moderate trong `body-parser` và `qs`.
- Quyết định : SỬA.
- Lý do : Không giữ dependency runtime có advisory đã biết khi có bản vá tương thích.
- Ảnh hưởng : Thêm `overrides` trong `package.json` để dùng `body-parser` 2.4.0 và `qs` 6.17.1; lockfile cập nhật tương ứng.
- Kiểm chứng : `npm audit --omit=dev` báo 0 vulnerabilities. Full `npm audit` còn 2 Moderate trong dependency phát triển `nodemon` → `minimatch`; không ép `npm audit fix --force` vì phương án đó hạ phiên bản nodemon ngoài range khai báo.

### TD-17 Dọn status log trong PostgreSQL integration test
- Phát hiện : Test persistence tạo status log khi ghi phiếu nhưng cleanup chỉ xóa ticket, làm foreign key từ chối lệnh dọn dữ liệu.
- Quyết định : SỬA.
- Lý do : Test tích hợp phải tự dọn fixture sau khi chạy để tái lập và không để lại dữ liệu rác.
- Ảnh hưởng : `tests/postgres.integration.test.js` xóa status log thuộc ticket kiểm thử trước, rồi mới xóa ticket.
- Kiểm chứng : Full suite trong Docker với PostgreSQL trả 19 pass, 0 fail, 0 skip.
