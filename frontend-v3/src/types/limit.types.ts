/**
 * Betting Limits Types
 * Based on investigation - 10 types of limits with hierarchy
 */

// 10 types of limits from investigation
export type LimitType =
  | 'absolute'              // 1. Absoluto (máxima restricción global)
  | 'group_general'         // 2. General para grupo
  | 'group_by_number'       // 3. General por número para grupo
  | 'banca_general'         // 4. General para banca
  | 'banca_by_number'       // 5. Por número para banca (Línea)
  | 'banca_local'           // 6. Local para banca
  | 'zone_general'          // 7. General para zona
  | 'zone_by_number'        // 8. Por número para zona
  | 'external_group_general'// 9. General para grupo externo
  | 'external_group_by_number'; // 10. Por número para grupo externo

export interface Limit {
  limitId: number;
  type: LimitType;
  number?: string;          // If limit is for specific number
  amount: number;          // Max amount allowed
  remaining: number;       // Amount remaining
  scope: 'group' | 'banca' | 'zone' | 'external';
  drawId?: number;         // If limit is for specific draw
  bancaId?: number;        // If limit is for specific banca
  zoneId?: number;         // If limit is for specific zone
  betType?: string;        // If limit is for specific bet type
  dayOfWeek?: number;      // If limit is for specific day (0-6)
  isBlocked: boolean;      // If number is completely blocked
}

export interface LimitUpdate {
  number: string;
  limit: Limit;
  timestamp: number;
}

export interface LimitConfiguration {
  limitId: number;
  type: LimitType;
  amount: number;
  drawId?: number;
  bancaId?: number;
  zoneId?: number;
  betType?: string;
  number?: string;
  dayOfWeek?: number;
}

// WebSocket event for limit updates
export interface LimitUpdateEvent {
  number: string;
  drawId: number;
  betType: string;
  remaining: number;
  isBlocked: boolean;
}
