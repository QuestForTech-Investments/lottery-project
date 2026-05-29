/**
 * Betting Pool audit log — per-banca change history.
 *
 * Backed by `GET /api/betting-pools/{id}/audit-log`. Access is gated by the
 * `VIEW_BANCA_AUDIT_LOG` permission on the backend; callers should also gate
 * the UI with the same permission via PermissionGuard.
 */

import api from './api';

export interface BettingPoolAuditFieldChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface BettingPoolAuditLogEntry {
  auditLogId: number;
  bettingPoolId: number;
  userId: number | null;
  userName: string | null;
  /** 'CREATED' | 'UPDATED' | 'DELETED' — open-ended for future verbs. */
  action: string;
  changes: BettingPoolAuditFieldChange[];
  ipAddress: string | null;
  createdAt: string;
}

export const getBettingPoolAuditLog = async (
  bettingPoolId: number,
): Promise<BettingPoolAuditLogEntry[]> => {
  return (await api.get(`/betting-pools/${bettingPoolId}/audit-log`)) as BettingPoolAuditLogEntry[];
};
