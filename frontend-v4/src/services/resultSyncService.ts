/**
 * Result sync admin service.
 * Talks to /api/result-sync — audit log + conflict resolution for the
 * cross-tenant result push/inbound flow.
 */

import api from './api'

export interface SyncLogRow {
  syncLogId: number
  direction: 'outbound' | 'inbound'
  partnerCode: string
  resultDate: string
  lotteryCode: string
  drawCode: string
  status: 'sent' | 'received' | 'noop' | 'conflict' | 'failed'
  errorMessage?: string | null
  createdAt: string
}

export interface ConflictRow {
  conflictId: number
  partnerCode: string
  resultDate: string
  lotteryCode: string
  drawCode: string
  localNum1?: string | null
  localNum2?: string | null
  partnerNum1?: string | null
  partnerNum2?: string | null
  resolution: 'pending' | 'kept_local' | 'accepted_partner' | 'reviewed'
  createdAt: string
}

export type ConflictResolution = 'kept_local' | 'accepted_partner' | 'reviewed'

export const listSyncLog = (params?: {
  status?: string
  partnerCode?: string
  since?: string
  limit?: number
}): Promise<SyncLogRow[]> => {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.partnerCode) qs.set('partnerCode', params.partnerCode)
  if (params?.since) qs.set('since', params.since)
  if (params?.limit) qs.set('limit', String(params.limit))
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return api.get<SyncLogRow[]>(`/result-sync/log${suffix}`) as unknown as Promise<SyncLogRow[]>
}

export const listSyncConflicts = (resolution: string = 'pending'): Promise<ConflictRow[]> =>
  api.get<ConflictRow[]>(`/result-sync/conflicts?resolution=${resolution}`) as unknown as Promise<ConflictRow[]>

export const resolveConflict = (
  id: number, resolution: ConflictResolution, notes?: string,
): Promise<void> =>
  api.post(`/result-sync/conflicts/${id}/resolve`, { resolution, notes }) as unknown as Promise<void>

export const resyncResult = (resultId: number): Promise<void> =>
  api.post(`/results/${resultId}/resync`, {}) as unknown as Promise<void>
