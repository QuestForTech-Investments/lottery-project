/**
 * Blackboard (Pizarra) Service
 *
 * Aggregated plays for the blackboard view.
 */

import { api } from './api'

export interface PlayByNumberRow {
  betTypeCode: string
  betTypeName: string
  betNumber: string
  totalAmount: number
  lineCount: number
}

export interface PlaysByNumberFilters {
  date: string // YYYY-MM-DD
  drawId?: number | null
  zoneIds?: number[] | null
  bettingPoolId?: number | null
}

export const getPlaysByNumber = async (
  filters: PlaysByNumberFilters
): Promise<PlayByNumberRow[]> => {
  const params = new URLSearchParams()
  params.set('date', filters.date)
  if (filters.drawId) params.set('drawId', String(filters.drawId))
  if (filters.zoneIds && filters.zoneIds.length > 0) {
    params.set('zoneIds', filters.zoneIds.join(','))
  }
  if (filters.bettingPoolId) params.set('bettingPoolId', String(filters.bettingPoolId))

  const data = (await api.get(`/blackboard/plays-by-number?${params.toString()}`)) as
    | PlayByNumberRow[]
    | null
  return data ?? []
}

export interface PlayByNumberDetailRow {
  bettingPoolId: number
  bettingPoolCode: string
  bettingPoolName: string
  reference?: string | null
  totalAmount: number
  lineCount: number
}

export interface PlaysByNumberDetailFilters extends PlaysByNumberFilters {
  betTypeCode: string
  betNumber: string
}

export const getPlaysByNumberDetail = async (
  filters: PlaysByNumberDetailFilters
): Promise<PlayByNumberDetailRow[]> => {
  const params = new URLSearchParams()
  params.set('date', filters.date)
  params.set('betTypeCode', filters.betTypeCode)
  params.set('betNumber', filters.betNumber)
  if (filters.drawId) params.set('drawId', String(filters.drawId))
  if (filters.zoneIds && filters.zoneIds.length > 0) {
    params.set('zoneIds', filters.zoneIds.join(','))
  }
  if (filters.bettingPoolId) params.set('bettingPoolId', String(filters.bettingPoolId))

  const data = (await api.get(`/blackboard/plays-by-number-detail?${params.toString()}`)) as
    | PlayByNumberDetailRow[]
    | null
  return data ?? []
}

/** Bet types whose betNumber is a single 2-digit number (00-99) — render as 5×20 grid. */
export const SINGLE_NUMBER_BET_TYPES = new Set<string>([
  'DIRECTO',
  'PICK2',
  'PICK2_FRONT',
  'PICK2_BACK',
  'PICK2_MIDDLE',
])

/** Bet types stored concatenated; this map decorates each chunk size for display formatting. */
export const COMBINATION_FORMAT: Record<string, number[]> = {
  PALE: [2, 2],
  SUPER_PALE: [2, 2],
  TRIPLETA: [2, 2, 2],
  BOLITA: [2, 2],
}

/** Bet types that get a "B" suffix on the displayed bet number. */
const BOX_SUFFIX_TYPES = new Set<string>([
  'CASH3_BOX',
  'CASH3_FRONT_BOX',
  'CASH3_BACK_BOX',
  'PLAY4_BOX',
])

/** Bet types that get an "S" suffix on the displayed bet number. */
const STRAIGHT_SUFFIX_TYPES = new Set<string>([
  'CASH3_STRAIGHT',
  'CASH3_FRONT_STRAIGHT',
  'CASH3_BACK_STRAIGHT',
  'PLAY4_STRAIGHT',
])

const suffixFor = (betTypeCode: string): string => {
  if (BOX_SUFFIX_TYPES.has(betTypeCode)) return 'B'
  if (STRAIGHT_SUFFIX_TYPES.has(betTypeCode)) return 'S'
  return ''
}

/** Total digit count expected for the stored bet_number (no dashes). */
export const expectedDigits = (betTypeCode: string): number => {
  const chunks = COMBINATION_FORMAT[betTypeCode]
  if (chunks) return chunks.reduce((s, n) => s + n, 0)
  // Single-number / unknown — fall back to a sensible default.
  switch (betTypeCode) {
    case 'DIRECTO':
    case 'PICK2':
    case 'PICK2_FRONT':
    case 'PICK2_BACK':
    case 'PICK2_MIDDLE':
      return 2
    case 'CASH3_STRAIGHT':
    case 'CASH3_BOX':
    case 'CASH3_FRONT_STRAIGHT':
    case 'CASH3_FRONT_BOX':
    case 'CASH3_BACK_STRAIGHT':
    case 'CASH3_BACK_BOX':
      return 3
    case 'PLAY4_STRAIGHT':
    case 'PLAY4_BOX':
      return 4
    case 'PICK5_STRAIGHT':
      return 5
    case 'SINGULACION':
      return 1
    default:
      return 0
  }
}

/** Visual placeholder for the filter input (## per digit, dashes between chunks). */
export const filterPlaceholder = (betTypeCode: string): string => {
  const chunks = COMBINATION_FORMAT[betTypeCode]
  if (chunks) return chunks.map(n => '#'.repeat(n)).join('-')
  const total = expectedDigits(betTypeCode)
  return total > 0 ? '#'.repeat(total) : '##'
}

/** Format a stored bet_number for display using a chunk-size hint + optional suffix. */
export const formatBetNumber = (betTypeCode: string, betNumber: string): string => {
  const suffix = suffixFor(betTypeCode)
  const chunks = COMBINATION_FORMAT[betTypeCode]
  let display = betNumber
  if (chunks) {
    const total = chunks.reduce((s, n) => s + n, 0)
    if (betNumber.length === total) {
      const parts: string[] = []
      let i = 0
      for (const len of chunks) {
        parts.push(betNumber.slice(i, i + len))
        i += len
      }
      display = parts.join('-')
    }
  }
  return suffix ? `${display}${suffix}` : display
}
