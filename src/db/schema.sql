CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120),
    address VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    device_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    serial_no VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(120) NOT NULL,
    purchase_date DATE,
    warranty_months SMALLINT NOT NULL DEFAULT 12
);

CREATE TABLE IF NOT EXISTS technicians (
    technician_id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    center_id BIGINT NOT NULL,
    level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('FRONTDESK', 'MANAGER', 'TECHNICIAN')),
    technician_id BIGINT UNIQUE REFERENCES technicians(technician_id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ((role = 'TECHNICIAN' AND technician_id IS NOT NULL) OR (role <> 'TECHNICIAN' AND technician_id IS NULL))
);

CREATE TABLE IF NOT EXISTS tickets (
    ticket_id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(30) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    device_id BIGINT NOT NULL REFERENCES devices(device_id),
    center_id BIGINT NOT NULL,
    technician_id BIGINT REFERENCES technicians(technician_id),
    issue_desc TEXT NOT NULL,
    issue_category VARCHAR(30),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('CAO', 'TRUNG_BINH', 'THAP')),
    status VARCHAR(20) NOT NULL DEFAULT 'MOI' CHECK (status IN ('MOI', 'DANG_XU_LY', 'CHO_LINH_KIEN', 'HOAN_TAT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sla_deadline TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_status_logs (
    log_id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(ticket_id),
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    changed_by BIGINT REFERENCES users(user_id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS center_id BIGINT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS technician_id BIGINT REFERENCES technicians(technician_id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS issue_category VARCHAR(30);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE tickets ALTER COLUMN priority TYPE VARCHAR(20);
UPDATE tickets SET status = 'MOI' WHERE status = 'MOI_TIEP_NHAN';
UPDATE tickets
SET sla_deadline = created_at + CASE priority
    WHEN 'CAO' THEN INTERVAL '24 hours'
    WHEN 'TRUNG_BINH' THEN INTERVAL '72 hours'
    ELSE INTERVAL '120 hours'
END
WHERE sla_deadline IS NULL;
UPDATE tickets SET center_id = 1 WHERE center_id IS NULL;
ALTER TABLE tickets ALTER COLUMN center_id SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN sla_deadline SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_devices_serial_no ON devices(serial_no);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_code ON tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_technician_sla ON tickets(technician_id, sla_deadline);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_status_logs_ticket ON ticket_status_logs(ticket_id, changed_at);

