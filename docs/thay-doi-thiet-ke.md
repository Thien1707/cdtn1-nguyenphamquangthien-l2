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