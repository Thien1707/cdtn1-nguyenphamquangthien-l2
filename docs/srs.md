2.User story 

- US1: Là nhân viên tiếp nhận, tôi muốn tra cứu thông tin khách hàng qua số điện thoại để không phải nhập lại dữ liệu đã có trong hệ thống. (MUST) 

- Tiêu chí chấp nhận (AC) : 

  + AC1: Khi nhân viên nhập một số điện thoại đã tồn tại trong hệ thống, ví dụ 0901234567, hệ thống sẽ tự động hiển thị thông tin của khách hàng gồm Tên, Địa chỉ, Email và danh sách các thiết bị khách hàng đã mua. 

  + AC2: Khi nhân viên nhập một số điện thoại chưa tồn tại trong hệ thống, hệ thống sẽ mở form tạo khách hàng mới và tự động điền số điện thoại vừa nhập vào form. 

  + AC3: Khi nhân viên nhập số điện thoại không đúng định dạng 10 chữ số, ví dụ 090123, và thực hiện tìm kiếm, hệ thống sẽ hiển thị thông báo: “Số điện thoại phải bao gồm đúng 10 chữ số”. 

 

- US2: Là nhân viên tiếp nhận, tôi muốn tạo phiếu bảo hành mới kèm số IMEI/Serial và mô tả lỗi để ghi nhận chính xác yêu cầu dịch vụ của khách hàng. (MUST) 

- Tiêu chí chấp nhận (AC) : 

  + AC1: Khi nhân viên đã chọn đầy đủ thông tin khách hàng và thiết bị, nhập mô tả lỗi “Màn hình sọc xanh” và nhấn “Lưu phiếu”, hệ thống sẽ tạo một phiếu bảo hành mới với trạng thái “MỚI” và tự động sinh một mã phiếu duy nhất, ví dụ BH20260925-001. 

  + AC2: Khi nhân viên không nhập mô tả lỗi mà nhấn “Lưu phiếu”, hệ thống sẽ không cho phép tạo phiếu và hiển thị thông báo lỗi màu đỏ “Mô tả lỗi không được để trống”. Các thông tin khách hàng và thiết bị đã chọn trước đó vẫn được giữ nguyên. 

 

- US3: Là Hệ thống, tôi muốn tự động tính hạn cam kết (SLA) dựa trên mức ưu tiên để thiết lập thời hạn trả máy chính xác cho khách hàng. (MUST) 

- Tiêu chí chấp nhận (AC) : 

  + AC1: Khi phiếu bảo hành có mức ưu tiên “CAO”, hệ thống sẽ tự động tính thời hạn xử lý bằng cách cộng 24 giờ làm việc kể từ thời điểm tiếp nhận và lưu thời điểm đó vào sla_deadline. 

  + AC2: Khi phiếu bảo hành có mức ưu tiên “TRUNG BÌNH”, hệ thống sẽ tự động tính thời hạn xử lý bằng cách cộng 72 giờ làm việc kể từ thời điểm tiếp nhận và lưu thời điểm đó vào sla_deadline. 

 

- US4: Là Nhân viên tiếp nhận, tôi muốn hệ thống đề xuất nhóm sự cố dựa trên từ khóa trong mô tả lỗi để giảm bớt thao tác phân loại thủ công. (SHOULD) 

- US5: Là Quản lý trung tâm, tôi muốn gán kỹ thuật viên cho phiếu bảo hành dựa trên bậc tay nghề ( proficiency >= 3 ) để đảm bảo chất lượng xử lý sự cố. (SHOULD) 

 

- US6: Nội dung: Là Kỹ thuật viên, tôi muốn cập nhật trạng thái phiếu ( ĐANG XỬ LÝ ➔ CHỜ LINH KIỆN ➔ HOÀN TẤT ) để theo dõi tiến độ sửa chữa thiết bị. (MUST) 

