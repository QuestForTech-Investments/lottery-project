/**
 * CleanPendingPayments Types
 */

export interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  bettingPoolName?: string;
  name?: string;
  reference?: string;
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
