import api from './api';

// Types - Export for re-use
export interface GameType {
  gameTypeId: number;
  gameTypeName: string;
  isActive?: boolean;
}

export interface BettingPoolDraw {
  bettingPoolDrawId: number;
  bettingPoolId: number;
  drawId: number;
  drawName: string;
  drawTime: string;
  lotteryId: number;
  lotteryName: string;
  countryName?: string;
  isActive: boolean;
  anticipatedClosingMinutes: number;
  enabledGameTypes: GameType[];
  availableGameTypes: GameType[];
}

export interface DrawsResponse {
  success: boolean;
  data: BettingPoolDraw[];
}

interface SuccessResponse {
  success: boolean;
}

export interface CreateBettingPoolDraw {
  drawId: number;
  isActive?: boolean;
  anticipatedClosingMinutes?: number | null;
  enabledGameTypeIds?: number[];
}

/**
 * Get all betting pool draws
 */
export const getBettingPoolDraws = async (bettingPoolId: number | string): Promise<DrawsResponse> => {
  try {
    const data = await api.get(`/betting-pools/${bettingPoolId}/draws`) as BettingPoolDraw[];
    return { success: true, data: data };
  } catch (error) {
    console.error('[ERROR] [DRAW SERVICE] Error getting draws:', error);
    throw error;
  }
};

/**
 * Create or update multiple betting pool draws
 */
export const saveBettingPoolDraws = async (
  bettingPoolId: number | string,
  draws: CreateBettingPoolDraw[]
): Promise<DrawsResponse> => {
  try {

    // Note: Using /draws/bulk for batch operations (if supported), otherwise iterate with POST
    const data = await api.post(`/betting-pools/${bettingPoolId}/draws/bulk`, draws) as BettingPoolDraw[];

    return { success: true, data: data };
  } catch (err) {
    const error = err as Error & { response?: unknown; stack?: string };
    console.error('[ERROR] [DRAW SERVICE] Error saving draws:', error);
    console.error('[ERROR] [DRAW SERVICE] Error details:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Delete a draw configuration from betting pool
 */
export const deleteBettingPoolDraw = async (
  bettingPoolId: number | string,
  bettingPoolDrawId: number | string
): Promise<SuccessResponse> => {
  try {
    await api.delete(`/betting-pools/${bettingPoolId}/draws/${bettingPoolDrawId}`);
    return { success: true };
  } catch (error) {
    console.error('[ERROR] [DRAW SERVICE] Error deleting draw:', error);
    throw error;
  }
};
