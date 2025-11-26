/**
 * Tickets API Endpoints
 * Type-safe wrapper around ticket creation and management
 */

import { get, post, del } from './client';
import type {
  Ticket,
  TicketStats,
  CreateTicketRequest,
  CreateTicketResponse,
  PaginatedResponse,
} from '@/types';

export const ticketsApi = {
  /**
   * Create a new ticket with multiple bets
   * @param request - Ticket creation data (bancaId + bets array)
   * @returns Created ticket with ticketNumber and ticketId
   */
  create: (request: CreateTicketRequest): Promise<CreateTicketResponse> => {
    return post<CreateTicketResponse, CreateTicketRequest>('/tickets', request);
  },

  /**
   * Get paginated list of tickets
   * @param params - Pagination and filter parameters
   */
  getAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    bancaId?: number;
    status?: 'pending' | 'paid' | 'cancelled';
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Ticket>> => {
    return get<PaginatedResponse<Ticket>>('/tickets', params);
  },

  /**
   * Get specific ticket by ID
   * @param ticketId - Ticket identifier
   */
  getById: (ticketId: number): Promise<Ticket> => {
    return get<Ticket>(`/tickets/${ticketId}`);
  },

  /**
   * Get ticket by ticket number (for customer lookups)
   * @param ticketNumber - Unique ticket number string
   */
  getByNumber: (ticketNumber: string): Promise<Ticket> => {
    return get<Ticket>(`/tickets/number/${ticketNumber}`);
  },

  /**
   * Cancel a pending ticket
   * @param ticketId - Ticket to cancel
   */
  cancel: (ticketId: number): Promise<void> => {
    return del<void>(`/tickets/${ticketId}`);
  },

  /**
   * Get ticket statistics for dashboard
   * @param params - Filter by date range, bancaId, etc.
   */
  getStats: (params?: {
    bancaId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<TicketStats> => {
    return get<TicketStats>('/tickets/stats', params);
  },

  /**
   * Print ticket (generates PDF or receipt data)
   * @param ticketId - Ticket to print
   * @returns Print data or PDF blob URL
   */
  print: (ticketId: number): Promise<{ url: string }> => {
    return get<{ url: string }>(`/tickets/${ticketId}/print`);
  },
};
