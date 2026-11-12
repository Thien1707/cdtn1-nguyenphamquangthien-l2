"""Build the BT3 status report as a Word document."""
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.opc.constants import RELATIONSHIP_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "BT3_2374802011250_NguyenPhamQuangThien.docx"
REPOSITORY = "https://github.com/Thien1707/cdtn1-nguyenphamquangthien-l2"
SCREENSHOTS = ROOT / "docs" / "screenshots" / "BT3"


def set_run(run, size=10, bold=False, color=None):
    run.font.name = "Times New Roman"
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)


def add_paragraph(doc, text="", bold=False, size=10, alignment=None):
    paragraph = doc.add_paragraph()
    if alignment is not None:
        paragraph.alignment = alignment
    run = paragraph.add_run(text)
    set_run(run, size=size, bold=bold)
    paragraph.paragraph_format.space_after = Pt(5)
    return paragraph


def add_heading(doc, text, level=1):
    heading = doc.add_heading(text, level=level)
    for run in heading.runs:
        set_run(run, 14 if level == 1 else 12, True, (31, 78, 121))
    return heading


def add_hyperlink(paragraph, text, url):
    relationship_id = paragraph.part.relate_to(
        url,
        RELATIONSHIP_TYPE.HYPERLINK,
        is_external=True,
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), relationship_id)
    run = OxmlElement("w:r")
    properties = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "0563C1")
    properties.append(color)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    properties.append(underline)
    run.append(properties)
    label = OxmlElement("w:t")
    label.text = text
    run.append(label)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def add_table(doc, headers, rows, font_size=8):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for index, value in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.text = value
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                set_run(run, font_size, True)
    for row in rows:
        cells = table.add_row().cells
        for index, value in enumerate(row):
            cells[index].text = str(value)
            cells[index].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            for paragraph in cells[index].paragraphs:
                paragraph.paragraph_format.space_after = Pt(2)
                for run in paragraph.runs:
                    set_run(run, font_size)
    return table


def set_page(section, landscape=False):
    if landscape:
        section.orientation = WD_ORIENT.LANDSCAPE
        section.page_width = Cm(29.7)
        section.page_height = Cm(21)
        section.left_margin = Cm(1.2)
        section.right_margin = Cm(1.2)
        section.top_margin = Cm(1.4)
        section.bottom_margin = Cm(1.4)
    else:
        section.orientation = WD_ORIENT.PORTRAIT
        section.page_width = Cm(21)
        section.page_height = Cm(29.7)
        section.left_margin = Cm(2.2)
        section.right_margin = Cm(2.2)
        section.top_margin = Cm(1.8)
        section.bottom_margin = Cm(1.8)


