const state = {
    token: localStorage.getItem('mekong-token'),
    user: JSON.parse(localStorage.getItem('mekong-user') || 'null'),
    customer: null,
    activeTab: ''
};

const loginView = document.querySelector('#login-view');
const appView = document.querySelector('#app-view');
const workspace = document.querySelector('#workspace');
const tabs = document.querySelector('#tabs');
const toast = document.querySelector('#toast');

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function notify(message, isError = false) {
    toast.textContent = message;
    toast.classList.toggle('error-toast', isError);
    toast.classList.add('show');
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

async function api(path, options = {}) {
    const response = await fetch(`/api/v1${path}`, {
        ...options,
        headers: {
            ...(options.body ? { 'content-type': 'application/json' } : {}),
            ...(state.token ? { authorization: `Bearer ${state.token}` } : {}),
            ...options.headers
        }
    });
    const result = await response.json();
    if (!response.ok) {
        const error = new Error(result.message || 'Có lỗi xảy ra');
        error.status = response.status;
        error.data = result;
        throw error;
    }
    return result.data;
}

function showLogin() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('mekong-token');
    localStorage.removeItem('mekong-user');
    loginView.hidden = false;
    appView.hidden = true;
}

function startApp() {
    if (!state.user || !state.token) return showLogin();
    loginView.hidden = true;
    appView.hidden = false;
    document.querySelector('#user-label').textContent = `${state.user.username} · ${state.user.role}`;
    const options = state.user.role === 'FRONTDESK'
        ? [['intake', 'Tiếp nhận'], ['tickets', 'Phiếu bảo hành']]
        : state.user.role === 'MANAGER'
            ? [['tickets', 'Phiếu bảo hành'], ['assign', 'Phân công'], ['report', 'Báo cáo quá hạn']]
            : [['queue', 'Phiếu được giao']];
    tabs.innerHTML = options.map(([id, title]) =>
        `<button class="tab" type="button" data-tab="${id}" aria-selected="false">${title}</button>`
    ).join('');
    tabs.onclick = (event) => {
        const button = event.target.closest('[data-tab]');
        if (button) renderTab(button.dataset.tab);
    };
    renderTab(options[0][0]);
}

