/**
 * Draw Service - Manejo de operaciones de sorteos (betting pool draws)
 * Endpoint: /api/betting-pools/{bettingPoolId}/draws
 *
 * MIGRATION NOTE: Renamed from "sortitions" to "draws" to match API v2
 * Old endpoint: /api/betting-pools/{bettingPoolId}/sortitions (deprecated)
 * New endpoint: /api/betting-pools/{bettingPoolId}/draws
 */

import * as logger from '../utils/logger';
import { buildApiUrl } from '../config/apiConfig';
import { api } from './api';

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
    logger.info('DRAW_SERVICE', `Loading draws for betting pool ${bettingPoolId}`);

    const data = await api.get(`/betting-pools/${bettingPoolId}/draws`);

    logger.success('DRAW_SERVICE', `Loaded ${data?.length || 0} draws`);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    logger.error('DRAW_SERVICE', 'Error getting draws', { error: error.message, bettingPoolId });
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
    logger.info('DRAW_SERVICE', `Saving ${draws.length} draws for betting pool ${bettingPoolId}`);
    logger.info('DRAW_SERVICE', 'Payload', draws);

    const data = await api.post(`/betting-pools/${bettingPoolId}/draws/bulk`, draws);

    logger.success('DRAW_SERVICE', 'Draws saved successfully');
    return {
      success: true,
      data: data
    };
  } catch (error) {
    logger.error('DRAW_SERVICE', 'Error saving draws', {
      error: error.message,
      response: error.response,
      bettingPoolId,
      drawsCount: draws.length
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
    logger.info('DRAW_SERVICE', `Deleting draw ${bettingPoolDrawId} from betting pool ${bettingPoolId}`);

    await api.delete(`/betting-pools/${bettingPoolId}/draws/${bettingPoolDrawId}`);

    logger.success('DRAW_SERVICE', 'Draw deleted successfully');
    return {
      success: true,
      message: 'Sorteo eliminado exitosamente'
    };
  } catch (error) {
    logger.error('DRAW_SERVICE', 'Error deleting draw', { error: error.message, bettingPoolId, bettingPoolDrawId });
    throw error;
  }
};

/**
 * Get all lotteries available
 * @returns {Promise<Array>} List of lotteries
 */
export const getLotteries = async () => {
  try {
    const data = await api.get('/lotteries');

    return {
      success: true,
      data: data
    };
  } catch (error) {
    logger.error('DRAW_SERVICE', 'Error getting lotteries', { error: error.message });
    throw error;
  }
};

// ============================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================

/**
 * @deprecated Use getBettingPoolDraws instead
 * Legacy wrapper for old function name
 */
export const getBettingPoolSortitions = async (bettingPoolId) => {
  logger.warn('DRAW_SERVICE', 'getBettingPoolSortitions is deprecated. Use getBettingPoolDraws instead.');
  return getBettingPoolDraws(bettingPoolId);
};

/**
 * @deprecated Use saveBettingPoolDraws instead
 * Legacy wrapper for old function name
 */
export const saveBettingPoolSortitions = async (bettingPoolId, draws) => {
  logger.warn('DRAW_SERVICE', 'saveBettingPoolSortitions is deprecated. Use saveBettingPoolDraws instead.');
  return saveBettingPoolDraws(bettingPoolId, draws);
};

/**
 * @deprecated Use deleteBettingPoolDraw instead
 * Legacy wrapper for old function name
 */
export const deleteBettingPoolSortition = async (bettingPoolId, bettingPoolDrawId) => {
  logger.warn('DRAW_SERVICE', 'deleteBettingPoolSortition is deprecated. Use deleteBettingPoolDraw instead.');
  return deleteBettingPoolDraw(bettingPoolId, bettingPoolDrawId);
};

/**
 * @deprecated Use getBettingPoolDraws instead
 * Get all sortitions (legacy - returns empty array)
 */
export const getAllSortitions = async () => {
  logger.warn('DRAW_SERVICE', 'getAllSortitions is deprecated. Use getBettingPoolDraws instead.');
  return {
    success: true,
    data: []
  };
};

/**
 * @deprecated Use deleteBettingPoolDraw instead
 * Delete a sortition by ID (legacy wrapper)
 */
export const deleteSortition = async (sortitionId) => {
  logger.warn('DRAW_SERVICE', 'deleteSortition is deprecated. Use deleteBettingPoolDraw instead.');
  // This is a legacy function that doesn't have bettingPoolId
  // We'll need to handle it differently or throw an error
  throw new Error('deleteSortition requires migration to deleteBettingPoolDraw(bettingPoolId, bettingPoolDrawId)');
};

/**
 * @deprecated Use getBettingPoolDraws instead
 * Get sortitions by betting pool (legacy wrapper)
 */
export const getSortitionsByBettingPool = async (bettingPoolId) => {
  logger.warn('DRAW_SERVICE', 'getSortitionsByBettingPool is deprecated. Use getBettingPoolDraws instead.');
  return getBettingPoolDraws(bettingPoolId);
};

/**
 * @deprecated Use saveBettingPoolDraws instead
 * Create a single sortition (legacy - not recommended)
 */
export const createSortition = async (sortitionData) => {
  logger.warn('DRAW_SERVICE', 'createSortition is deprecated. Use saveBettingPoolDraws for bulk operations.');

  const { bettingPoolId, drawId, lotteryId, gameTypeIds, specificConfig } = sortitionData;

  if (!bettingPoolId || (!drawId && !lotteryId)) {
    throw new Error('bettingPoolId and drawId (or lotteryId) are required');
  }

  // Use the bulk endpoint with a single item
  const draws = [{
    drawId: drawId || lotteryId, // Fallback to lotteryId for old code
    isActive: true,
    anticipatedClosingMinutes: null,
    enabledGameTypeIds: gameTypeIds || []
  }];

  return saveBettingPoolDraws(bettingPoolId, draws);
};

/**
 * @deprecated Use saveBettingPoolDraws instead
 * Update a single sortition (legacy - not recommended)
 */
export const updateSortition = async (sortitionId, updateData) => {
  logger.warn('DRAW_SERVICE', 'updateSortition is deprecated. Use saveBettingPoolDraws for bulk operations.');
  throw new Error('updateSortition requires migration to saveBettingPoolDraws. Use bulk update instead.');
};

/**
 * @deprecated Use getBettingPoolDraws and filter by ID
 * Get a single sortition by ID (legacy - not recommended)
 */
export const getSortitionById = async (sortitionId) => {
  logger.warn('DRAW_SERVICE', 'getSortitionById is deprecated. Use getBettingPoolDraws and filter by ID.');
  throw new Error('getSortitionById requires migration. Use getBettingPoolDraws and filter the result.');
};

/**
 * @deprecated Game types should be managed separately
 * Get all game types (legacy - returns empty array)
 */
export const getGameTypes = async () => {
  logger.warn('DRAW_SERVICE', 'getGameTypes is deprecated. Game types should be managed separately.');
  return {
    success: true,
    data: []
  };
};

/**
 * Handle API errors consistently
 * @param {Error} error - Captured error
 * @param {string} operation - Operation that failed
 * @returns {string} User-friendly error message
 */
export const handleSortitionError = (error, operation = 'operación') => {
  const errorMessage = error.message || 'Error desconocido';

  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }

  if (errorMessage.includes('409') || errorMessage.includes('duplicado') || errorMessage.includes('Ya existe')) {
    return 'Ya existe una configuración de sorteo para esta lotería en esta banca.';
  }

  if (errorMessage.includes('404') || errorMessage.includes('no encontrado')) {
    return 'El sorteo no existe o ha sido eliminado.';
  }

  if (errorMessage.includes('400') || errorMessage === 'Error de validación') {
    return 'Datos inválidos. Verifica la información ingresada.';
  }

  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'Sesión expirada. Inicia sesión nuevamente.';
  }

  return `Error en ${operation}: ${errorMessage}`;
};

export default {
  // New functions (v2)
  getBettingPoolDraws,
  saveBettingPoolDraws,
  deleteBettingPoolDraw,
  getLotteries,
  handleSortitionError,
  // Legacy function names (deprecated - redirect to new functions)
  getBettingPoolSortitions,
  saveBettingPoolSortitions,
  deleteBettingPoolSortition,
  getAllSortitions,
  deleteSortition,
  getSortitionsByBettingPool,
  createSortition,
  updateSortition,
  getSortitionById,
  getGameTypes
};
