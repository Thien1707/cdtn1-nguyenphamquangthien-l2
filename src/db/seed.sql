INSERT INTO customers (full_name, phone, email, address)
VALUES ('Nguyễn Văn A', '0901234567', 'nguyenvana@gmail.com', '123 Nguyễn Trãi, Q5')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO devices (customer_id, serial_no, product_name, purchase_date, warranty_months)
VALUES (
	(SELECT customer_id FROM customers WHERE phone = '0901234567'),
	'SN12345678',
	'iPhone 15 Pro Max',
	'2026-01-15',
	12
)
ON CONFLICT (serial_no) DO NOTHING;

INSERT INTO technicians (employee_id, full_name, center_id, level)
VALUES (1001, 'Trần Minh K', 1, 3), (1002, 'Lê Quốc B', 1, 2)
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO tickets (ticket_code, customer_id, device_id, center_id, technician_id, issue_desc, issue_category, priority, status, sla_deadline)
VALUES (
	'BH20261019-001',
	(SELECT customer_id FROM customers WHERE phone = '0901234567'),
	(SELECT device_id FROM devices WHERE serial_no = 'SN12345678'),
	1,
	(SELECT technician_id FROM technicians WHERE employee_id = 1001),
	'Màn hình sọc xanh và cảm ứng bị liệt',
	'MAN_HINH',
	'CAO',
	'DANG_XU_LY',
	TIMESTAMPTZ '2026-10-26 02:00:00+00'
)
ON CONFLICT (ticket_code) DO NOTHING;

INSERT INTO users (username, password_hash, role, technician_id)
VALUES 
	('frontdesk', '$2b$10$zp.ilwDEQzh17TEUulfAI.pZ3BwaNLTgUVtqYRyH03hj3j8I2WF6C', 'FRONTDESK', NULL),
	('manager', '$2b$10$zp.ilwDEQzh17TEUulfAI.pZ3BwaNLTgUVtqYRyH03hj3j8I2WF6C', 'MANAGER', NULL),
	('technician', '$2b$10$zp.ilwDEQzh17TEUulfAI.pZ3BwaNLTgUVtqYRyH03hj3j8I2WF6C', 'TECHNICIAN', (SELECT technician_id FROM technicians WHERE employee_id = 1001))
ON CONFLICT (username) DO NOTHING;
