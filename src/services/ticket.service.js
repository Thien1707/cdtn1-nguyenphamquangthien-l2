// Logic nghiệp vụ (Validate dữ liệu)
const ticketRepository = require('../repositories/ticket.repository');

const SLA_HOURS = {
    CAO: 24,
    TRUNG_BINH: 72,
    THAP: 120
};

const BUSINESS_TIME = {
    offsetMinutes: Number(process.env.BUSINESS_TIMEZONE_OFFSET_MINUTES || 420),
    startHour: Number(process.env.BUSINESS_START_HOUR || 8),
    endHour: Number(process.env.BUSINESS_END_HOUR || 17),
    workingDays: (process.env.BUSINESS_WORKING_DAYS || '1,2,3,4,5,6').split(',').map(Number),
    holidays: new Set((process.env.BUSINESS_HOLIDAYS || '').split(',').filter(Boolean))
};

const MIN_ISSUE_DESC_LENGTH = 10;

const REQUIRED_FIELDS = ['customer_id', 'device_id', 'center_id'];
const STATUS_TRANSITIONS = {
    MOI: ['DANG_XU_LY'],
    DANG_XU_LY: ['CHO_LINH_KIEN', 'HOAN_TAT'],
    CHO_LINH_KIEN: ['DANG_XU_LY', 'HOAN_TAT'],
    HOAN_TAT: []
};

const CATEGORY_KEYWORDS = [
    { category: 'MAN_HINH', keywords: ['man hinh', 'sọc', 'soc', 'cam ung', 'hien thi', 'display'] },
    { category: 'PIN', keywords: ['pin', 'battery', 'sac nhanh het'] },
    { category: 'CAMERA', keywords: ['camera', 'may anh', 'ống kính', 'ong kinh'] },
    { category: 'AM_THANH', keywords: ['loa', 'micro', 'mic', 'am thanh', 'tieng'] },
    { category: 'SAC_NGUON', keywords: ['sac', 'khong len nguon', 'mat nguon', 'nguon', 'charging'] }
];

