/**
 * Sortition (Draws) Service
 * Handles all betting pool draws configuration API calls
 * TypeScript version with proper typing and api client usage
 */

import { api } from './api/client'
import logger from '@/utils/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface GameTypeDto {
  gameTypeId: number
  gameTypeName: string
  gameTypeCode: string
}

export interface BettingPoolDrawDto {
  bettingPoolDrawId: number
  bettingPoolId: number
  drawId: number
  drawName: string
  drawTime: string
  lotteryId: number
  lotteryName: string
  countryName: string
  isActive: boolean
  anticipatedClosingMinutes: number | null
  enabledGameTypes: GameTypeDto[]
  availableGameTypes: GameTypeDto[]
}

export interface CreateBettingPoolDrawDto {
  drawId: number
  isActive?: boolean
  anticipatedClosingMinutes?: number | null
  enabledGameTypeIds?: number[]
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all betting pool draws
 * @param bettingPoolId - ID of the betting pool
 * @returns Draw configurations
 *
 * Response format (from /draws endpoint):
 * {
 *   bettingPoolDrawId: number,
 *   bettingPoolId: number,
 *   drawId: number,           // Specific draw ID
 *   drawName: string,          // e.g., "NACIONAL"
 *   drawTime: string,          // e.g., "12:00:00"
 *   lotteryId: number,         // Parent lottery ID
 *   lotteryName: string,
 *   countryName: string,
 *   isActive: boolean,
 *   anticipatedClosingMinutes: number,
 *   enabledGameTypes: GameTypeDto[],
 *   availableGameTypes: GameTypeDto[]
 * }
 */
export const getBettingPoolDraws = async (
  bettingPoolId: number
): Promise<{ success: boolean; data: BettingPoolDrawDto[] }> => {
  try {
    logger.info('Loading draws for betting pool', { bettingPoolId })
    const data = await api.get<BettingPoolDrawDto[]>(`/betting-pools/${bettingPoolId}/draws`)
    logger.info('Draws loaded successfully', { count: data?.length || 0 })
    return { success: true, data }
  } catch (error) {
    logger.error('Error getting betting pool draws', error)
    throw error
  }
}

/**
 * Create or update multiple betting pool draws
 * @param bettingPoolId - ID of the betting pool
 * @param draws - Array of draw configurations
 * @returns Saved draw configurations
 *
 * Request payload format:
 * {
 *   drawId: number,              // Required: ID of the draw to add
 *   isActive: boolean,           // Optional: default true
 *   anticipatedClosingMinutes: number,  // Optional
 *   enabledGameTypeIds: number[] // Optional: array of game type IDs
 * }
 */
export const saveBettingPoolDraws = async (
  bettingPoolId: number,
  draws: CreateBettingPoolDrawDto[]
): Promise<{ success: boolean; data: BettingPoolDrawDto[] }> => {
  try {
    logger.info('Saving draws for betting pool', { bettingPoolId, count: draws.length, draws })

    // Using /draws/bulk for batch operations
    const data = await api.post<BettingPoolDrawDto[]>(
      `/betting-pools/${bettingPoolId}/draws/bulk`,
      draws
    )

    logger.info('Draws saved successfully', data)
    return { success: true, data }
  } catch (error) {
    logger.error('Error saving betting pool draws', error)
    throw error
  }
}

/**
 * Delete a draw configuration from betting pool
 * @param bettingPoolId - ID of the betting pool
 * @param bettingPoolDrawId - ID of the betting pool draw configuration
 * @returns Success indicator
 */
export const deleteBettingPoolDraw = async (
  bettingPoolId: number,
  bettingPoolDrawId: number
): Promise<{ success: boolean }> => {
  try {
    logger.info('Deleting draw from betting pool', { bettingPoolId, bettingPoolDrawId })
    await api.delete(`/betting-pools/${bettingPoolId}/draws/${bettingPoolDrawId}`)
    logger.info('Draw deleted successfully')
    return { success: true }
  } catch (error) {
    logger.error('Error deleting betting pool draw', error)
    throw error
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  getBettingPoolDraws,
  saveBettingPoolDraws,
  deleteBettingPoolDraw,
}
