const test = require('node:test');
const assert = require('node:assert/strict');
process.env.STORAGE_DRIVER = 'memory';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
const app = require('../src/app');
const ticketRepository = require('../src/repositories/ticket.repository');

let server;
let baseUrl;
let managerToken;
let technicianToken;

test.before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
    const managerLogin = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'manager', password: 'Welcome123!' })
    });
    managerToken = (await managerLogin.json()).data.token;
    const technicianLogin = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'technician', password: 'Welcome123!' })
    });
    technicianToken = (await technicianLogin.json()).data.token;
});

test.after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

async function request(path, options) {
    const token = options && Object.hasOwn(options, 'token') ? options.token : managerToken;
    const { token: _token, ...fetchOptions } = options || {};
    const response = await fetch(`${baseUrl}${path}`, {
        ...fetchOptions,
        headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
            ...options?.headers
        }
    });
    return { status: response.status, body: await response.json() };
}

test('authentication enforces login and role permissions', async () => {
    const anonymous = await request('/tickets', { token: null });
    assert.equal(anonymous.status, 401);

    const forbidden = await request('/reports/overdue-tickets', { token: technicianToken });
    assert.equal(forbidden.status, 403);

    const ownQueue = await request('/technicians/1/tickets', { token: technicianToken });
    assert.equal(ownQueue.status, 200);
    assert.ok(ownQueue.body.data.every((ticket) => ticket.customer_phone === '090****567'));

    const otherQueue = await request('/technicians/2/tickets', { token: technicianToken });
    assert.equal(otherQueue.status, 403);

    const otherTicketStatus = await request('/tickets/999/status', {
        method: 'PATCH',
        token: technicianToken,
        body: JSON.stringify({ status: 'HOAN_TAT' })
    });
    assert.equal(otherTicketStatus.status, 404);
});

test('customer lookup validates phone and returns customer devices', async () => {
    const found = await request('/customers/search?phone=0901234567');
    assert.equal(found.status, 200);
    assert.equal(found.body.data.email, 'nguyenvana@gmail.com');
    assert.equal(found.body.data.devices[0].serial_no, 'SN12345678');

    const invalid = await request('/customers/search?phone=123');
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.message, 'DU_LIEU_KHONG_HOP_LE: Số điện thoại phải bao gồm đúng 10 chữ số');

    const missing = await request('/customers/search?phone=0911111111');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.phone, '0911111111');
    assert.equal(missing.body.next_action, 'CREATE_CUSTOMER');
});

test('creates a customer using the prefilled phone and rejects duplicates', async () => {
    const created = await request('/customers', {
        method: 'POST',
        body: JSON.stringify({
            full_name: 'Khách mới',
            phone: '0923456789',
            email: 'khachmoi@example.com',
            address: 'Quận 1'
        })
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.phone, '0923456789');

    const found = await request('/customers/search?phone=0923456789');
    assert.equal(found.status, 200);
    assert.equal(found.body.data.full_name, 'Khách mới');

    const duplicate = await request('/customers', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'Tên khác', phone: '0923456789' })
    });
    assert.equal(duplicate.status, 409);
});

test('category suggestion recognizes Vietnamese issue descriptions', async () => {
    const result = await request('/tickets/suggest-category', {
        method: 'POST',
        body: JSON.stringify({ issue_desc: 'Màn hình sọc xanh' })
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.data.issue_category, 'MAN_HINH');
});

test('technician assignment enforces level and technician queue sorts by SLA', async () => {
    const lowLevel = await request('/tickets/1/assign', {
        method: 'POST',
        body: JSON.stringify({ technician_id: 2 })
    });
    assert.equal(lowLevel.status, 400);

    const createdTickets = [];
    for (const priority of ['THAP', 'CAO']) {
        const created = await request('/tickets', {
            method: 'POST',
            body: JSON.stringify({
                customer_id: 1,
                device_id: 501,
                center_id: 1,
                issue_desc: 'Màn hình sọc xanh',
                priority
            })
        });
        assert.equal(created.status, 201);
        createdTickets.push(created.body.data);

        const assigned = await request(`/tickets/${created.body.data.ticket_id}/assign`, {
            method: 'POST',
            body: JSON.stringify({ technician_id: 1 })
        });
        assert.equal(assigned.status, 200);
        assert.equal(assigned.body.data.technician_id, 1);
    }

    const queue = await request('/technicians/1/tickets', { token: technicianToken });
    assert.equal(queue.status, 200);
    const deadlines = queue.body.data.map((ticket) => Date.parse(ticket.sla_deadline));
    assert.deepEqual(deadlines, [...deadlines].sort((first, second) => first - second));
    for (const created of createdTickets) {
        assert.ok(queue.body.data.some((ticket) => ticket.ticket_id === created.ticket_id));
    }
});

test('status update requires a reason for parts wait and records history', async () => {
    const missingReason = await request('/tickets/1/status', {
        method: 'PATCH',
        token: technicianToken,
        body: JSON.stringify({ status: 'CHO_LINH_KIEN' })
    });
    assert.equal(missingReason.status, 400);

    const updated = await request('/tickets/1/status', {
        method: 'PATCH',
        token: technicianToken,
        body: JSON.stringify({
            status: 'CHO_LINH_KIEN',
            reason: 'Thiếu linh kiện màn hình',
            changed_by: 1001
        })
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.status, 'CHO_LINH_KIEN');
    assert.equal(updated.body.log.reason, 'Thiếu linh kiện màn hình');

    const logs = await request('/tickets/1/status-logs', { token: technicianToken });
    assert.equal(logs.status, 200);
    assert.equal(logs.body.data.at(-1).to_status, 'CHO_LINH_KIEN');

    const unassigned = await request('/tickets', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: 1,
            device_id: 501,
            center_id: 1,
            issue_desc: 'Ticket chưa được giao',
            priority: 'CAO'
        })
    });
    const unassignedLogs = await request(`/tickets/${unassigned.body.data.ticket_id}/status-logs`, { token: technicianToken });
    assert.equal(unassignedLogs.status, 403);
});

test('overdue report counts unfinished overdue tickets by technician', async () => {
    const assignedTicket = await ticketRepository.findById(1);
    assignedTicket.sla_deadline = new Date(Date.now() - 60_000).toISOString();
    const report = await request('/reports/overdue-tickets');

    assert.equal(report.status, 200);
    assert.equal(report.body.data.find((row) => row.technician_id === 1).overdue_count, 1);
    assert.equal(report.body.data.find((row) => row.technician_id === 2).overdue_count, 0);
});