const test = require('node:test');
const assert = require('node:assert/strict');
process.env.STORAGE_DRIVER = 'memory';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters';
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

test.after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

async function request(path, options = {}) {
    const login = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'manager', password: 'Welcome123!' })
    });
    const token = (await login.json()).data.token;
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
            ...options.headers
        }
    });
    return { status: response.status, body: await response.json() };
}

test('customer CRUD supports create, read, update and delete', async () => {
    const created = await request('/customers', {
        method: 'POST',
        body: JSON.stringify({
            full_name: 'CRUD Customer',
            phone: '0933333333',
            email: 'crud@example.com',
            address: 'Q7'
        })
    });
    assert.equal(created.status, 201);
    const customerId = created.body.data.customer_id;

    const read = await request(`/customers/${customerId}`);
    assert.equal(read.status, 200);
    assert.equal(read.body.data.phone, '0933333333');

    const updated = await request(`/customers/${customerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ full_name: 'CRUD Customer Updated', address: 'Q1' })
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.full_name, 'CRUD Customer Updated');

    const deleted = await request(`/customers/${customerId}`, { method: 'DELETE' });
    assert.equal(deleted.status, 200);

    const missing = await request(`/customers/${customerId}`);
    assert.equal(missing.status, 404);
});

test('device CRUD supports create, read, update and delete', async () => {
    const customer = await request('/customers', {
        method: 'POST',
        body: JSON.stringify({ full_name: 'Device Owner', phone: '0944444444' })
    });
    const customerId = customer.body.data.customer_id;

    const created = await request('/devices', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: customerId,
            phone: '0944444444',
            product_name: 'Galaxy S24',
            serial_no: 'SN-CRUD-001',
            warranty_months: 12
        })
    });
    assert.equal(created.status, 201);
    const deviceId = created.body.data.device_id;

    const read = await request(`/devices/${deviceId}`);
    assert.equal(read.status, 200);
    assert.equal(read.body.data.serial_no, 'SN-CRUD-001');

    const updated = await request(`/devices/${deviceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ product_name: 'Galaxy S24 Ultra' })
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.product_name, 'Galaxy S24 Ultra');

    const deleted = await request(`/devices/${deviceId}`, { method: 'DELETE' });
    assert.equal(deleted.status, 200);

    const missing = await request(`/devices/${deviceId}`);
    assert.equal(missing.status, 404);

    await request(`/customers/${customerId}`, { method: 'DELETE' });
});

test('rejects issue_desc shorter than 10 characters after trim', async () => {
    const shortText = await request('/tickets', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: 1,
            device_id: 501,
            center_id: 1,
            issue_desc: '123456789',
            priority: 'CAO'
        })
    });
    assert.equal(shortText.status, 400);
    assert.match(shortText.body.message, /tối thiểu 10 ký tự/);

    const validText = await request('/tickets', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: 1,
            device_id: 501,
            center_id: 1,
            issue_desc: '1234567890',
            priority: 'CAO'
        })
    });
    assert.equal(validText.status, 201);
});
