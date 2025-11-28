import api from './api';

/**
 * Ticket Service - Handles all ticket-related API calls
 */
const ticketService = {
  /**
   * Create a new ticket
   * @param {Object} ticketData - Ticket data
   * @param {number} ticketData.bettingPoolId - Betting pool ID
   * @param {number} ticketData.userId - User ID
   * @param {Array} ticketData.lines - Ticket lines
   * @param {number} ticketData.globalMultiplier - Global multiplier
   * @param {number} ticketData.globalDiscount - Global discount
   * @param {string} ticketData.customerName - Customer name (optional)
   * @param {string} ticketData.customerPhone - Customer phone (optional)
   * @param {string} ticketData.notes - Notes (optional)
   * @returns {Promise<Object>} Created ticket
   */
  async createTicket(ticketData) {
    const response = await api.post('/tickets', ticketData);
    return response;
  },

  /**
   * Get ticket by ID
   * @param {number} ticketId - Ticket ID
   * @returns {Promise<Object>} Ticket details
   */
  async getTicketById(ticketId) {
    const response = await api.get(`/tickets/${ticketId}`);
    return response;
  },

  /**
   * Filter tickets with pagination
   * @param {Object} filters - Filter criteria
   * @param {string} filters.startDate - Start date (YYYY-MM-DD)
   * @param {string} filters.endDate - End date (YYYY-MM-DD)
   * @param {number} filters.bettingPoolId - Betting pool ID (optional)
   * @param {number} filters.drawId - Draw ID (optional)
   * @param {number} filters.userId - User ID (optional)
   * @param {string} filters.ticketCode - Ticket code (optional)
   * @param {boolean} filters.isCancelled - Filter by cancelled status (optional)
   * @param {boolean} filters.isPaid - Filter by paid status (optional)
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.pageSize - Page size (default: 50)
   * @returns {Promise<Object>} Paginated ticket list
   */
  async filterTickets(filters) {
    const response = await api.patch('/tickets', filters);
    return response;
  },

  /**
   * Cancel a ticket
   * @param {number} ticketId - Ticket ID
   * @returns {Promise<Object>} Updated ticket
   */
  async cancelTicket(ticketId) {
    const response = await api.patch(`/tickets/${ticketId}/cancel`);
    return response;
  },

  /**
   * Pay a ticket (mark as paid)
   * @param {number} ticketId - Ticket ID
   * @returns {Promise<Object>} Updated ticket
   */
  async payTicket(ticketId) {
    const response = await api.patch(`/tickets/${ticketId}/pay`);
    return response;
  }
};

export default ticketService;
