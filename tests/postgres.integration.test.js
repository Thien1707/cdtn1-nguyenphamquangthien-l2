const test = require('node:test');
const assert = require('node:assert/strict');

test('PostgreSQL can persist customer, device, ticket, and status log', {
    skip: !process.env.TEST_DATABASE_URL && 'Set TEST_DATABASE_URL to run PostgreSQL integration tests'
}, async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    process.env.STORAGE_DRIVER = 'postgres';
    process.env.JWT_SECRET ||= 'postgres-integration-test-secret-at-least-32-chars';

    const fs = require('node:fs/promises');
    const path = require('node:path');
    const pool = require('../src/db/pool');
    const repository = require('../src/repositories/postgres-ticket.repository');

    try {
        await pool.query(await fs.readFile(path.join(__dirname, '..', 'src', 'db', 'schema.sql'), 'utf8'));
        const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const customer = await repository.createCustomer({
            full_name: 'Integration Test',
            phone: `09${suffix.slice(-8)}`,
            email: null,
            address: null
        });
        const device = await repository.createDevice({
            customer_id: customer.customer_id,
            serial_no: `IT-${suffix}`,
            product_name: 'Integration device',
            purchase_date: null,
            warranty_months: 12
        });
        const now = new Date();
        const ticket = await repository.create({
            customer_id: customer.customer_id,
            device_id: device.device_id,
            center_id: 999,
            issue_desc: 'Integration test issue',
            issue_category: 'KHAC',
            priority: 'CAO',
            status: 'MOI',
            created_at: now.toISOString(),
            sla_deadline: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
        });
        const found = await repository.findById(ticket.ticket_id);

        assert.equal(found.ticket_code, ticket.ticket_code);
        assert.equal((await repository.findCustomerByPhone(customer.phone)).devices[0].serial_no, device.serial_no);

        await pool.query('DELETE FROM tickets WHERE ticket_id = $1', [ticket.ticket_id]);
        await pool.query('DELETE FROM devices WHERE device_id = $1', [device.device_id]);
        await pool.query('DELETE FROM customers WHERE customer_id = $1', [customer.customer_id]);
    } finally {
        await pool.end();
    }
});