/**
 * Tickets Store
 * Manages ticket creation workflow and current ticket state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ticketsApi } from '@/services/api';
import type { Bet, Ticket, CreateTicketResponse, BetType } from '@/types';

interface TicketsState {
  // Current ticket being built
  currentBets: Bet[];
  selectedBancaId: number | null;
  totalAmount: number;

  // Created tickets history (session only)
  recentTickets: CreateTicketResponse[];

  // UI state
  isCreating: boolean;
  error: string | null;

  // Actions
  addBet: (bet: Bet) => void;
  removeBet: (index: number) => void;
  clearBets: () => void;
  setBancaId: (bancaId: number) => void;
  createTicket: () => Promise<CreateTicketResponse>;
  updateBet: (index: number, updates: Partial<Bet>) => void;
}

export const useTicketsStore = create<TicketsState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      currentBets: [],
      selectedBancaId: null,
      totalAmount: 0,
      recentTickets: [],
      isCreating: false,
      error: null,

      // Add a new bet to current ticket
      addBet: (bet: Bet) => {
        set((state) => {
          state.currentBets.push(bet);
          state.totalAmount = state.currentBets.reduce((sum, b) => sum + b.amount, 0);
        });
      },

      // Remove bet by index
      removeBet: (index: number) => {
        set((state) => {
          state.currentBets.splice(index, 1);
          state.totalAmount = state.currentBets.reduce((sum, b) => sum + b.amount, 0);
        });
      },

      // Clear all bets
      clearBets: () => {
        set({
          currentBets: [],
          totalAmount: 0,
          error: null,
        });
      },

      // Set selected banca
      setBancaId: (bancaId: number) => {
        set({ selectedBancaId: bancaId });
      },

      // Update specific bet
      updateBet: (index: number, updates: Partial<Bet>) => {
        set((state) => {
          const bet = state.currentBets[index];
          if (bet) {
            Object.assign(bet, updates);
            state.totalAmount = state.currentBets.reduce((sum, b) => sum + b.amount, 0);
          }
        });
      },

      // Create ticket on server
      createTicket: async (): Promise<CreateTicketResponse> => {
        const { currentBets, selectedBancaId } = get();

        if (!selectedBancaId) {
          throw new Error('Debe seleccionar una banca');
        }

        if (currentBets.length === 0) {
          throw new Error('Debe agregar al menos una jugada');
        }

        set({ isCreating: true, error: null });

        try {
          const response = await ticketsApi.create({
            bancaId: selectedBancaId,
            bets: currentBets,
          });

          // Add to recent tickets
          set((state) => {
            state.recentTickets.unshift(response);

            // Keep only last 10 tickets
            if (state.recentTickets.length > 10) {
              state.recentTickets = state.recentTickets.slice(0, 10);
            }

            // Clear current ticket
            state.currentBets = [];
            state.totalAmount = 0;
            state.isCreating = false;
          });

          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error creando ticket';

          set({
            isCreating: false,
            error: errorMessage,
          });

          throw error;
        }
      },
    })),
    { name: 'TicketsStore' }
  )
);