- Tiêu chí chấp nhận (AC) : 

  + AC1: Khi phiếu bảo hành đang ở trạng thái “ĐANG XỬ LÝ”, kỹ thuật viên chọn lý do “Thiếu linh kiện màn hình” và nhấn “Cập nhật”, hệ thống sẽ chuyển trạng thái phiếu sang “CHỜ LINH KIỆN” và lưu lại thông tin thay đổi vào nhật ký. 

 

- US7: Là Kỹ thuật viên, tôi muốn xem danh sách phiếu bảo hành được gán cho mình sắp xếp theo hạn SLA để ưu tiên xử lý các phiếu sắp quá hạn trước. (SHOULD) 

- US8: Là Quản lý trung tâm, tôi muốn xem báo cáo số lượng phiếu quá hạn cam kết theo từng kỹ thuật viên để đánh giá hiệu suất và điều chỉnh phân công. (COULD) 

3. Use Case
![
](cdtn1.drawio.png)

4. Bảng Đặc tả Chi tiết Use Case 

Mục đặc tả 

Nội dung chi tiết 

Mã Use Case 

UC2 

Tên Use Case 

Tạo phiếu bảo hành mới 

Tác nhân (Actors) 

Actor chính: Nhân viên tiếp nhận 

Mục tiêu 

Ghi nhận một yêu cầu bảo hành vào hệ thống để theo dõi đến khi đóng. 

Điều kiện trước (Pre-conditions) 

Nhân viên đã đăng nhập và có quyền tiếp nhận. 

Điều kiện sau (Post-conditions) 

Một phiếu bảo hành ở trạng thái MỚI đã được lưu, có mã phiếu duy nhất. 

User Story liên quan 

US1,  

Mức ưu tiên 

MUST 

Luồng chính (Happy Path) 

1. Nhân viên chọn chức năng “Tạo phiếu bảo hành mới”. 

2. Nhân viên nhập số điện thoại khách hàng. 

3. Hệ thống tra cứu và hiển thị thông tin khách + lịch sử mua hàng. [include UC1]. 

4. Nhân viên chọn thiết bị từ danh sách thiết bị khách đã mua. 

5. Nhân viên nhập mô tả lỗi và đính kèm ảnh (tùy chọn). 

6. Hệ thống đề xuất nhóm sự cố và mức ưu tiên. [include UC4]. 

7. Nhân viên xác nhận hoặc điều chỉnh, rồi bấm “Lưu”. 

8. Hệ thống sinh mã phiếu, lưu phiếu ở trạng thái MỚI, hiển thị mã phiếu. 

Luồng ngoại lệ (Alternative Flows) 

3a. Khách hàng chưa tồn tại trong hệ thống: 

- Hệ thống mở form tạo khách mới với số điện thoại đã điền sẵn [extend UC3]. 

- Sau khi lưu khách mới, quay lại bước 4. 

4a. Thiết bị không nằm trong lịch sử mua hàng của khách: 

- Cho phép nhập thiết bị ngoài, BẮT BUỘC nhập số serial và ghi chú nguồn gốc. 

5a. Mô tả lỗi để trống: 

- Từ chối lưu, hiển thị thông báo nêu rõ trường còn thiếu. 

- Không mất dữ liệu đã nhập. 

8a. Mất kết nối khi đang lưu: 

- Giữ lại dữ liệu đã nhập trên giao diện, cho phép thử lưu lại. 

- Không tạo phiếu trùng. 

 

5. Đặc tả kỹ thuật chuyên ngành - API Contract (Track SE) 

Endpoint 1: Tra cứu thông tin khách hàng 

HTTP Method & URL: `GET /api/v1/customers/search`  

Mục đích: Tra cứu thông tin khách hàng và danh sách thiết bị đã mua qua số điện thoại (phục vụ US1).  

Query Parameter: `phone` (string, required, đúng 10 chữ số). 

Response 200 OK (Tìm thấy khách hàng): 