function pageHeading(kicker, title, action = '') {
    return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1></div>${action}</div>`;
}

function renderTab(tab) {
    state.activeTab = tab;
    tabs.querySelectorAll('.tab').forEach((button) => {
        button.setAttribute('aria-selected', String(button.dataset.tab === tab));
    });
    if (tab === 'intake') renderIntake();
    if (tab === 'tickets') renderTickets();
    if (tab === 'assign') renderAssignment();
    if (tab === 'queue') renderQueue();
    if (tab === 'report') renderReport();
}

function renderIntake() {
    workspace.innerHTML = `${pageHeading('KHÁCH HÀNG · TIẾP NHẬN', 'Tạo phiếu bảo hành')}
        <div class="layout-grid">
            <section class="panel">
                <h2>1. Tra cứu khách hàng</h2>
                <form id="lookup-form" class="toolbar">
                    <input name="phone" inputmode="numeric" maxlength="10" pattern="[0-9]{10}" placeholder="Số điện thoại 10 chữ số" required>
                    <button class="button primary">Tra cứu <span aria-hidden="true">→</span></button>
                </form>
                <div id="customer-result" class="customer-result"></div>
            </section>
            <section class="panel">
                <h2>2. Thông tin phiếu</h2>
                <form id="ticket-form" class="form-grid">
                    <label class="wide">Thiết bị<select name="device_id" id="device-select" required disabled><option value="">Tra cứu khách trước</option></select></label>
                    <label class="wide">Mô tả sự cố<textarea name="issue_desc" required placeholder="Mô tả rõ hiện tượng, lỗi thiết bị..."></textarea></label>
                    <label>Mức ưu tiên<select name="priority"><option value="CAO">Cao · 24 giờ</option><option value="TRUNG_BINH">Trung bình · 72 giờ</option><option value="THAP">Thấp · 120 giờ</option></select></label>
                    <label>Trung tâm<input name="center_id" type="number" min="1" value="1" required></label>
                    <div class="wide form-actions"><button class="button primary" type="submit" disabled id="save-ticket">Lưu phiếu</button><span class="subtle">Hạn SLA tự tính theo giờ làm việc.</span></div>
                </form>
            </section>
        </div>`;
    document.querySelector('#lookup-form').addEventListener('submit', lookupCustomer);
    document.querySelector('#ticket-form').addEventListener('submit', createTicket);
}

async function lookupCustomer(event) {
    event.preventDefault();
    const phone = new FormData(event.currentTarget).get('phone');
    const result = document.querySelector('#customer-result');
    state.customer = null;
    try {
        const customer = await api(`/customers/search?phone=${encodeURIComponent(phone)}`);
        state.customer = customer;
        renderCustomer(customer);
    } catch (error) {
        if (error.status === 404) {
            renderNewCustomer(phone);
        } else {
            result.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
        }
    }
}

function renderCustomer(customer) {
    const result = document.querySelector('#customer-result');
    result.innerHTML = `<div class="customer-summary">
        <span><strong>Khách hàng</strong><br>${escapeHtml(customer.full_name)}</span>
        <span><strong>Điện thoại</strong><br>${escapeHtml(customer.phone)}</span>
        <span><strong>Email</strong><br>${escapeHtml(customer.email || 'Chưa có')}</span>
        <span><strong>Địa chỉ</strong><br>${escapeHtml(customer.address || 'Chưa có')}</span>
    </div>
    <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>Chọn</th><th>Thiết bị</th><th>Serial</th><th>Bảo hành</th></tr></thead>
    <tbody>${customer.devices.map((device) => `<tr><td><input type="radio" name="device-choice" value="${escapeHtml(device.device_id)}" aria-label="Chọn ${escapeHtml(device.product_name)}"></td><td>${escapeHtml(device.product_name)}</td><td>${escapeHtml(device.serial_no)}</td><td>${escapeHtml(device.purchase_date || '—')}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Chưa có thiết bị trong hồ sơ</td></tr>'}</tbody></table></div>
    ${customer.devices.length ? '' : '<button class="button secondary" id="add-device" type="button" style="margin-top:12px">Thêm thiết bị</button>'}`;
    result.querySelectorAll('[name="device-choice"]').forEach((radio) => radio.addEventListener('change', () => {
        const select = document.querySelector('#device-select');
        select.innerHTML = customer.devices.map((device) => `<option value="${escapeHtml(device.device_id)}">${escapeHtml(device.product_name)} · ${escapeHtml(device.serial_no)}</option>`).join('');
        select.value = radio.value;
        select.disabled = false;
        document.querySelector('#save-ticket').disabled = false;
    }));
    result.querySelector('#add-device')?.addEventListener('click', () => renderNewDevice(customer));
    if (customer.devices.length) {
        const select = document.querySelector('#device-select');
        select.innerHTML = customer.devices.map((device) => `<option value="${escapeHtml(device.device_id)}">${escapeHtml(device.product_name)} · ${escapeHtml(device.serial_no)}</option>`).join('');
        select.disabled = false;
        document.querySelector('#save-ticket').disabled = false;
    }
}

function renderNewCustomer(phone) {
    document.querySelector('#customer-result').innerHTML = `<div class="panel" style="padding:16px;background:#fbf7ef">
        <h2>Chưa có hồ sơ · Tạo khách hàng</h2>
        <form id="customer-form" class="form-grid">
            <label>Họ và tên<input name="full_name" required></label>
            <label>Số điện thoại<input name="phone" value="${escapeHtml(phone)}" readonly></label>
            <label>Email<input name="email" type="email"></label>
            <label>Địa chỉ<input name="address"></label>
            <div class="wide form-actions"><button class="button primary">Tạo khách hàng</button></div>
        </form></div>`;
    document.querySelector('#customer-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        try {
            state.customer = await api('/customers', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))) });
            renderCustomer(state.customer);
            renderNewDevice(state.customer);
            notify('Đã tạo khách hàng. Thêm thiết bị để lập phiếu.');
        } catch (error) { notify(error.message, true); }
    });
}

function renderNewDevice(customer) {
    const holder = document.querySelector('#customer-result');
    const form = document.createElement('form');
    form.className = 'panel form-grid';
    form.style.cssText = 'margin-top:12px;padding:16px;background:#f4f8f2';
    form.innerHTML = `<h2 class="wide">Thêm thiết bị cho ${escapeHtml(customer.full_name)}</h2>
        <label>Tên thiết bị<input name="product_name" required></label>
        <label>Số serial/IMEI<input name="serial_no" required></label>
        <label>Ngày mua<input name="purchase_date" type="date"></label>
        <label>Số tháng bảo hành<input name="warranty_months" type="number" min="1" value="12"></label>
        <div class="wide form-actions"><button class="button primary">Lưu thiết bị</button></div>`;
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        try {
            const payload = Object.fromEntries(new FormData(formElement));
            payload.customer_id = customer.customer_id;
            payload.phone = customer.phone;
            const device = await api('/devices', { method: 'POST', body: JSON.stringify(payload) });
            customer.devices.push(device);
            renderCustomer(customer);
            const select = document.querySelector('#device-select');
            select.value = device.device_id;
            notify('Đã thêm thiết bị. Có thể lập phiếu bảo hành.');
        } catch (error) { notify(error.message, true); }
    });
    holder.append(form);
}

