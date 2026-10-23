// Logic nghiệp vụ (Validate dữ liệu)
const ticketRepository = require('../repositories/ticket.repository');

const SLA_HOURS = {
    CAO: 24,
    TRUNG_BINH: 72,
    THAP: 120
};

const BUSINESS_TIME = {
    offsetMinutes: Number(process.env.BUSINESS_TIMEZONE_OFFSET_MINUTES || 420),
    startHour: Number(process.env.BUSINESS_START_HOUR || 9),
    endHour: Number(process.env.BUSINESS_END_HOUR || 17),
    workingDays: (process.env.BUSINESS_WORKING_DAYS || '1,2,3,4,5').split(',').map(Number),
    holidays: new Set((process.env.BUSINESS_HOLIDAYS || '').split(',').filter(Boolean))
};

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
        if (typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
            throw invalid('Số điện thoại phải bao gồm đúng 10 chữ số');
        }
        const customer = await ticketRepository.findCustomerByPhone(phone);
        if (!customer) {
            const error = notFound('Không tìm thấy thông tin khách hàng với số điện thoại này.');
            error.phone = phone;
            throw error;
        }
        return customer;
    }

    async createCustomer(data) {
        if (typeof data.phone !== 'string' || !/^\d{10}$/.test(data.phone)) {
            throw invalid('Số điện thoại phải bao gồm đúng 10 chữ số');
        }
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

    async createDevice(data) {
        if (!data.customer_id || typeof data.serial_no !== 'string' || !data.serial_no.trim() ||
            typeof data.product_name !== 'string' || !data.product_name.trim()) {
            throw invalid('Khách hàng, tên thiết bị và số serial là bắt buộc');
        }
        const customer = await ticketRepository.findCustomerByPhone(data.phone);
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
        if (typeof issueDesc !== 'string' || issueDesc.trim() === '') {
            throw invalid('Mô tả lỗi không được để trống');
        }
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

        if (typeof data.issue_desc !== 'string' || data.issue_desc.trim() === '') {
            throw new Error('DU_LIEU_KHONG_HOP_LE: Mô tả lỗi không được để trống');
        }

        if (!Object.hasOwn(SLA_HOURS, data.priority)) {
            throw invalid('Mức ưu tiên không hợp lệ');
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