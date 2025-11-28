/**
 * Ticket Service - Handles all ticket-related API calls
 * Based on API V4.0 documentation
 */

import api from './api';

// Types
export interface TicketLine {
  drawId: number;
  betTypeId: number;
  numbers: string;
  amount: number;
  multiplier?: number;
}

export interface CreateTicketRequest {
  bettingPoolId: number;
  userId: number;
  lines: TicketLine[];
  globalMultiplier?: number;
  globalDiscount?: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface TicketResponse {
  ticketId: number;
  ticketCode: string;
  createdAt: string;
  userName: string;
  grandTotal: number;
  totalPrize: number;
  cancelledAt: string | null;
  isCancelled: boolean;
  isPaid: boolean;
  bettingPoolId: number;
  bettingPoolName?: string;
}

export interface TicketFilterParams {
  startDate: string;
  endDate: string;
  bettingPoolId?: number;
  lotteryId?: number;  // Used for timezone-aware date filtering
  drawId?: number;
  userId?: number;
  ticketCode?: string;
  isCancelled?: boolean;
  isPaid?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TicketFilterResponse {
  tickets: TicketResponse[];
  pageSize: number;
  pageNumber: number;
  totalRecords: number;
}

export interface MappedTicket {
  id: number;
  numero: string;
  fecha: string;
  usuario: string;
  monto: number;
  premio: number;
  fechaCancelacion: string | null;
  estado: 'Ganador' | 'Cancelado' | 'Pagado' | 'Pendiente';
}

export interface TicketCounts {
  todos: number;
  ganadores: number;
  pendientes: number;
  perdedores: number;
  cancelados: number;
}

export interface TicketTotals {
  montoTotal: number;
  totalPremios: number;
  totalPendiente: number;
}

/**
 * Create a new ticket
 */
export const createTicket = async (ticketData: CreateTicketRequest): Promise<TicketResponse> => {
  const response = await api.post<TicketResponse>('/tickets', ticketData);
  if (!response) {
    throw new Error('No response from server');
  }
  return response;
};

/**
 * Get ticket by ID
 */
export const getTicketById = async (ticketId: number): Promise<TicketResponse> => {
  const response = await api.get<TicketResponse>(`/tickets/${ticketId}`);
  if (!response) {
    throw new Error('Ticket not found');
  }
  return response;
};

/**
 * Filter tickets with pagination
 */
export const filterTickets = async (filters: TicketFilterParams): Promise<TicketFilterResponse> => {
  const response = await api.patch<TicketFilterResponse>('/tickets', filters);
  return response || { tickets: [], pageSize: 0, pageNumber: 1, totalRecords: 0 };
};

/**
 * Cancel a ticket
 */
export const cancelTicket = async (ticketId: number): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(`/tickets/${ticketId}/cancel`);
  if (!response) {
    throw new Error('Failed to cancel ticket');
  }
  return response;
};

/**
 * Pay a ticket (mark as paid)
 */
export const payTicket = async (ticketId: number): Promise<TicketResponse> => {
  const response = await api.patch<TicketResponse>(`/tickets/${ticketId}/pay`);
  if (!response) {
    throw new Error('Failed to mark ticket as paid');
  }
  return response;
};

/**
 * Map API ticket response to component format
 */
export const mapTicketResponse = (ticket: TicketResponse): MappedTicket => {
  let estado: MappedTicket['estado'];

  if (ticket.isCancelled) {
    estado = 'Cancelado';
  } else if (ticket.totalPrize > 0) {
    estado = 'Ganador';
  } else if (ticket.isPaid) {
    estado = 'Pagado';
  } else {
    estado = 'Pendiente';
  }

  return {
    id: ticket.ticketId,
    numero: ticket.ticketCode,
    fecha: new Date(ticket.createdAt).toLocaleDateString(),
    usuario: ticket.userName || 'N/A',
    monto: ticket.grandTotal,
    premio: ticket.totalPrize || 0,
    fechaCancelacion: ticket.cancelledAt
      ? new Date(ticket.cancelledAt).toLocaleDateString()
      : null,
    estado,
  };
};

/**
 * Calculate ticket counts by status
 */
export const calculateTicketCounts = (tickets: MappedTicket[]): TicketCounts => {
  return {
    todos: tickets.length,
    ganadores: tickets.filter(t => t.estado === 'Ganador').length,
    pendientes: tickets.filter(t => t.estado === 'Pendiente').length,
    perdedores: tickets.filter(t => t.estado === 'Pagado').length,
    cancelados: tickets.filter(t => t.estado === 'Cancelado').length,
  };
};

/**
 * Calculate ticket totals
 */
export const calculateTicketTotals = (tickets: MappedTicket[]): TicketTotals => {
  return {
    montoTotal: tickets.reduce((sum, t) => sum + t.monto, 0),
    totalPremios: tickets.reduce((sum, t) => sum + t.premio, 0),
    totalPendiente: tickets
      .filter(t => t.estado === 'Pendiente')
      .reduce((sum, t) => sum + t.monto, 0),
  };
};

const ticketService = {
  createTicket,
  getTicketById,
  filterTickets,
  cancelTicket,
  payTicket,
  mapTicketResponse,
  calculateTicketCounts,
  calculateTicketTotals,
};

export default ticketService;
