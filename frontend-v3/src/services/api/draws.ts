/**
 * Draws & Lotteries API Endpoints
 * Type-safe wrapper around draw management endpoints
 */

import { api } from './client';
import type { Draw, DrawScheduleUpdate } from '@/types';

export const drawsApi = {
  /**
   * Get all draws with their schedules
   * @returns Array of all active draws
   */
  getAll: async (): Promise<Draw[]> => {
    // Request with large pageSize to get all draws (same as V2's loadAll pattern)
    const response = await api.get<any>('/draws?pageSize=1000');

    // Handle paginated response (API returns { items: [...], pageNumber, totalCount, etc. })
    if (response && response.items) {
      return response.items;
    }

    // Fallback: if response is already an array, return it
    if (Array.isArray(response)) {
      return response;
    }

    // Last resort: return empty array
    return [];
  },

  /**
   * Get draws grouped by lottery with schedule information
   * @param lotteryId - Optional filter by specific lottery
   * @returns Array of draws with full schedule data
   */
  getSchedules: (lotteryId?: number): Promise<Draw[]> => {
    const params = lotteryId ? `?lotteryId=${lotteryId}` : '';
    return api.get<Draw[]>(`/draws/schedules${params}`);
  },

  /**
   * Bulk update draw schedules (weekly schedules)
   * @param schedules - Array of schedule updates
   */
  updateSchedules: (schedules: DrawScheduleUpdate[]): Promise<void> => {
    return api.patch<void>('/draws/schedules', { schedules });
  },

  /**
   * Get specific draw by ID
   * @param drawId - Draw identifier
   * @returns Single draw with full details
   */
  getById: (drawId: number): Promise<Draw> => {
    return api.get<Draw>(`/draws/${drawId}`);
  },
};
