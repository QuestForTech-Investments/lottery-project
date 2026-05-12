/**
 * Blocked Sessions Service
 *
 * Backed by /api/auth/blocked-sessions. Lists users whose password or PIN
 * has been locked after too many failed attempts, plus blocked IPs.
 */

import { api } from './api'

export type BlockedType = 'password' | 'pin' | 'ip'

export interface BlockedSession {
  id: string                 // "u:<userId>" or "ip:<address>"
  identifier: string         // username or IP shown in the table
  username?: string | null
  ip?: string | null
  blockedAt: string          // ISO datetime
  reason?: string | null
}

export const getBlockedSessions = async (type: BlockedType): Promise<BlockedSession[]> => {
  const data = (await api.get(`/auth/blocked-sessions?type=${type}`)) as
    | BlockedSession[]
    | null
  return data ?? []
}

export const unblockSession = async (id: string, type: BlockedType): Promise<void> => {
  await api.post('/auth/blocked-sessions/unblock', { id, type })
}
