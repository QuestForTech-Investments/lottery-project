/**
 * Draws & Lotteries API Endpoints
 * Type-safe wrapper around draw management endpoints
 */

import { get, patch } from './client';
import type { Draw, DrawScheduleUpdate } from '@/types';

export const drawsApi = {
  /**
   * Get all draws with their schedules
   * @returns Array of all active draws
   */
  getAll: (): Promise<Draw[]> => {
    return get<Draw[]>('/draws');
  },

  /**
   * Get draws grouped by lottery with schedule information
   * @param lotteryId - Optional filter by specific lottery
   * @returns Array of draws with full schedule data
   */
  getSchedules: (lotteryId?: number): Promise<Draw[]> => {
    return get<Draw[]>('/draws/schedules', lotteryId ? { lotteryId } : undefined);
  },

  /**
   * Bulk update draw schedules (weekly schedules)
   * @param schedules - Array of schedule updates
   */
  updateSchedules: (schedules: DrawScheduleUpdate[]): Promise<void> => {
    return patch<void, { schedules: DrawScheduleUpdate[] }>('/draws/schedules', { schedules });
  },

  /**
   * Get specific draw by ID
   * @param drawId - Draw identifier
   * @returns Single draw with full details
   */
  getById: (drawId: number): Promise<Draw> => {
    return get<Draw>(`/draws/${drawId}`);
  },
};
