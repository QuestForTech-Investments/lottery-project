/**
 * CreateTickets Types
 *
 * Type definitions for ticket creation module.
 */

export interface BettingPool {
  bettingPoolId: number;
  bettingPoolCode: string;
  bettingPoolName: string;
}

export interface Draw {
  id: number;
  name: string;
  abbreviation?: string;
  color: string;
  disabled: boolean;
  lotteryId?: number;
  imageUrl?: string;
  availableGameTypes?: number[];
  closingTime?: string; // HH:mm:ss from API (EndTime of today's schedule)
}

export interface Bet {
  id: number;
  drawName: string;
  drawAbbr?: string;
  drawId: number;
  betNumber: string;
  betAmount: number;
  betType?: { name: string };
}

export interface BetType {
  id: string;
  name: string;
}

export interface TicketLine {
  lineId: number;
  lotteryName: string;
  drawName: string;
  betNumber: string;
  betTypeName: string;
  betAmount: number;
  netAmount: number;
}

export interface TicketData {
  ticketId: number;
  ticketCode: string;
  barcode: string;
  status: string;
  bettingPoolId: number;
  bettingPoolName: string;
  userName: string;
  createdAt: string;
  totalBetAmount: number;
  totalCommission: number;
  grandTotal: number;
  lines: TicketLine[];
}

export type ColumnType = 'directo' | 'pale' | 'cash3' | 'play4';

export interface VisibleColumns {
  directo: boolean;
  pale: boolean;
  cash3: boolean;
  play4: boolean;
}

// API Response types
export interface AvailableGameType {
  gameTypeId: number;
  gameTypeCode?: string;
  gameName?: string;
  prizeMultiplier?: number;
  numberLength?: number;
  requiresAdditionalNumber?: boolean;
  displayOrder?: number;
}

export interface BettingPoolDrawResponse {
  drawId: number;
  isActive: boolean;
  drawTime?: string; // Closing time (HH:mm:ss)
  availableGameTypes?: AvailableGameType[];
}

export interface DrawApiResponse {
  drawId: number;
  drawName?: string;
  name?: string;
  abbreviation?: string;
  displayColor?: string;
  lotteryColour?: string;
  isActive?: boolean;
  lotteryId?: number;
  imageUrl?: string;
}
