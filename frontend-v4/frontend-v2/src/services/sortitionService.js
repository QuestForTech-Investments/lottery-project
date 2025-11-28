import api from './api';

/**
 * Get all betting pool draws
 * @param {number} bettingPoolId - ID of the betting pool
 * @returns {Promise<{success: boolean, data: BettingPoolDrawDto[]}>} Draw configurations
 *
 * Response format (new /draws endpoint):
 * {
 *   bettingPoolDrawId: number,
 *   bettingPoolId: number,
 *   drawId: number,           // NEW: Specific draw ID
 *   drawName: string,          // NEW: e.g., "NACIONAL"
 *   drawTime: string,          // NEW: e.g., "12:00:00"
 *   lotteryId: number,         // Parent lottery ID
 *   lotteryName: string,
 *   countryName: string,       // NEW
 *   isActive: boolean,         // Was: isEnabled
 *   anticipatedClosingMinutes: number,  // Was: anticipatedClosing
 *   enabledGameTypes: GameTypeDto[],    // Was: enabledGameTypeIds (array of IDs)
 *   availableGameTypes: GameTypeDto[]
 * }
 */
export const getBettingPoolDraws = async (bettingPoolId) => {
  try {
    console.log(`🎯 [DRAW SERVICE] Loading draws for betting pool ${bettingPoolId}`);
    const data = await api.get(`/betting-pools/${bettingPoolId}/draws`);
    console.log(`✅ [DRAW SERVICE] Loaded ${data?.length || 0} draws`);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ [DRAW SERVICE] Error getting draws:', error);
    throw error;
  }
};

/**
 * Create or update multiple betting pool draws
 * @param {number} bettingPoolId - ID of the betting pool
 * @param {Array<CreateBettingPoolDrawDto>} draws - Array of draw configurations
 * @returns {Promise<{success: boolean, data: BettingPoolDrawDto[]}>}
 *
 * Request payload format:
 * {
 *   drawId: number,              // Required: ID of the draw to add
 *   isActive: boolean,           // Optional: default true
 *   anticipatedClosingMinutes: number,  // Optional
 *   enabledGameTypeIds: number[] // Optional: array of game type IDs
 * }
 */
export const saveBettingPoolDraws = async (bettingPoolId, draws) => {
  try {
    console.log(`💾 [DRAW SERVICE] Saving ${draws.length} draws for betting pool ${bettingPoolId}`);
    console.log('📤 [DRAW SERVICE] Payload:', JSON.stringify(draws, null, 2));

    // Note: Using /draws/bulk for batch operations (if supported), otherwise iterate with POST
    const data = await api.post(`/betting-pools/${bettingPoolId}/draws/bulk`, draws);

    console.log(`✅ [DRAW SERVICE] Draws saved successfully`);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ [DRAW SERVICE] Error saving draws:', error);
    console.error('❌ [DRAW SERVICE] Error details:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Delete a draw configuration from betting pool
 * @param {number} bettingPoolId - ID of the betting pool
 * @param {number} bettingPoolDrawId - ID of the betting pool draw configuration (was: sortitionId)
 * @returns {Promise<{success: boolean}>}
 */
export const deleteBettingPoolDraw = async (bettingPoolId, bettingPoolDrawId) => {
  try {
    console.log(`🗑️ [DRAW SERVICE] Deleting draw ${bettingPoolDrawId} from betting pool ${bettingPoolId}`);
    await api.delete(`/betting-pools/${bettingPoolId}/draws/${bettingPoolDrawId}`);
    console.log('✅ [DRAW SERVICE] Draw deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ [DRAW SERVICE] Error deleting draw:', error);
    throw error;
  }
};