async function createTicket(event) {
    event.preventDefault();
    if (!state.customer) return notify('Hãy tra cứu khách hàng trước.', true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
        const ticket = await api('/tickets', { method: 'POST', body: JSON.stringify({
            customer_id: state.customer.customer_id,
            device_id: Number(form.get('device_id')),
            center_id: Number(form.get('center_id')),
            issue_desc: form.get('issue_desc'),
            priority: form.get('priority')
        }) });
        notify(`Đã tạo phiếu ${ticket.ticket_code}`);
        formElement.reset();
    } catch (error) { notify(error.message, true); }
}

async function renderTickets() {
    workspace.innerHTML = `${pageHeading('DANH SÁCH', 'Phiếu bảo hành')}<div class="toolbar"><select id="status-filter"><option value="">Tất cả trạng thái</option><option>MOI</option><option>DANG_XU_LY</option><option>CHO_LINH_KIEN</option><option>HOAN_TAT</option></select><input id="ticket-search" placeholder="Tìm mã phiếu, khách hàng, serial"><button class="button secondary" id="refresh-tickets">Làm mới</button></div><div id="ticket-table" class="table-wrap"></div>`;
    document.querySelector('#refresh-tickets').onclick = loadTickets;
    document.querySelector('#status-filter').onchange = loadTickets;
    document.querySelector('#ticket-search').oninput = loadTickets;
    await loadTickets();
}

async function loadTickets() {
    try {
        const [tickets] = await Promise.all([api('/tickets')]);
        const status = document.querySelector('#status-filter')?.value || '';
        const search = (document.querySelector('#ticket-search')?.value || '').toLowerCase();
        const filtered = tickets.filter((ticket) => (!status || ticket.status === status) &&
            `${ticket.ticket_code} ${ticket.customer_name || ''} ${ticket.serial_no || ''}`.toLowerCase().includes(search));
        document.querySelector('#ticket-table').innerHTML = `<table><thead><tr><th>Mã phiếu</th><th>Khách hàng</th><th>Điện thoại</th><th>Thiết bị</th><th>Trạng thái</th><th>Ưu tiên</th><th>Hạn SLA</th></tr></thead><tbody>${filtered.map((ticket) => `<tr><td><strong>${escapeHtml(ticket.ticket_code)}</strong></td><td>${escapeHtml(ticket.customer_name || `#${ticket.customer_id}`)}</td><td>${escapeHtml(ticket.customer_phone || '—')}</td><td>${escapeHtml(ticket.product_name || ticket.serial_no || `#${ticket.device_id}`)}</td><td><span class="badge">${escapeHtml(ticket.status)}</span></td><td>${escapeHtml(ticket.priority)}</td><td>${escapeHtml(new Date(ticket.sla_deadline).toLocaleString('vi-VN'))}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">Không có phiếu phù hợp</td></tr>'}</tbody></table>`;
    } catch (error) { notify(error.message, true); }
}

async function renderAssignment() {
    workspace.innerHTML = `${pageHeading('QUẢN LÝ ĐIỀU PHỐI', 'Phân công kỹ thuật viên')}
        <section class="panel" style="max-width:760px"><h2>Gán phiếu cho kỹ thuật viên đủ bậc</h2><form id="assign-form" class="form-grid">
            <label class="wide">Phiếu bảo hành<select name="ticket_id" id="assign-ticket" required></select></label>
            <label class="wide">Kỹ thuật viên<select name="technician_id" id="assign-technician" required></select></label>
            <p class="wide subtle">Danh sách chỉ gồm kỹ thuật viên đang hoạt động, có level từ 3 trở lên; API kiểm tra thêm trung tâm của phiếu.</p>
            <div class="wide form-actions"><button class="button primary">Phân công</button></div>
        </form></section>`;
    try {
        const [tickets, technicians] = await Promise.all([api('/tickets'), api('/technicians/eligible')]);
        document.querySelector('#assign-ticket').innerHTML = tickets.map((ticket) =>
            `<option value="${escapeHtml(ticket.ticket_id)}">${escapeHtml(ticket.ticket_code)} · ${escapeHtml(ticket.customer_name || `#${ticket.customer_id}`)} · ${escapeHtml(ticket.status)}</option>`
        ).join('');
        document.querySelector('#assign-technician').innerHTML = technicians.map((technician) =>
            `<option value="${escapeHtml(technician.technician_id)}">${escapeHtml(technician.full_name)} · Level ${escapeHtml(technician.level)} · TT ${escapeHtml(technician.center_id)}</option>`
        ).join('');
        if (!tickets.length || !technicians.length) {
            notify('Cần có phiếu và kỹ thuật viên đủ level để phân công.', true);
        }
    } catch (error) { notify(error.message, true); }
    document.querySelector('#assign-form').onsubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        try {
            await api(`/tickets/${data.ticket_id}/assign`, { method: 'POST', body: JSON.stringify({ technician_id: Number(data.technician_id) }) });
            notify('Đã phân công phiếu.');
            form.reset();
        } catch (error) { notify(error.message, true); }
    };
}

