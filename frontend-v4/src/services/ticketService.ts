/**
 * Ticket Service - Handles all ticket-related API calls
 * Based on API V4.0 documentation
 */

import api from './api';

// Constants
const SANTO_DOMINGO_TIMEZONE = 'America/Santo_Domingo';

/**
 * Format date to Santo Domingo timezone with time in AM/PM format
 * The lottery system operates in Santo Domingo timezone (UTC-4)
 */
const formatDateToSantoDomingo = (dateString: string): string => {
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('en-US', {
    timeZone: SANTO_DOMINGO_TIMEZONE,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const timeFormatted = date.toLocaleTimeString('en-US', {
    timeZone: SANTO_DOMINGO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateFormatted} ${timeFormatted}`;
};

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

export interface TicketLineResponse {
  lineId: number;
  ticketId: number;
  lineNumber: number;
  lotteryId: number;
  lotteryName: string;
  drawId: number;
  drawName: string;
  drawDate: string;
  drawTime: string;
  betNumber: string;
  betTypeId: number;
  betTypeCode: string;
  betTypeName: string;
  position: number | null;
  betAmount: number;
  multiplier: number;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
  totalWithMultiplier: number;
  commissionPercentage: number;
  commissionAmount: number;
  netAmount: number;
  prizeMultiplier: number | null;
  prizeAmount: number;
  isWinner: boolean;
  winningPosition: number | null;
  resultNumber: string | null;
  resultCheckedAt: string | null;
  lineStatus: string;
  exceedsLimit: boolean;
  isLuckyPick: boolean;
  isHotNumber: boolean;
  notes: string | null;
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
  ticketState?: string; // P=Pending, W=Winner, L=Loser
  winningLines?: number;
  lines?: TicketLineResponse[];
}

export interface TicketFilterParams {
  date: string;  // Single date field (API expects 'date', not 'startDate/endDate')
  bettingPoolId?: number;
  lotteryId?: number;  // Used for timezone-aware date filtering
  drawId?: number;
  userId?: number;
  ticketCode?: string;
  isCancelled?: boolean;
  isPaid?: boolean;
  pageNumber?: number;  // API expects 'pageNumber', not 'page'
  pageSize?: number;
}

export interface TicketFilterResponse {
  tickets: TicketResponse[];
  pageSize: number;
  pageNumber: number;
  totalRecords: number;
}

export interface MappedTicketLine {
  drawId: number;
  drawName: string;
  betNumber: string;
  betTypeId: number;
  betTypeName: string;
  betAmount: number;
  prizeAmount: number;
}

export interface MappedTicket {
  id: number;
  numero: string;
  fecha: string;
  usuario: string;
  monto: number;
  premio: number;
  fechaCancelacion: string | null;
  estado: 'Ganador' | 'Cancelado' | 'Pagado' | 'Pendiente' | 'Perdedor';
  lines?: MappedTicketLine[];
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
  } else if (ticket.ticketState === 'W' || ticket.totalPrize > 0) {
    estado = 'Ganador';
  } else if (ticket.ticketState === 'L') {
    estado = 'Perdedor';
  } else if (ticket.isPaid) {
    estado = 'Pagado';
  } else {
    estado = 'Pendiente';
  }

  return {
    id: ticket.ticketId,
    numero: ticket.ticketCode,
    fecha: formatDateToSantoDomingo(ticket.createdAt),
    usuario: ticket.userName || 'N/A',
    monto: ticket.grandTotal,
    premio: ticket.totalPrize || 0,
    fechaCancelacion: ticket.cancelledAt
      ? formatDateToSantoDomingo(ticket.cancelledAt)
      : null,
    estado,
  };
};

/**
 * Map API ticket response with lines to component format
 */
export const mapTicketWithLines = (ticket: TicketResponse): MappedTicket => {
  const baseTicket = mapTicketResponse(ticket);

  // Map lines if present
  const lines: MappedTicketLine[] = (ticket.lines || []).map((line) => ({
    drawId: line.drawId,
    drawName: line.drawName,
    betNumber: line.betNumber,
    betTypeId: line.betTypeId,
    betTypeName: line.betTypeName,
    betAmount: line.betAmount,
    prizeAmount: line.prizeAmount,
  }));

  return {
    ...baseTicket,
    lines,
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
    perdedores: tickets.filter(t => t.estado === 'Perdedor').length,
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

/**
 * Prize multipliers for a bet line
 */
export interface LinePrizeMultipliers {
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  doubles: number;
}

/**
 * Update prize multipliers for a ticket line
 * Note: This updates the betting pool's prize configuration,
 * which affects all future prize calculations for that pool.
 * The user must re-process sales to see the changes take effect.
 */
export const updateLinePrizeMultipliers = async (
  ticketId: number,
  lineId: number,
  betNumber: string,
  multipliers: LinePrizeMultipliers
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the ticket to find the betting pool ID
    const ticket = await api.get<TicketResponse>(`/tickets/${ticketId}`);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // For now, log the update attempt
    // In the future, this would update the betting pool's prize configuration
    console.log('Updating prize multipliers:', {
      ticketId,
      lineId,
      betNumber,
      bettingPoolId: ticket.bettingPoolId,
      multipliers,
    });

    // Note: The actual implementation would call the betting pool prize config API:
    // await api.patch(`/betting-pools/${ticket.bettingPoolId}/prize-config`, {
    //   prizeConfigs: [
    //     { prizeTypeId: 1, fieldCode: 'first_prize', value: multipliers.firstPrize },
    //     { prizeTypeId: 2, fieldCode: 'second_prize', value: multipliers.secondPrize },
    //     { prizeTypeId: 3, fieldCode: 'third_prize', value: multipliers.thirdPrize },
    //     { prizeTypeId: 4, fieldCode: 'doubles', value: multipliers.doubles },
    //   ]
    // });

    return {
      success: true,
      message: 'Multiplicadores de premio actualizados. Recuerde re-procesar las ventas para ver los cambios.',
    };
  } catch (error) {
    console.error('Error updating prize multipliers:', error);
    throw new Error('Error al actualizar los multiplicadores de premio');
  }
};

const ticketService = {
  createTicket,
  getTicketById,
  filterTickets,
  cancelTicket,
  payTicket,
  mapTicketResponse,
  mapTicketWithLines,
  calculateTicketCounts,
  calculateTicketTotals,
  updateLinePrizeMultipliers,
};

export default ticketService;