def build_report():
    doc = Document()
    for section in doc.sections:
        set_page(section)

    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal.font.size = Pt(10)

    add_paragraph(doc, "TRƯỜNG ĐẠI HỌC VĂN LANG", True, 14, WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "KHOA CÔNG NGHỆ THÔNG TIN", True, 12, WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "", size=12)
    add_paragraph(doc, "CHUYÊN ĐỀ TỐT NGHIỆP 1", True, 13, WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "BÀI TẬP 3", True, 20, WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "KIỂM THỬ VÀ ĐÓNG GÓI PROTOTYPE", True, 16, WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "Mekong Mobile Smart CRM — Luồng L2", True, 13, WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "Track: Software Engineering (SE)", size=12, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "", size=12)
    add_paragraph(doc, "Sinh viên: Nguyễn Phạm Quang Thiện", size=12, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "MSSV: 2374802011250", size=12, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "Lớp: Chưa có thông tin trong workspace", size=11, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "Ngày báo cáo: 13/11/2026", size=11, alignment=WD_ALIGN_PARAGRAPH.CENTER)
    repository_link = doc.add_paragraph()
    repository_link.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run(repository_link.add_run("GitHub: "), 9)
    add_hyperlink(repository_link, REPOSITORY, REPOSITORY)
    add_paragraph(doc, "Tag v1.0: Chưa được tạo/publish tại thời điểm kiểm tra", True, 10, WD_ALIGN_PARAGRAPH.CENTER)
    doc.add_page_break()

    add_heading(doc, "Tóm tắt và trạng thái hoàn thành", 1)
    add_paragraph(
        doc,
        "Báo cáo này tổng hợp kết quả chạy thật và tình trạng đóng gói trong workspace, kèm 12 ảnh minh chứng do sinh viên cung cấp."
    )
    add_table(
        doc,
        ["Hạng mục", "Kết quả quan sát được", "Trạng thái"],
        [
            ["Kiểm thử tự động", "Docker PostgreSQL suite: 19 pass, 0 fail, 0 skipped.", "Đạt"],
            ["Kiểm tra Compose", "docker compose config --quiet thành công.", "Đạt cấu hình"],
            ["Build/khởi chạy Docker", "Compose build thành công; app và PostgreSQL healthy; /health trả 200.", "Đạt"],
            ["PostgreSQL / chạy lại seed", "PostgreSQL integration pass; db:init chạy hai lần; seed counts giữ nguyên.", "Đạt"],
            ["Bug Log", "Ba fix có commit liên kết; BUG-03 ở commit d1352d5 local, chưa push.", "Đủ commit; chờ publish"],
            ["Tag nộp", "v1.0 không có trong tag local hoặc remote lúc kiểm tra.", "Chưa hoàn tất"],
            ["Tài liệu SE", "API reference liệt kê 24 endpoint; ví dụ được lấy từ API in-memory.", "Đã soạn"],
        ],
        font_size=8,
    )
    add_paragraph(
        doc,
        "Kết luận: chưa thể xác nhận BT3 hoàn tất để nộp. Các giới hạn môi trường và mục còn thiếu được nêu rõ bên dưới; không có kết quả Docker, PostgreSQL, seed-idempotence hoặc ảnh nào được ghi PASS khi chưa chạy."
    )

    add_heading(doc, "1. Test Plan rút gọn", 1)
    add_heading(doc, "1.1 Phạm vi", 2)
    add_paragraph(
        doc,
        "Trong phạm vi: xác thực/role/owner; CRUD khách hàng và thiết bị; tạo phiếu; kiểm tra dữ liệu; phân loại; SLA theo giờ làm việc; phân công; cập nhật trạng thái và lịch sử; báo cáo quá hạn; kiểm tra thông báo lỗi. Ngoài phạm vi: kiểm thử giao diện đa trình duyệt, tải cao, kiểm thử xâm nhập và tích hợp dịch vụ bên thứ ba."
    )
    add_heading(doc, "1.2 Loại test và tiêu chí", 2)
    add_paragraph(
        doc,
        "12 kịch bản gồm đăng nhập, tra cứu khách hàng, tạo phiếu, giá trị biên mô tả 10/9 ký tự, SLA cuối tuần, điện thoại không hợp lệ, trạng thái thiếu lý do, phiếu không tồn tại, che điện thoại KTV, thiếu token và chạy lại seed PostgreSQL."
    )
    add_paragraph(
        doc,
        "Tiêu chí đo: test tự động không fail; hai lần khởi tạo seed thành công và số lượng bản ghi không đổi; API từ chối dữ liệu sai và yêu cầu không xác thực bằng mã HTTP tương ứng."
    )
    add_heading(doc, "1.3 Môi trường và dữ liệu", 2)
    add_paragraph(
        doc,
        "Lần chạy ghi nhận trên Windows, Node.js 24.12.0, npm 11.6.2; full suite được chạy trong image Node.js 20 Alpine với PostgreSQL 16 Compose và TEST_DATABASE_URL."
    )

    test_section = doc.add_section(WD_SECTION.NEW_PAGE)
    set_page(test_section, landscape=True)
    add_heading(doc, "2. Test Report — 12 kịch bản", 1)
    add_paragraph(
        doc,
        "Bảng có đủ tám trường theo đề; kết quả được đối chiếu với 12 ảnh chụp màn hình kèm theo."
    )
    test_rows = [
        ["TC-01", "Ứng dụng Docker healthy", "POST đăng nhập", "frontdesk / mật khẩu demo", "HTTP 200; trả username và role FRONTDESK", "Cao", "HTTP 200; frontdesk; FRONTDESK. Ảnh đã cắt phần lệnh chứa mật khẩu.", "PASS"],
        ["TC-02", "Tài khoản frontdesk tồn tại", "GET tra cứu khách theo phone", "0901234567", "HTTP 200; trả khách và thiết bị", "Cao", "HTTP 200; Nguyễn Văn A; iPhone 15 Pro Max; SN12345678.", "PASS"],
        ["TC-03", "Đã đăng nhập frontdesk", "POST tạo phiếu bảo hành", "Customer 1; device 1; mô tả hợp lệ; CAO", "HTTP 201; mã phiếu, MOI, hạn SLA", "Cao", "HTTP 201; mã BH20261112-001; MOI; SLA hiển thị.", "PASS"],
        ["TC-04", "Ứng dụng Docker healthy", "POST phiếu với mô tả đúng ngưỡng", "issue_desc 1234567890", "HTTP 201; chấp nhận đúng 10 ký tự", "TB", "HTTP 201; mô tả 1234567890.", "PASS"],
        ["TC-05", "Ứng dụng Docker healthy", "POST phiếu với mô tả dưới ngưỡng", "issue_desc 123456789", "HTTP 400; từ chối mô tả ngắn", "Cao", "Ảnh cho thấy HTTP 400; body thông báo không hiển thị.", "PASS"],
        ["TC-06", "Docker app container đang chạy", "Chạy 2 test SLA bằng node --test pattern", "Qua giờ đóng cửa/thứ Bảy; bỏ Chủ nhật", "Hai test SLA liên quan pass, không fail", "Cao", "2 pass, 0 fail; 5 test khác skipped do không khớp pattern.", "PASS"],
        ["TC-07", "Đã đăng nhập frontdesk", "GET tra cứu với phone sai định dạng", "0901abc", "HTTP 400; từ chối phone sai", "Cao", "Ảnh cho thấy HTTP 400; body thông báo không hiển thị.", "PASS"],
        ["TC-08", "Đăng nhập KTV; phiếu đang DANG_XU_LY", "PATCH sang CHO_LINH_KIEN, không gửi reason", "status CHO_LINH_KIEN; thiếu reason", "HTTP 400; không cho đổi trạng thái", "Cao", "Ảnh cho thấy HTTP 400; nội dung response không hiển thị.", "PASS"],
        ["TC-09", "Đăng nhập KTV", "PATCH trạng thái phiếu không tồn tại", "ticket ID 999999", "HTTP 404; phiếu không tồn tại", "TB", "Ảnh cho thấy HTTP 404.", "PASS"],
        ["TC-10", "Đăng nhập KTV", "GET queue của technician 1", "technician_id 1", "HTTP 200; phone được che 4 số giữa", "Khẩn", "HTTP 200; hiển thị 090****567.", "PASS"],
        ["TC-11", "Ứng dụng Docker healthy", "POST tạo phiếu không gửi Authorization", "Không có token", "HTTP 401 Unauthorized", "Cao", "Ảnh cho thấy HTTP 401.", "PASS"],
        ["TC-12", "PostgreSQL containers healthy", "Chạy npm run db:init hai lần, rồi đếm dữ liệu", "PostgreSQL 16 Compose; baseline hiện có", "Cả hai lệnh thành công; số lượng không đổi", "Cao", "Cả hai init thành công; trước/sau 1|1|2|3|3; PASS.", "PASS"],
    ]
    add_table(
        doc,
        ["Mã", "Tiền điều kiện", "Các bước", "Dữ liệu thử", "Kết quả mong đợi", "Ưu tiên", "Kết quả thực tế", "PASS/FAIL"],
        test_rows,
        font_size=7,
    )

    evidence_section = doc.add_section(WD_SECTION.NEW_PAGE)
    set_page(evidence_section, landscape=True)
    add_heading(doc, "3. Ảnh minh chứng TC-01 đến TC-12", 1)
    add_paragraph(
        doc,
        "Ảnh được cung cấp từ lần chạy trên máy người dùng. Để không đưa mật khẩu demo vào báo cáo, các ảnh TC-01, TC-05, TC-08, TC-09 và TC-11 đã cắt bỏ phần dòng lệnh chứa thông tin đăng nhập; ảnh gốc vẫn giữ nguyên trong thư mục screenshots/BT3."
    )
    evidence_captions = [
        "Đăng nhập frontdesk thành công — mật khẩu đã được loại khỏi ảnh báo cáo.",
        "Tra cứu khách hàng và thiết bị theo số điện thoại.",
        "Tạo phiếu bảo hành hợp lệ, mã phiếu và SLA.",
        "Mô tả đúng 10 ký tự được chấp nhận.",
        "Mô tả 9 ký tự bị từ chối; ảnh xác nhận HTTP 400, không hiển thị body lỗi.",
        "Hai test SLA liên quan pass; năm test khác được bỏ qua do không khớp pattern.",
        "Số điện thoại sai định dạng bị từ chối với HTTP 400.",
        "Thiếu lý do khi chuyển sang CHO_LINH_KIEN bị từ chối với HTTP 400.",
        "Cập nhật ticket ID không tồn tại trả HTTP 404.",
        "Queue KTV trả HTTP 200 và che số điện thoại thành 090****567.",
        "Không gửi token xác thực trả HTTP 401.",
        "Chạy db:init hai lần; số lượng dữ liệu trước/sau không thay đổi.",
    ]
    for index, caption in enumerate(evidence_captions, start=1):
        if index > 1:
            doc.add_page_break()
        add_heading(doc, f"TC-{index:02}", 2)
        add_paragraph(doc, caption, size=9)
        screenshot_path = SCREENSHOTS / f"TC-{index:02}-report.png"
        if not screenshot_path.exists():
            screenshot_path = SCREENSHOTS / f"TC-{index:02}.png"
        if not screenshot_path.exists():
            raise FileNotFoundError(f"Missing screenshot for TC-{index:02}: {screenshot_path}")
        picture_paragraph = doc.add_paragraph()
        picture_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        picture_paragraph.add_run().add_picture(str(screenshot_path), width=Cm(26.2))

    portrait_section = doc.add_section(WD_SECTION.NEW_PAGE)
    set_page(portrait_section)
    add_heading(doc, "4. Kết quả kiểm thử và giới hạn", 1)
    add_paragraph(
        doc,
        "Trong container Docker với TEST_DATABASE_URL: 19 test declarations, 19 pass, 0 fail, 0 skipped. PostgreSQL integration test lưu và đọc customer/device/ticket/status log thành công. Lần chạy host-only trước đó có 18 pass và 1 skip do không đặt TEST_DATABASE_URL."
    )
    add_paragraph(
        doc,
        "npm run db:init được chạy hai lần liên tiếp trên PostgreSQL. Trong ảnh TC-12, số lượng trước/sau đều là 1 customer, 1 device, 2 technicians, 3 users và 3 tickets. Ba ticket gồm dữ liệu mẫu cùng hai ticket được tạo ở TC-03 và TC-04."
    )

    add_heading(doc, "5. Bug Log", 1)
    add_table(
        doc,
        ["Mã / mức", "Phát hiện và triệu chứng", "Nguyên nhân / sửa", "Commit / trạng thái"],
        [
            ["BUG-01 / Major", "TC-10: KTV có thể nhìn thấy số điện thoại không che.", "Queue response cần mask 4 số giữa trước serialize.", "c3a3dc3; fix trong history; assertion hiện tại pass."],
            ["BUG-02 / Major", "TC-08: chuyển CHO_LINH_KIEN thiếu lý do.", "Thiếu validate reason trước khi ghi status/history.", "116a33f; fix trong history; API assertion hiện tại pass."],
            ["BUG-03 / Major", "Regression test mới gây lỗi service nội bộ khi GET tickets.", "Catch handler trả nguyên error.message; thêm shared responder cho lỗi 5xx.", "d1352d5 local; test pass; GitHub link chờ push."],
        ],
        font_size=8,
    )
    add_paragraph(
        doc,
        "Một bản nháp trước ghi 20514fd là commit sửa seed; đối chiếu Git cho thấy commit này không chứa seed SQL. Báo cáo đã rút lại khẳng định đó. Ba bug trong Bug Log hiện có commit tham chiếu; commit d1352d5 chứa BUG-03 nhưng chưa được đẩy lên GitHub."
    )

    add_heading(doc, "6. Đóng gói và Deployment Guide", 1)
    add_paragraph(
        doc,
        "Gói hiện có Dockerfile Node 20 Alpine, Compose PostgreSQL 16, health checks cho hai dịch vụ, nạp schema/seed qua postgres init directory, build context loại trừ .env và entrypoint tạo JWT secret ngẫu nhiên nếu thiếu. Script entrypoint được chuẩn hóa LF trong image để tương thích khi build từ checkout Windows. Bộ test được giữ trong image."
    )
    add_table(
        doc,
        ["Kiểm tra", "Kết quả"],
        [
            ["docker compose config --quiet", "PASS"],
            ["Docker daemon / services", "Đã build/up; cả hai container healthy; /health trả status healthy."],
            ["PostgreSQL integration", "19/19 pass, gồm persistence customer/device/ticket/status log."],
            ["Seed re-initialization", "db:init chạy 2 lần; counts giữ nguyên: 1/1/2/3/3."],
            ["Thử máy trắng theo tag v1.0", "Chưa chạy do chưa có tag v1.0."],
            ["Tag v1.0 local/remote", "Không tìm thấy tại thời điểm rà soát."],
        ],
        font_size=8,
    )
    add_paragraph(
        doc,
        "Hướng dẫn tiếng Anh nằm trong docs/deployment-guide.md. Build và vận hành Compose đã kiểm tra thành công trong workspace; clean-machine clone theo tag v1.0 vẫn cần làm sau khi tạo tag."
    )

    add_heading(doc, "7. Checklist bảo mật", 1)
    add_table(
        doc,
        ["#", "Tiêu chí", "Trạng thái", "Bằng chứng / giới hạn"],
        [
            ["1", "Secret repo/history", "Một phần", ".env không tracked; full-history scan chưa chạy; Compose có credential demo local."],
            ["2", "Input validation", "Đạt", "Service validation và test phone/description/priority."],
            ["3", "Role/owner access", "Đạt", "Auth middleware; test queue owner và unassigned logs."],
            ["4", "Password/data nhạy cảm", "Một phần", "Bcrypt và mask có trong code; PostgreSQL chưa kiểm."],
            ["5", "Không lộ lỗi máy chủ", "Đạt phần đã test", "Regression test 5xx generic error pass."],
            ["6", "Logging", "Chưa xác minh", "Chưa capture/review log runtime."],
            ["7", "Dependency audit", "Một phần", "npm audit --omit=dev: 0 lỗ hổng; full audit còn 2 Moderate qua nodemon → minimatch."],
        ],
        font_size=8,
    )

    add_heading(doc, "8. Tài liệu kỹ thuật và khai báo AI", 1)
    add_paragraph(
        doc,
        "Track SE: docs/api-reference.md ghi base URL, auth, input, success/error contract và ví dụ cho 24 endpoint hiện có; các mẫu response được quan sát trên API in-memory, không phải PostgreSQL. Hạn chế dữ liệu và chạy được nêu trong tài liệu."
    )
    add_paragraph(
        doc,
        "Phụ lục khai báo công cụ AI được cập nhật tại docs/ai-disclosure.md, bao gồm công cụ, mục đích, tệp áp dụng và cách kiểm chứng. Sinh viên cần đọc lại và xác nhận nội dung trước khi nộp."
    )

    add_heading(doc, "9. Việc cần hoàn thành trước khi nộp", 1)
    for item in [
        "Thực hiện clean-machine clone/start theo tag v1.0, kiểm health và chạy test trong container sau khi tag được tạo.",
        "Tạo/publish tag v1.0 sau khi nội dung được chốt; xác nhận URL public mở được.",
        "Sau khi rà soát, push commit d1352d5 và các thay đổi báo cáo; xác minh liên kết BUG-03 trên GitHub.",
        "Chạy full secret scan và npm audit; cập nhật checklist bằng kết quả.",
        "Chụp ảnh đầu ra thật cho test suite, container healthy và phép thử máy trắng; không tái sử dụng ảnh BT2.",
        "Điền lớp và rà soát toàn bộ nội dung/AI disclosure trước khi ký nộp.",
    ]:
        paragraph = doc.add_paragraph(style="List Bullet")
        run = paragraph.add_run(item)
        set_run(run, 10)

    add_paragraph(
        doc,
        "Tài liệu liên quan: docs/test-plan.md · docs/test-report.md · docs/bug-log.md · docs/deployment-guide.md · docs/checklist-bao-mat.md · docs/api-reference.md · docs/ai-disclosure.md",
        size=9,
    )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build_report()