function normalizeText(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function invalid(message) {
    const error = new Error(`DU_LIEU_KHONG_HOP_LE: ${message}`);
    error.statusCode = 400;
    return error;
}

function validatePhone(phone) {
    if (typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
        throw invalid('Số điện thoại phải bao gồm đúng 10 chữ số');
    }
}

function validateIssueDesc(issueDesc) {
    if (typeof issueDesc !== 'string' || issueDesc.trim() === '') {
        throw invalid('Mô tả lỗi không được để trống');
    }
    if (issueDesc.trim().length < MIN_ISSUE_DESC_LENGTH) {
        throw invalid(`Mô tả lỗi phải có tối thiểu ${MIN_ISSUE_DESC_LENGTH} ký tự`);
    }
}

function notFound(message) {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
}

function addBusinessHours(start, hours, businessTime = BUSINESS_TIME) {
    if (
        !Number.isInteger(businessTime.startHour) ||
        !Number.isInteger(businessTime.endHour) ||
        businessTime.startHour < 0 ||
        businessTime.endHour > 24 ||
        businessTime.startHour >= businessTime.endHour ||
        !Number.isFinite(businessTime.offsetMinutes) ||
        businessTime.workingDays.length === 0
    ) {
        throw new TypeError('Cấu hình giờ làm việc không hợp lệ');
    }

    const remainingWorkMs = { value: hours * 60 * 60 * 1000 };
    const offsetMs = businessTime.offsetMinutes * 60 * 1000;
    let cursor = new Date(start).getTime();

    if (!Number.isFinite(cursor) || !Number.isFinite(remainingWorkMs.value) || remainingWorkMs.value < 0) {
        throw new TypeError('Thời điểm bắt đầu hoặc số giờ SLA không hợp lệ');
    }

    while (remainingWorkMs.value > 0) {
        const localDate = new Date(cursor + offsetMs);
        const year = localDate.getUTCFullYear();
        const month = localDate.getUTCMonth();
        const date = localDate.getUTCDate();
        const weekday = localDate.getUTCDay();
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        const localMidnight = Date.UTC(year, month, date);
        const workStart = localMidnight + businessTime.startHour * 60 * 60 * 1000;
        const workEnd = localMidnight + businessTime.endHour * 60 * 60 * 1000;
        const localTime = localDate.getTime();
        const isWorkingDay = businessTime.workingDays.includes(weekday) && !businessTime.holidays.has(dateKey);

        if (!isWorkingDay || localTime >= workEnd) {
            const nextDate = localMidnight + 24 * 60 * 60 * 1000;
            const nextLocal = new Date(nextDate);
            cursor = Date.UTC(nextLocal.getUTCFullYear(), nextLocal.getUTCMonth(), nextLocal.getUTCDate()) +
                businessTime.startHour * 60 * 60 * 1000 - offsetMs;
            continue;
        }

        if (localTime < workStart) {
            cursor = workStart - offsetMs;
            continue;
        }

        const availableWorkMs = workEnd - localTime;
        const consumedWorkMs = Math.min(remainingWorkMs.value, availableWorkMs);
        cursor += consumedWorkMs;
        remainingWorkMs.value -= consumedWorkMs;
    }

    return new Date(cursor);
}

class TicketService {
    async getAllTickets() {
        return ticketRepository.findAll();
    }

    async searchCustomer(phone) {
        validatePhone(phone);
        const customer = await ticketRepository.findCustomerByPhone(phone);
        if (!customer) {
            const error = notFound('Không tìm thấy thông tin khách hàng với số điện thoại này.');
            error.phone = phone;
            throw error;
        }
        return customer;
    }

    async getCustomerById(customerId) {
        const customer = await ticketRepository.findCustomerById(customerId);
        if (!customer) {
            throw notFound('Không tìm thấy khách hàng.');
        }
        return customer;
    }

    async listCustomers() {
        return ticketRepository.listCustomers();
    }

    async updateCustomer(customerId, data) {
        const customer = await ticketRepository.findCustomerById(customerId);
        if (!customer) {
            throw notFound('Không tìm thấy khách hàng.');
        }
        if (data.phone !== undefined) {
            validatePhone(data.phone);
            if (data.phone !== customer.phone) {
                const existing = await ticketRepository.findCustomerByPhone(data.phone);
                if (existing) {
                    const error = invalid('Số điện thoại đã được đăng ký');
                    error.statusCode = 409;
                    throw error;
                }
            }
        }
        if (data.full_name !== undefined && !String(data.full_name).trim()) {
            throw invalid('Họ và tên không được để trống');
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw invalid('Email không đúng định dạng');
        }
        return ticketRepository.updateCustomer(customerId, {
            full_name: data.full_name?.trim() ?? customer.full_name,
            phone: data.phone ?? customer.phone,
            email: data.email !== undefined ? (data.email?.trim() || null) : customer.email,
            address: data.address !== undefined ? (data.address?.trim() || null) : customer.address
        });
    }

    async deleteCustomer(customerId) {
        const customer = await ticketRepository.findCustomerById(customerId);
        if (!customer) {
            throw notFound('Không tìm thấy khách hàng.');
        }
        const ticketCount = await ticketRepository.countTicketsByCustomerId(customerId);
        if (ticketCount > 0) {
            const error = invalid('Không thể xóa khách hàng đã có phiếu bảo hành');
            error.statusCode = 409;
            throw error;
        }
        const deviceCount = await ticketRepository.countDevicesByCustomerId(customerId);
        if (deviceCount > 0) {
            const error = invalid('Không thể xóa khách hàng còn thiết bị trong hồ sơ');
            error.statusCode = 409;
            throw error;
        }
        await ticketRepository.deleteCustomer(customerId);
        return { customer_id: Number(customerId) };
    }

    async createCustomer(data) {
        validatePhone(data.phone);
        if (typeof data.full_name !== 'string' || !data.full_name.trim()) {
            throw invalid('Họ và tên không được để trống');
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw invalid('Email không đúng định dạng');
        }
        const existing = await ticketRepository.findCustomerByPhone(data.phone);
        if (existing) {
            const error = invalid('Số điện thoại đã được đăng ký');
            error.statusCode = 409;
            throw error;
        }
        return ticketRepository.createCustomer({
            full_name: data.full_name.trim(),
            phone: data.phone,
            email: data.email?.trim() || null,
            address: data.address?.trim() || null
        });
    }

    async getDeviceById(deviceId) {
        const device = await ticketRepository.findDeviceById(deviceId);
        if (!device) {
            throw notFound('Không tìm thấy thiết bị.');
        }
        return device;
    }

    async listDevicesByCustomer(customerId) {
        const customer = await ticketRepository.findCustomerById(customerId);
        if (!customer) {
            throw notFound('Không tìm thấy khách hàng.');
        }
        return ticketRepository.listDevicesByCustomer(customerId);
    }

    async updateDevice(deviceId, data) {
        const device = await ticketRepository.findDeviceById(deviceId);
        if (!device) {
            throw notFound('Không tìm thấy thiết bị.');
        }
        if (data.serial_no !== undefined && !String(data.serial_no).trim()) {
            throw invalid('Số serial là bắt buộc');
        }
        if (data.product_name !== undefined && !String(data.product_name).trim()) {
            throw invalid('Tên thiết bị là bắt buộc');
        }
        if (data.customer_id !== undefined && String(data.customer_id) !== String(device.customer_id)) {
            throw invalid('Thiết bị phải thuộc đúng khách hàng');
        }
        return ticketRepository.updateDevice(deviceId, {
            serial_no: data.serial_no?.trim() ?? device.serial_no,
            product_name: data.product_name?.trim() ?? device.product_name,
            purchase_date: data.purchase_date !== undefined ? data.purchase_date : device.purchase_date,
            warranty_months: data.warranty_months !== undefined ? Number(data.warranty_months) : device.warranty_months
        });
    }

    async deleteDevice(deviceId) {
        const device = await ticketRepository.findDeviceById(deviceId);
        if (!device) {
            throw notFound('Không tìm thấy thiết bị.');
        }
        const ticketCount = await ticketRepository.countTicketsByDeviceId(deviceId);
        if (ticketCount > 0) {
            const error = invalid('Không thể xóa thiết bị đã phát sinh phiếu bảo hành');
            error.statusCode = 409;
            throw error;
        }
        await ticketRepository.deleteDevice(deviceId);
        return { device_id: Number(deviceId) };
    }

    async createDevice(data) {
        if (!data.customer_id || typeof data.serial_no !== 'string' || !data.serial_no.trim() ||
            typeof data.product_name !== 'string' || !data.product_name.trim()) {
            throw invalid('Khách hàng, tên thiết bị và số serial là bắt buộc');
        }
        const customer = data.phone
            ? await ticketRepository.findCustomerByPhone(data.phone)
            : await ticketRepository.findCustomerById(data.customer_id);
        if (!customer || String(customer.customer_id) !== String(data.customer_id)) {
            throw invalid('Khách hàng không hợp lệ');
        }
        return ticketRepository.createDevice({
            customer_id: Number(data.customer_id),
            serial_no: data.serial_no.trim(),
            product_name: data.product_name.trim(),
            purchase_date: data.purchase_date || null,
            warranty_months: Number(data.warranty_months || 12)
        });
    }

    suggestCategory(issueDesc) {
        validateIssueDesc(issueDesc);
        const normalized = normalizeText(issueDesc);
        const match = CATEGORY_KEYWORDS.find(({ keywords }) =>
            keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
        );
        return { issue_category: match?.category || 'KHAC' };
    }

    async createTicket(data) {
        for (const field of REQUIRED_FIELDS) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                throw new Error(`DU_LIEU_KHONG_HOP_LE: ${field} không được để trống`);
            }
        }

        validateIssueDesc(data.issue_desc);

        if (!Object.hasOwn(SLA_HOURS, data.priority)) {
            throw invalid('Mức ưu tiên không hợp lệ');
        }

        const device = await ticketRepository.findDeviceById(data.device_id);
        if (!device || String(device.customer_id) !== String(data.customer_id)) {
            throw invalid('Thiết bị không thuộc khách hàng đã chọn');
        }

        const createdAt = new Date();
        const slaDeadline = addBusinessHours(createdAt, SLA_HOURS[data.priority]);

        return ticketRepository.create({
            ...data,
            issue_desc: data.issue_desc.trim(),
            issue_category: data.issue_category || this.suggestCategory(data.issue_desc).issue_category,
            status: 'MOI',
            created_at: createdAt.toISOString(),
            sla_deadline: slaDeadline.toISOString()
        });
    }

    async assignTechnician(ticketId, technicianId) {
        const ticket = await ticketRepository.findById(ticketId);
        if (!ticket) {
            throw notFound('Không tìm thấy phiếu bảo hành.');
        }
        const technician = await ticketRepository.findTechnicianById(technicianId);
        if (!technician || !technician.is_active) {
            throw notFound('Không tìm thấy kỹ thuật viên đang hoạt động.');
        }
        if (technician.level < 3) {
            throw invalid('Kỹ thuật viên phải có level từ 3 trở lên');
        }
        if (String(technician.center_id) !== String(ticket.center_id)) {
            throw invalid('Kỹ thuật viên không thuộc trung tâm của phiếu');
        }
        return ticketRepository.assignTechnician(ticket, technician);
    }

    async getEligibleTechnicians() {
        return ticketRepository.findEligibleTechnicians();
    }

    async getTicketsForTechnician(technicianId) {
        const technician = await ticketRepository.findTechnicianById(technicianId);
        if (!technician || !technician.is_active) {
            throw notFound('Không tìm thấy kỹ thuật viên đang hoạt động.');
        }
        return ticketRepository.findByTechnician(technicianId);
    }

    async updateTicketStatus(ticketId, nextStatus, { reason = '', changedBy = null, technicianId = null } = {}) {
        const ticket = await ticketRepository.findById(ticketId);
        if (!ticket) {
            throw notFound('Không tìm thấy phiếu bảo hành.');
        }
        if (technicianId && String(ticket.technician_id) !== String(technicianId)) {
            const error = new Error('Bạn chỉ được cập nhật phiếu được phân công cho mình.');
            error.statusCode = 403;
            throw error;
        }
        if (!Object.hasOwn(STATUS_TRANSITIONS, ticket.status) || !STATUS_TRANSITIONS[ticket.status].includes(nextStatus)) {
            throw invalid(`Không thể chuyển trạng thái từ ${ticket.status} sang ${nextStatus}`);
        }
        if (nextStatus === 'CHO_LINH_KIEN' && (!reason || !reason.trim())) {
            throw invalid('Vui lòng nhập lý do khi chuyển sang CHO_LINH_KIEN');
        }
        const log = {
            from_status: ticket.status,
            to_status: nextStatus,
            reason: reason.trim() || null,
            changed_by: changedBy,
            changed_at: new Date().toISOString()
        };
        return ticketRepository.updateStatus(ticket, nextStatus, log);
    }

    async getTicketStatusLogs(ticketId, { technicianId = null } = {}) {
        const ticket = await ticketRepository.findById(ticketId);
        if (!ticket) {
            throw notFound('Không tìm thấy phiếu bảo hành.');
        }
        if (technicianId && String(ticket.technician_id) !== String(technicianId)) {
            const error = new Error('Bạn chỉ được xem nhật ký phiếu được phân công cho mình.');
            error.statusCode = 403;
            throw error;
        }
        return ticketRepository.findStatusLogs(ticketId);
    }

    async getOverdueTicketsByTechnician() {
        return ticketRepository.getOverdueTicketsByTechnician(new Date());
    }
}

const ticketService = new TicketService();
ticketService.addBusinessHours = addBusinessHours;

module.exports = ticketService;