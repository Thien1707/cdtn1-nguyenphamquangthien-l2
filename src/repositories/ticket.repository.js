// In-memory demo data until database persistence is connected.
const customers = [
    {
        customer_id: 1,
        full_name: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'nguyenvana@gmail.com',
        address: '123 Nguyễn Trãi, Q5, TP.HCM'
    }
];

let nextCustomerId = customers.reduce((highest, customer) => Math.max(highest, customer.customer_id), 0) + 1;

const devices = [
    {
        device_id: 501,
        customer_id: 1,
        serial_no: 'SN12345678',
        product_name: 'iPhone 15 Pro Max',
        purchase_date: '2025-10-15',
        warranty_months: 12
    }
];

const technicians = [
    { technician_id: 1, employee_id: 1001, full_name: 'Trần Minh K', center_id: 1, level: 3, is_active: true },
    { technician_id: 2, employee_id: 1002, full_name: 'Lê Quốc B', center_id: 1, level: 2, is_active: true }
];

const users = [
    { user_id: 1, username: 'frontdesk', password_hash: require('bcryptjs').hashSync('Welcome123!', 10), role: 'FRONTDESK', technician_id: null, is_active: true },
    { user_id: 2, username: 'manager', password_hash: require('bcryptjs').hashSync('Welcome123!', 10), role: 'MANAGER', technician_id: null, is_active: true },
    { user_id: 3, username: 'technician', password_hash: require('bcryptjs').hashSync('Welcome123!', 10), role: 'TECHNICIAN', technician_id: 1, is_active: true }
];

const tickets = [
    {
        ticket_id: 1,
        ticket_code: 'BH20261019-001',
        customer_id: 1,
        device_id: 501,
        center_id: 1,
        technician_id: 1,
        issue_desc: 'Màn hình sọc xanh và cảm ứng bị liệt',
        issue_category: 'MAN_HINH',
        priority: 'CAO',
        status: 'DANG_XU_LY',
        created_at: '2026-10-22T02:00:00.000Z',
        sla_deadline: '2026-10-26T02:00:00.000Z'
    }
];

const ticketStatusLogs = [];

class TicketRepository {
    async findAll() {
        return tickets.map((ticket) => this.withCustomerDevice(ticket));
    }

    withCustomerDevice(ticket) {
        const customer = customers.find((item) => item.customer_id === ticket.customer_id);
        const device = devices.find((item) => item.device_id === ticket.device_id);
        const technician = technicians.find((item) => item.technician_id === ticket.technician_id);
        return {
            ...ticket,
            customer_name: customer?.full_name,
            customer_phone: customer?.phone,
            product_name: device?.product_name,
            serial_no: device?.serial_no,
            technician_name: technician?.full_name
        };
    }

    async findCustomerByPhone(phone) {
        const customer = customers.find((item) => item.phone === phone);
        if (!customer) {
            return null;
        }
        return {
            ...customer,
            devices: devices.filter((device) => device.customer_id === customer.customer_id)
        };
    }

    async createCustomer(data) {
        const customer = { customer_id: nextCustomerId++, ...data };
        customers.push(customer);
        return { ...customer, devices: [] };
    }

    async createDevice(data) {
        const device = { device_id: Math.max(0, ...devices.map((item) => item.device_id)) + 1, ...data };
        devices.push(device);
        return device;
    }

    async findTechnicianById(technicianId) {
        return technicians.find((item) => item.technician_id === Number(technicianId)) || null;
    }

    async findEligibleTechnicians() {
        return technicians.filter((item) => item.is_active && item.level >= 3);
    }

    async findUserByUsername(username) {
        return users.find((user) => user.username === username && user.is_active) || null;
    }

    async createUser(data) {
        const user = {
            user_id: users.length + 1,
            is_active: true,
            ...data
        };
        users.push(user);
        return { user_id: user.user_id, username: user.username, role: user.role, technician_id: user.technician_id };
    }

    async findById(ticketId) {
        return tickets.find((item) => item.ticket_id === Number(ticketId)) || null;
    }

    async assignTechnician(ticket, technician) {
        ticket.technician_id = technician.technician_id;
        ticket.assigned_at = new Date().toISOString();
        return ticket;
    }

    async findByTechnician(technicianId) {
        return tickets
            .filter((ticket) => ticket.technician_id === Number(technicianId))
            .sort((first, second) => Date.parse(first.sla_deadline) - Date.parse(second.sla_deadline))
            .map((ticket) => this.withCustomerDevice(ticket));
    }

    async updateStatus(ticket, status, log) {
        ticket.status = status;
        ticketStatusLogs.push({
            log_id: ticketStatusLogs.length + 1,
            ticket_id: ticket.ticket_id,
            ...log
        });
        return { ticket, log: ticketStatusLogs.at(-1) };
    }

    async findStatusLogs(ticketId) {
        return ticketStatusLogs.filter((log) => log.ticket_id === Number(ticketId));
    }

    async getOverdueTicketsByTechnician(now) {
        return technicians.map((technician) => {
            const overdueTickets = tickets.filter((ticket) =>
                ticket.technician_id === technician.technician_id &&
                ticket.status !== 'HOAN_TAT' &&
                Date.parse(ticket.sla_deadline) < now.getTime()
            );
            return {
                technician_id: technician.technician_id,
                employee_id: technician.employee_id,
                full_name: technician.full_name,
                center_id: technician.center_id,
                overdue_count: overdueTickets.length
            };
        });
    }

    async create(data) {
        const datePart = data.created_at.slice(0, 10).replaceAll('-', '');
        const prefix = `BH${datePart}-`;
        const nextSequence = tickets.reduce((highest, ticket) => {
            if (!ticket.ticket_code.startsWith(prefix)) {
                return highest;
            }
            return Math.max(highest, Number(ticket.ticket_code.slice(prefix.length)) || 0);
        }, 0) + 1;
        const newTicket = {
            ...data,
            ticket_id: tickets.length + 1,
            ticket_code: `${prefix}${String(nextSequence).padStart(3, '0')}`
        };
        tickets.push(newTicket);
        return newTicket;
    }
}

const memoryRepository = new TicketRepository();

const storageDriver = process.env.STORAGE_DRIVER || (process.env.NODE_ENV === 'test' ? 'memory' : 'postgres');

module.exports = storageDriver === 'memory'
    ? memoryRepository
    : require('./postgres-ticket.repository');