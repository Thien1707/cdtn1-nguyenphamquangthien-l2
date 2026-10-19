// Thao tác trực tiếp với CSDL (hoặc mảng giả lập dữ liệu)
const tickets = [
    { ticket_id: 1,
    ticket_code: 'BH20261019-001', 
    customer_id: 1, 
    issue_desc: 'Màn hình sọc xanh', 
    priority: 'CAO', 
    status: 'MOI_TIEP_NHAN' } 
];

class TicketRepository {
    async findAll() {
        return tickets;
    }

    async create(data) {
        const newTicket = {
            ticket_id: tickets.length + 1,
            ticket_code: `BH20261019-00${tickets.length + 1}`,
            status: 'MOI_TIEP_NHAN',
            ...data
        };
        tickets.push(newTicket);
        return newTicket;
    }
}

module.exports = new TicketRepository();