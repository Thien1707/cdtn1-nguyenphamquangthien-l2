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