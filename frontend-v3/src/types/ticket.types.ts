/**
 * Ticket & Bet Types
 * Based on lottery system requirements with strict typing
 */

// Bet Types - 24 different types from investigation
export type BetType =
  | 'directo'
  | 'pale'
  | 'tripleta'
  | 'super_pale'
  | 'quiniela_pale'
  | 'cash3_straight'
  | 'cash3_box'
  | 'cash3_front'
  | 'cash3_back'
  | 'play4_straight'
  | 'play4_box'
  | 'pick5_straight'
  | 'pick5_box'
  | 'pick2_front'
  | 'pick2_back'
  | 'pick2_middle'
  | 'bolita_1'
  | 'bolita_2'
  | 'singulacion_1'
  | 'singulacion_2'
  | 'singulacion_3'
  | 'panama'
  | 'fl_pick2_am'
  | 'fl_pick2_pm';

export interface Bet {
  number: string;
  amount: number;
  betType: BetType;
  drawId: number;
  drawName?: string;
}

export interface Ticket {
  ticketId: number;
  ticketNumber: string;
  totalAmount: number;
  bets: Bet[];
  bancaId: number;
  bancaName?: string;
  userId: number;
  username?: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  cancelledAt?: string;
}

export interface TicketStats {
  jugadasDelDia: number;
  vendidoEnGrupo: number;
  vendidoEnBanca: number;
  topNumbers?: Array<{ number: string; count: number }>;
}

export interface CreateTicketRequest {
  bancaId: number;
  bets: Bet[];
}

export interface CreateTicketResponse {
  ticketId: number;
  ticketNumber: string;
  totalAmount: number;
  createdAt: string;
}
