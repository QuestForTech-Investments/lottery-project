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
  isClosed?: boolean;
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
  selectedBetType?: string;
  gameTypeId?: number;   // Resolved game type ID (1-21)
  position?: number;     // For Bolita/Singulacion (API Position field)
}

export interface BetType {
  id: string;
  name: string;
  gameTypeId?: number;  // Maps to GAME_TYPES key
}

export interface BetDetectionResult {
  gameTypeId: number;
  cleanNumber: string;    // Digits only for API
  displaySuffix: string;  // Shown in bet column
  column: ColumnType;
  displayName: string;    // For error messages
  position?: number;      // For Bolita/Singulacion (API Position field)
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

export type TicketDateMode = 'today' | 'previousDay' | 'futureDate';

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
  isClosed: boolean;
  isDominican?: boolean;
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
