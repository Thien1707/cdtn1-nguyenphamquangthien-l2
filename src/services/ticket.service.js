// Logic nghiệp vụ (Validate dữ liệu)
const ticketRepository = require('../repositories/ticket.repository');

class TicketService {
    async getAllTickets() {
        return await ticketRepository.findAll();
    }

    async createTicket(data) {
        if (!data.issue_desc || data.issue_desc.trim() === '') {
            throw new Error('DU_LIEU_KHONG_HOP_LE: Mô tả lỗi không được để trống');
        }
        return await ticketRepository.create(data);
    }
}

module.exports = new TicketService();