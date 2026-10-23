const pool = require('../db/pool');

const TICKET_COLUMNS = `
    t.ticket_id, t.ticket_code, t.customer_id, t.device_id, t.center_id,
    t.technician_id, t.issue_desc, t.issue_category, t.priority, t.status,
    t.created_at, t.sla_deadline`;
const TICKET_RETURNING_COLUMNS = `
    ticket_id, ticket_code, customer_id, device_id, center_id, technician_id,
    issue_desc, issue_category, priority, status, created_at, sla_deadline`;

class PostgresTicketRepository {
    async findAll() {
        const { rows } = await pool.query(`
            SELECT ${TICKET_COLUMNS}, c.full_name AS customer_name, c.phone AS customer_phone,
                   d.product_name, d.serial_no, tech.full_name AS technician_name
            FROM tickets t
            JOIN customers c USING (customer_id)
            JOIN devices d USING (device_id)
            LEFT JOIN technicians tech USING (technician_id)
            ORDER BY t.created_at DESC`);
        return rows;
    }

    async findCustomerByPhone(phone) {
        const { rows } = await pool.query(`
            SELECT c.customer_id, c.full_name, c.phone, c.email, c.address,
                   COALESCE(json_agg(json_build_object(
                       'device_id', d.device_id, 'serial_no', d.serial_no,
                       'product_name', d.product_name, 'purchase_date', d.purchase_date,
                       'warranty_months', d.warranty_months
                   )) FILTER (WHERE d.device_id IS NOT NULL), '[]'::json) AS devices
            FROM customers c LEFT JOIN devices d USING (customer_id)
            WHERE c.phone = $1 GROUP BY c.customer_id`, [phone]);
        return rows[0] || null;
    }

    async createCustomer(data) {
        const { rows } = await pool.query(`
            INSERT INTO customers (full_name, phone, email, address) VALUES ($1, $2, $3, $4)
            RETURNING customer_id, full_name, phone, email, address`,
        [data.full_name, data.phone, data.email, data.address]);
        return { ...rows[0], devices: [] };
    }

    async createDevice(data) {
        const { rows } = await pool.query(`
            INSERT INTO devices (customer_id, serial_no, product_name, purchase_date, warranty_months)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING device_id, customer_id, serial_no, product_name, purchase_date, warranty_months`,
        [data.customer_id, data.serial_no, data.product_name, data.purchase_date, data.warranty_months]);
        return rows[0];
    }

    async findTechnicianById(technicianId) {
        const { rows } = await pool.query(
            'SELECT technician_id, employee_id, full_name, center_id, level, is_active FROM technicians WHERE technician_id = $1',
            [technicianId]
        );
        return rows[0] || null;
    }

    async findEligibleTechnicians() {
        const { rows } = await pool.query(`
            SELECT technician_id, employee_id, full_name, center_id, level
            FROM technicians WHERE is_active = TRUE AND level >= 3 ORDER BY full_name`);
        return rows;
    }

    async findById(ticketId) {
        const { rows } = await pool.query(`SELECT ${TICKET_COLUMNS} FROM tickets t WHERE t.ticket_id = $1`, [ticketId]);
        return rows[0] || null;
    }

    async assignTechnician(ticket, technician) {
        const { rows } = await pool.query(`
            UPDATE tickets SET technician_id = $1 WHERE ticket_id = $2 RETURNING ${TICKET_RETURNING_COLUMNS}`,
        [technician.technician_id, ticket.ticket_id]);
        return rows[0];
    }

    async findByTechnician(technicianId) {
        const { rows } = await pool.query(`
            SELECT ${TICKET_COLUMNS}, c.full_name AS customer_name, c.phone AS customer_phone,
                   d.product_name, d.serial_no
            FROM tickets t JOIN customers c USING (customer_id) JOIN devices d USING (device_id)
            WHERE t.technician_id = $1 ORDER BY t.sla_deadline ASC`, [technicianId]);
        return rows;
    }

    async updateStatus(ticket, status, log) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const updated = await client.query(`
                UPDATE tickets SET status = $1 WHERE ticket_id = $2 RETURNING ${TICKET_RETURNING_COLUMNS}`,
            [status, ticket.ticket_id]);
            const insertedLog = await client.query(`
                INSERT INTO ticket_status_logs (ticket_id, from_status, to_status, reason, changed_by, changed_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING log_id, ticket_id, from_status, to_status, reason, changed_by, changed_at`,
            [ticket.ticket_id, log.from_status, log.to_status, log.reason, log.changed_by, log.changed_at]);
            await client.query('COMMIT');
            return { ticket: updated.rows[0], log: insertedLog.rows[0] };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findStatusLogs(ticketId) {
        const { rows } = await pool.query(`
            SELECT log_id, ticket_id, from_status, to_status, reason, changed_by, changed_at
            FROM ticket_status_logs WHERE ticket_id = $1 ORDER BY changed_at, log_id`, [ticketId]);
        return rows;
    }

    async getOverdueTicketsByTechnician(now) {
        const { rows } = await pool.query(`
            SELECT tech.technician_id, tech.employee_id, tech.full_name, tech.center_id,
                   COUNT(t.ticket_id)::int AS overdue_count
            FROM technicians tech LEFT JOIN tickets t ON t.technician_id = tech.technician_id
                AND t.status <> 'HOAN_TAT' AND t.sla_deadline < $1
            GROUP BY tech.technician_id ORDER BY tech.technician_id`, [now]);
        return rows;
    }

    async create(data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const datePart = data.created_at.slice(0, 10).replaceAll('-', '');
            await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [datePart]);
            const { rows: sequenceRows } = await client.query(`
                SELECT COALESCE(MAX(SUBSTRING(ticket_code FROM 12)::int), 0) + 1 AS next_sequence
                FROM tickets WHERE ticket_code LIKE $1`, [`BH${datePart}-%`]);
            const ticketCode = `BH${datePart}-${String(sequenceRows[0].next_sequence).padStart(3, '0')}`;
            const { rows } = await client.query(`
                INSERT INTO tickets (
                    ticket_code, customer_id, device_id, center_id, issue_desc,
                    issue_category, priority, status, created_at, sla_deadline
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING ${TICKET_RETURNING_COLUMNS}`,
            [ticketCode, data.customer_id, data.device_id, data.center_id, data.issue_desc,
                data.issue_category, data.priority, data.status, data.created_at, data.sla_deadline]);
            await client.query('COMMIT');
            return rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findUserByUsername(username) {
        const { rows } = await pool.query(`
            SELECT u.user_id, u.username, u.password_hash, u.role, u.technician_id, tech.employee_id
            FROM users u LEFT JOIN technicians tech USING (technician_id)
            WHERE u.username = $1 AND u.is_active = TRUE`, [username]);
        return rows[0] || null;
    }

    async createUser(data) {
        const { rows } = await pool.query(`
            INSERT INTO users (username, password_hash, role, technician_id)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, username, role, technician_id`,
        [data.username, data.password_hash, data.role, data.technician_id]);
        return rows[0];
    }

    async createUser(data) {
        const { rows } = await pool.query(`
            INSERT INTO users (username, password_hash, role, technician_id)
            VALUES ($1, $2, $3, $4) RETURNING user_id, username, role, technician_id`,
        [data.username, data.password_hash, data.role, data.technician_id]);
        return rows[0];
    }
}

module.exports = new PostgresTicketRepository();