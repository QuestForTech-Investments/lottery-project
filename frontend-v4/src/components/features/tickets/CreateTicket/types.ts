/**
 * CreateTicket Types
 *
 * Type definitions for ticket creation component.
 */

export interface Draw {
  drawId: number;
  drawName: string;
  lotteryName: string;
  drawTime?: string;
}

export interface BetType {
  betTypeId: number;
  betTypeName: string;
}

export interface TicketLine {
  drawId: number;
  drawName: string;
  lotteryName: string;
  betNumber: string;
  betTypeId: number;
  betTypeName: string;
  betAmount: number;
  multiplier: number;
}

export interface TicketLineForApi {
  lineId: number;
  lineNumber: number;
  lotteryId: number;
  lotteryName: string;
  drawId: number;
  drawName: string;
  drawDate: string;
  drawTime: string;
  betNumber: string;
  betTypeId: number;
  betTypeName: string;
  betAmount: number;
  multiplier: number;
  subtotal: number;
  totalWithMultiplier: number;
  discountAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netAmount: number;
  isWinner: boolean;
  prizeAmount: number;
}

export interface MockTicket {
  ticketId: number;
  ticketCode: string;
  barcode: string;
  status: string;
  bettingPoolId: number;
  bettingPoolName: string;
  userId: number;
  userName: string;
  customerName: string;
  customerPhone: string;
  totalBetAmount: number;
  totalDiscount: number;
  totalCommission: number;
  totalNet: number;
  grandTotal: number;
  createdAt: string;
  notes: string;
  lines: TicketLineForApi[];
}

export interface Totals {
  totalBet: number | string;
  totalCommission: number | string;
  grandTotal: number | string;
}

// Component props
export interface AddLineSectionProps {
  draws: Draw[];
  betTypes: BetType[];
  selectedDraw: string;
  betNumber: string;
  selectedBetType: string;
  betAmount: string;
  multiplier: string;
  onDrawChange: (value: string) => void;
  onBetNumberChange: (value: string) => void;
  onBetTypeChange: (value: string) => void;
  onBetAmountChange: (value: string) => void;
  onMultiplierChange: (value: string) => void;
  onAddLine: () => void;
}

export interface LinesTableProps {
  lines: TicketLine[];
  onRemoveLine: (index: number) => void;
}

export interface AdditionalDataSectionProps {
  customerName: string;
  customerPhone: string;
  globalMultiplier: string;
  globalDiscount: string;
  notes: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onGlobalMultiplierChange: (value: string) => void;
  onGlobalDiscountChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export interface TicketSummaryProps {
  linesCount: number;
  totals: Totals;
  onCreateTicket: () => void;
  onReset: () => void;
}

export interface TicketPreviewProps {
  mockTicketData: MockTicket | null;
  linesCount: number;
  totals: Totals;
  customerName: string;
}