```json  

{  

"status": "success", 

"data": { 

"customer_id": 1001,  

"full_name": "Nguyễn Văn A",  

"phone": "0901234567",  

"address": "123 Nguyễn Trãi, Q5, TP.HCM",  

"devices": [ 

{ 

"device_id": 501,  

"serial_no": "SN12345678",  

"product_name": "iPhone 15 Pro Max", 

"purchase_date": "2025-10-15",  

"warranty_months": 12  

}  

] 

} 

} 

 

Response 404 Not Found (Khách hàng chưa tồn tại): 

{ 
 "status": "fail", 
 "message": "Không tìm thấy thông tin khách hàng với số điện thoại này." 
} 
 

Endpoint 2: Tạo phiếu bảo hành mới 

HTTP Method & URL: POST /api/v1/tickets 

Mục đích: Ghi nhận phiếu bảo hành mới, tự động tính hạn SLA và lưu log (phục vụ US2, US3). 

Request Body (JSON): 

{  

"customer_id": 1001, 

"device_id": 501, 

"issue_desc": "Màn hình bị sọc xanh và liệt cảm ứng góc trên", 

"priority": "CAO", 

"center_id": 1 

} 
 

Response 201 Created (Tạo phiếu thành công): 

{ 
 "status": "success", 
 "data": { 
   "ticket_id": 2050, 
   "ticket_code": "BH20261002-001", 
   "status": "MOI", 
   "due_date": "2026-10-03T17:00:00Z", 
   "created_at": "2026-10-02T08:00:00Z" 
 } 
} 
 

Response 400 Bad Request (Lỗi dữ liệu đầu vào): 

{ 
 "status": "fail", 
 "message": "Mô tả lỗi (issue_desc) không được để trống." 
} 
 

6. Bảng truy vết yêu cầu (Requirement Traceability Matrix) 

Mã FR 

Yêu cầu chức năng 

User Story 

Use Case 

MoSCoW 

FR1 

Tra cứu thông tin khách hàng qua số điện thoại 

US1 

UC1 

MUST 

FR2 

Tạo mới phiếu bảo hành kèm Serial/IMEI và mô tả lỗi 

US2 

UC2 

MUST 

FR3 

Tự động tính hạn cam kết (SLA) theo mức ưu tiên 

US3 

UC3 

MUST 

FR4 

Đề xuất nhóm sự cố dựa trên từ khóa trong mô tả lỗi 

US4 

UC4 

SHOULD 

FR5 

Gán kỹ thuật viên xử lý phiếu theo tay nghề (proficiency ≥ 3) 

US5 

UC5 

SHOULD 

FR6 

Cập nhật trạng thái phiếu (MỚI ➔ HOÀN TẤT) 

US6 

UC6 

MUST 

FR7 

Xem danh sách phiếu gán cá nhân sắp xếp theo hạn SLA 

US6 

UC7 

SHOULD 

 

7. PEER REVIEW & NỘP BÁO CÁO 

 

1. Link commit cuối buổi: https://github.com/nguyenphamquangthien/cdtn1-nguyenphamquangthien-l2/commit/ 

2. User Story: 8 story | 4 MUST | 8 tiêu chí GWT (2 ngoại lệ) 

3. Use Case: 4 actor | 7 use case | UC đặc tả chi tiết: UC2 - Tạo phiếu bảo hành mới (2 luồng ngoại lệ)  

4. SRS: 6/6 mục | 4 FR có mã | 3 NFR có ngưỡng số | truy vết còn 0 ô trống  

5. Mẫu track (API contract): Xong – đã đặc tả 2 endpoints GET search customer & POST create ticket  

6. Giờ thực tế xong: User Story 10:15 | Use Case 11:00 | SRS + track 11:45  

7. Checklist đạt 10/10  

8. Peer review với: [Tên bạn đổi bài] (Track DA) – tóm tắt phạm vi: Đúng – góp ý sẽ sửa: Bổ sung rõ hơn ngưỡng NFR1  

9. Chỗ chưa xong/còn phân vân – Đã xử lý xong việc vẽ sơ đồ Mermaid trong Markdown  

10. Một quyết định em đưa ra hôm nay – Chuẩn hóa định dạng JSON Response cho API Contract để dễ tích hợp ở BT2  

11. Việc còn dở – Không có  

12. Tự đánh giá: Đạt hết mục tiêu 