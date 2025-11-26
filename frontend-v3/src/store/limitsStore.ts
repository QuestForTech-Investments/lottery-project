/**
 * Limits Store
 * Manages betting limits with real-time WebSocket updates
 * Critical for preventing over-selling
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { limitsApi } from '@/services/api';
import type { Limit, LimitUpdateEvent } from '@/types';

interface LimitsState {
  // State - Map of number+drawId+betType -> Limit[]
  limits: Map<string, Limit[]>;
  blockedNumbers: Map<number, Set<string>>; // drawId -> Set of blocked numbers
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLimitsForNumber: (drawId: number, number: string, betType: string, bancaId?: number) => Promise<void>;
  fetchBlockedNumbers: (drawId: number, bancaId?: number) => Promise<void>;
  updateLimitFromWebSocket: (event: LimitUpdateEvent) => void;
  clearLimits: () => void;
  isNumberBlocked: (drawId: number, number: string) => boolean;
}

// Helper to create cache key
const createLimitKey = (drawId: number, number: string, betType: string): string => {
  return `${drawId}-${number}-${betType}`;
};

export const useLimitsStore = create<LimitsState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      limits: new Map(),
      blockedNumbers: new Map(),
      isLoading: false,
      error: null,

      // Fetch limits for a specific number
      fetchLimitsForNumber: async (drawId: number, number: string, betType: string, bancaId?: number) => {
        const key = createLimitKey(drawId, number, betType);
        set({ isLoading: true, error: null });

        try {
          const limits = await limitsApi.getForNumber({ drawId, number, betType, bancaId });

          set((state) => {
            state.limits.set(key, limits);
            state.isLoading = false;
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error cargando límites';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Fetch blocked numbers for a draw
      fetchBlockedNumbers: async (drawId: number, bancaId?: number) => {
        try {
          const blockedNumbers = await limitsApi.getBlockedNumbers(drawId, bancaId);

          set((state) => {
            state.blockedNumbers.set(drawId, new Set(blockedNumbers));
          });
        } catch (error) {
          console.error('Error fetching blocked numbers:', error);
        }
      },

      // Update limit from WebSocket event
      updateLimitFromWebSocket: (event: LimitUpdateEvent) => {
        const key = createLimitKey(event.drawId, event.number, event.betType);

        set((state) => {
          // Update limits cache
          const existingLimits = state.limits.get(key);
          if (existingLimits) {
            existingLimits.forEach((limit) => {
              limit.remaining = event.remaining;
              limit.isBlocked = event.isBlocked;
            });
          }

          // Update blocked numbers
          const blockedSet = state.blockedNumbers.get(event.drawId) || new Set();
          if (event.isBlocked) {
            blockedSet.add(event.number);
          } else {
            blockedSet.delete(event.number);
          }
          state.blockedNumbers.set(event.drawId, blockedSet);
        });
      },

      // Clear all limits cache
      clearLimits: () => {
        set({ limits: new Map(), blockedNumbers: new Map() });
      },

      // Check if a number is blocked for a draw
      isNumberBlocked: (drawId: number, number: string): boolean => {
        const blockedSet = get().blockedNumbers.get(drawId);
        return blockedSet ? blockedSet.has(number) : false;
      },
    })),
    { name: 'LimitsStore' }
  )
);
