/**
 * Limits API Endpoints
 * Type-safe wrapper around betting limits system
 * Handles 10 types of limits with hierarchy
 */

import { get } from './client';
import type { Limit, LimitConfiguration } from '@/types';

export const limitsApi = {
  /**
   * Get active limits for a specific number and draw
   * Returns all applicable limits (absolute, group, banca, zone, etc.)
   * @param drawId - Draw identifier
   * @param number - Number to check (e.g., "23", "456")
   * @param betType - Type of bet (directo, pale, etc.)
   * @param bancaId - Optional banca filter
   */
  getForNumber: (params: {
    drawId: number;
    number: string;
    betType: string;
    bancaId?: number;
  }): Promise<Limit[]> => {
    return get<Limit[]>('/limits/check', params);
  },

  /**
   * Get all active limits for a banca
   * Used for displaying available betting capacity
   * @param bancaId - Banca identifier
   * @param drawId - Optional draw filter
   */
  getForBanca: (bancaId: number, drawId?: number): Promise<Limit[]> => {
    return get<Limit[]>('/limits/banca', { bancaId, drawId });
  },

  /**
   * Get all configured limits (for admin/configuration)
   * Returns limit configurations with amounts and scopes
   */
  getAllConfigurations: (): Promise<LimitConfiguration[]> => {
    return get<LimitConfiguration[]>('/limits/configurations');
  },

  /**
   * Get blocked numbers for a draw
   * Returns numbers that have reached their limits
   * @param drawId - Draw identifier
   * @param bancaId - Optional banca filter
   */
  getBlockedNumbers: (drawId: number, bancaId?: number): Promise<string[]> => {
    return get<string[]>('/limits/blocked', { drawId, bancaId });
  },

  /**
   * Get remaining capacity for a specific limit type
   * Used for real-time validation during ticket entry
   * @param limitId - Specific limit to check
   */
  getRemaining: (limitId: number): Promise<{ remaining: number; isBlocked: boolean }> => {
    return get<{ remaining: number; isBlocked: boolean }>(`/limits/${limitId}/remaining`);
  },
};
