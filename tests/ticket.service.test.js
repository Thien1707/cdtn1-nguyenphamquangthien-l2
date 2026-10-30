const test = require('node:test');
const assert = require('node:assert/strict');
process.env.STORAGE_DRIVER = 'memory';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
const ticketService = require('../src/services/ticket.service');

const validTicket = {
    customer_id: 1,
    device_id: 501,
    center_id: 1,
    issue_desc: ' Màn hình sọc xanh ',
    priority: 'CAO'
};

test('creates a new ticket with unique code and 24-hour SLA', async () => {
    const ticket = await ticketService.createTicket(validTicket);

    assert.match(ticket.ticket_code, /^BH\d{8}-\d{3}$/);
    assert.equal(ticket.status, 'MOI');
    assert.equal(ticket.issue_desc, 'Màn hình sọc xanh');
    assert.equal(
        new Date(ticket.sla_deadline).getTime(),
        ticketService.addBusinessHours(ticket.created_at, 24).getTime()
    );
});

test('calculates SLA from priority', async () => {
    for (const [priority, expectedHours] of [['TRUNG_BINH', 72], ['THAP', 120]]) {
        const ticket = await ticketService.createTicket({ ...validTicket, priority });
        assert.equal(
            new Date(ticket.sla_deadline).getTime(),
            ticketService.addBusinessHours(ticket.created_at, expectedHours).getTime()
        );
    }
});

test('adds business hours across closing time and saturday', () => {
    const deadline = ticketService.addBusinessHours('2026-10-23T07:00:00.000Z', 4);
    assert.equal(deadline.toISOString(), '2026-10-24T02:00:00.000Z');
});

test('skips sunday when counting business hours', () => {
    const deadline = ticketService.addBusinessHours('2026-10-24T09:00:00.000Z', 8);
    assert.equal(deadline.toISOString(), '2026-10-26T08:00:00.000Z');
});

test('skips configured business holidays', () => {
    const deadline = ticketService.addBusinessHours('2026-10-23T07:00:00.000Z', 4, {
        offsetMinutes: 420,
        startHour: 9,
        endHour: 17,
        workingDays: [1, 2, 3, 4, 5],
        holidays: new Set(['2026-10-26'])
    });

    assert.equal(deadline.toISOString(), '2026-10-27T03:00:00.000Z');
});

test('rejects missing required fields, empty description, and invalid priority', async () => {
    await assert.rejects(
        ticketService.createTicket({ ...validTicket, customer_id: undefined }),
        /customer_id không được để trống/
    );
    await assert.rejects(
        ticketService.createTicket({ ...validTicket, issue_desc: '   ' }),
        /Mô tả lỗi không được để trống/
    );
    await assert.rejects(
        ticketService.createTicket({ ...validTicket, issue_desc: '123456789' }),
        /tối thiểu 10 ký tự/
    );
    await assert.rejects(
        ticketService.createTicket({ ...validTicket, priority: 'KHAN_CAP' }),
        /Mức ưu tiên không hợp lệ/
    );
});

test('generates a different ticket code for each creation', async () => {
    const first = await ticketService.createTicket(validTicket);
    const second = await ticketService.createTicket(validTicket);

    assert.notEqual(first.ticket_code, second.ticket_code);
});