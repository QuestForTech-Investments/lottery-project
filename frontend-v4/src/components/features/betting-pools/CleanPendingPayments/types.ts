/**
 * CleanPendingPayments Types
 */

export interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  bettingPoolName?: string;
  name?: string;
  /** Display code shown in the UI, e.g. "LB-0001". */
  bettingPoolCode?: string;
  code?: string;
  reference?: string;
  /** Usernames returned by /betting-pools — field is `users` on the API. */
  users?: string[];
  /** Legacy alias kept for backwards compat. */
  userCodes?: string[];
  [key: string]: string | number | string[] | undefined;
}

export interface ReportItem {
  fecha?: string;
  ticketNumber?: number;
  monto?: number;
  premios?: number;
  fechaPago?: string;
  usuario?: string;
}

export interface CleanSummary {
  tickets: number;
  amount: number;
}

export type OrderDirection = 'asc' | 'desc';

export interface ReportTotals {
  monto: number;
  premios: number;
}