async function renderQueue() {
    workspace.innerHTML = `${pageHeading('KỸ THUẬT VIÊN', 'Phiếu được giao')}<div id="queue-table" class="table-wrap"></div>`;
    try {
        const tickets = await api(`/technicians/${state.user.technician_id}/tickets`);
        document.querySelector('#queue-table').innerHTML = `<table><thead><tr><th>Mã phiếu</th><th>Khách hàng</th><th>Điện thoại</th><th>Thiết bị</th><th>Hạn SLA</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead><tbody>${tickets.map((ticket) => `<tr><td>${escapeHtml(ticket.ticket_code)}</td><td>${escapeHtml(ticket.customer_name)}</td><td>${escapeHtml(ticket.customer_phone)}</td><td>${escapeHtml(ticket.product_name)}</td><td>${escapeHtml(new Date(ticket.sla_deadline).toLocaleString('vi-VN'))}</td><td><span class="badge">${escapeHtml(ticket.status)}</span></td><td><button class="button secondary" data-update="${escapeHtml(ticket.ticket_id)}">Cập nhật</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty">Chưa có phiếu được giao</td></tr>'}</tbody></table>`;
        document.querySelectorAll('[data-update]').forEach((button) => button.onclick = () => renderStatusForm(button.dataset.update));
    } catch (error) { notify(error.message, true); }
}

function renderStatusForm(ticketId) {
    document.querySelector('#workspace').insertAdjacentHTML('beforeend', `<section class="panel" style="max-width:560px;margin-top:16px"><h2>Cập nhật phiếu #${escapeHtml(ticketId)}</h2><form id="status-form" class="form-grid"><label>Trạng thái<select name="status"><option value="DANG_XU_LY">Đang xử lý</option><option value="CHO_LINH_KIEN">Chờ linh kiện</option><option value="HOAN_TAT">Hoàn tất</option></select></label><label>Lý do<input name="reason" placeholder="Bắt buộc nếu chờ linh kiện"></label><div class="wide form-actions"><button class="button primary">Lưu cập nhật</button></div></form></section>`);
    document.querySelector('#status-form').onsubmit = async (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        try {
            await api(`/tickets/${ticketId}/status`, { method: 'PATCH', body: JSON.stringify(values) });
            notify('Đã cập nhật trạng thái và nhật ký.');
            renderQueue();
        } catch (error) { notify(error.message, true); }
    };
}

async function renderReport() {
    workspace.innerHTML = `${pageHeading('THEO DÕI SLA', 'Báo cáo phiếu quá hạn')}<div id="report-content"></div>`;
    try {
        const rows = await api('/reports/overdue-tickets');
        const total = rows.reduce((sum, item) => sum + Number(item.overdue_count), 0);
        document.querySelector('#report-content').innerHTML = `<section class="panel" style="margin-bottom:16px"><p class="eyebrow">TỔNG PHIẾU ĐANG QUÁ HẠN</p><div class="report-number">${total}</div></section><div class="table-wrap"><table><thead><tr><th>Kỹ thuật viên</th><th>Mã nhân viên</th><th>Trung tâm</th><th>Phiếu quá hạn</th></tr></thead><tbody>${rows.map((item) => `<tr><td>${escapeHtml(item.full_name)}</td><td>${escapeHtml(item.employee_id)}</td><td>${escapeHtml(item.center_id)}</td><td><span class="badge ${item.overdue_count ? 'overdue' : ''}">${escapeHtml(item.overdue_count)}</span></td></tr>`).join('')}</tbody></table></div>`;
    } catch (error) { notify(error.message, true); }
}

document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const errorView = document.querySelector('#login-error');
    try {
        const result = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: form.get('username'), password: form.get('password') })
        });
        state.token = result.token;
        state.user = result.user;
        localStorage.setItem('mekong-token', result.token);
        localStorage.setItem('mekong-user', JSON.stringify(result.user));
        errorView.textContent = '';
        startApp();
    } catch (error) { errorView.textContent = error.message; }
});

document.querySelector('#logout').addEventListener('click', showLogin);
startApp();