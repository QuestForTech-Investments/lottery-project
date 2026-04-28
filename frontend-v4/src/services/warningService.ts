/**
 * Warning Service - Audit warnings (advertencias) for ticket / result actions.
 * Backend endpoints: /api/warnings, /api/warnings/count
 */

import { api } from './api';

export type WarningType =
  | 'TICKET_CREATED_LATE'
  | 'TICKET_CANCELLED_LATE'
  | 'TICKET_CANCELLED_AFTER_DRAW'
  | 'TICKET_WINNER_CANCELLED'
  | 'TICKET_BYPASS_VALIDATION'
  | 'RESULT_CHANGED_AFTER_PRIZES'
  | 'RESULT_PUBLICATION_LATE';

export type WarningSeverity = 'low' | 'medium' | 'high';

export interface Warning {
  warningId: number;
  warningType: WarningType;
  severity: WarningSeverity;
  bettingPoolId?: number | null;
  bettingPoolName?: string | null;
  bettingPoolCode?: string | null;
  userId?: number | null;
  username?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  message?: string | null;
  metadataJson?: string | null;
  createdAt: string;
  ticketId?: number | null;
  ticketCode?: string | null;
  ticketAmount?: number | null;
  ticketPrize?: number | null;
  ticketCreatedAt?: string | null;
}

export interface WarningCountResponse {
  count: number;
  date: string;
}

export const getWarnings = async (
  date?: string,
  type?: WarningType
): Promise<Warning[]> => {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  if (type) params.type = type;
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `/warnings?${qs}` : '/warnings';
  const data = await api.get(url);
  return (data as Warning[]) || [];
};

export const getWarningCount = async (date?: string): Promise<number> => {
  const url = date ? `/warnings/count?date=${date}` : '/warnings/count';
  const data = (await api.get(url)) as WarningCountResponse;
  return data?.count ?? 0;
};

export const WARNING_TYPE_LABELS: Record<WarningType, string> = {
  TICKET_CREATED_LATE: 'Ticket creado fuera de hora',
  TICKET_CANCELLED_LATE: 'Ticket cancelado fuera de hora',
  TICKET_CANCELLED_AFTER_DRAW: 'Ticket cancelado después del sorteo',
  TICKET_WINNER_CANCELLED: 'Ticket ganador cancelado',
  TICKET_BYPASS_VALIDATION: 'Ticket creado con bypass',
  RESULT_CHANGED_AFTER_PRIZES: 'Resultado cambiado tras procesar premios',
  RESULT_PUBLICATION_LATE: 'Resultado no publicado a tiempo',
};

export const WARNING_GROUPS: Record<string, WarningType[]> = {
  Tickets: [
    'TICKET_CREATED_LATE',
    'TICKET_CANCELLED_LATE',
    'TICKET_CANCELLED_AFTER_DRAW',
    'TICKET_WINNER_CANCELLED',
    'TICKET_BYPASS_VALIDATION',
  ],
  Resultados: ['RESULT_CHANGED_AFTER_PRIZES', 'RESULT_PUBLICATION_LATE'],
};
