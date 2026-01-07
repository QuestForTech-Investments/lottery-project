/**
 * CreateTicketsAdvanced Types
 */

export interface Draw {
  drawId: number;
  drawName: string;
  lotteryName: string;
  drawTime?: string;
}

export interface DrawWithGameTypes extends Draw {
  enabledGameTypes?: { gameTypeCode: string }[];
}

export interface BetLine {
  id: number;
  section: string;
  drawId: number;
  drawName: string;
  lotteryName: string;
  betNumber: string;
  amount: number;
}

export interface GroupedLines {
  'DIRECTO': BetLine[];
  'PALE & TRIPLETA': BetLine[];
  'CASH 3': BetLine[];
  'PLAY 4 & PICK 5': BetLine[];
}

export type SectionName = keyof GroupedLines;
