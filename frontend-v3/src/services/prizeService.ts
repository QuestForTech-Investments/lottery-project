/**
 * Prize and Commission Service
 * Handles all prize-related API calls for betting pools
 * TypeScript version with proper typing and api client usage
 */

import { api } from './api/client';

// ============================================================================
// TYPES
// ============================================================================

export interface PrizeField {
  prizeTypeId: number;
  fieldCode: string;
  fieldName: string;
  defaultMultiplier: number;
  displayOrder: number;
}

export interface BetTypeWithFields {
  betTypeId: number;
  betTypeCode: string;
  betTypeName: string;
  description?: string;
  prizeFields?: PrizeField[];
  prizeTypes?: PrizeField[]; // API may return this name
}

export interface PrizeConfig {
  prizeTypeId: number;
  fieldCode: string;
  value?: number;
  customValue?: number;
}

export interface MergedPrizeData {
  betTypes: BetTypeWithFields[];
  customConfigs: PrizeConfig[];
  customMap: Record<string, number>;
  hasCustomValues: boolean;
}

// ============================================================================
// CACHE
// ============================================================================

let betTypesCache: BetTypeWithFields[] | null = null;
let betTypesCacheTimestamp: number | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the bet types cache (useful for testing or force refresh)
 */
export const clearBetTypesCache = (): void => {
  betTypesCache = null;
  betTypesCacheTimestamp = null;
  console.log('🗑️ Bet types cache cleared');
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all bet types (summary list without prize fields)
 * @returns List of all bet types
 */
export const getAllBetTypes = async (): Promise<BetTypeWithFields[]> => {
  try {
    const response = await api.get<BetTypeWithFields[]>('/bet-types');
    return response;
  } catch (error) {
    console.error('Error in getAllBetTypes:', error);
    throw error;
  }
};

/**
 * Get all bet types with their complete prize fields
 * OPTIMIZED: Uses single API call to /bet-types/with-fields endpoint
 * CACHED: Uses in-memory cache to avoid redundant API calls
 * @param forceRefresh - Force refresh cache (default: false)
 * @returns List of all bet types with prize fields
 */
export const getAllBetTypesWithFields = async (
  forceRefresh = false
): Promise<BetTypeWithFields[]> => {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    const cacheIsValid =
      betTypesCache &&
      betTypesCacheTimestamp &&
      now - betTypesCacheTimestamp < CACHE_DURATION_MS;

    if (!forceRefresh && cacheIsValid) {
      console.log('✅ Using cached bet types (cache hit)');
      return betTypesCache;
    }

    // Cache miss or expired - fetch fresh data
    console.log('⏱️ Fetching bet types from API (cache miss)...');
    const fetchStartTime = performance.now();

    let sortedBetTypes: BetTypeWithFields[];

    // Try optimized endpoint first: Single API call (5-8x faster)
    try {
      const detailedBetTypes = await api.get<BetTypeWithFields[]>('/bet-types/with-fields');

      if (!Array.isArray(detailedBetTypes)) {
        throw new Error('Invalid response format: expected array of bet types');
      }

      sortedBetTypes = detailedBetTypes.sort((a, b) => a.betTypeId - b.betTypeId);

      // Transform API response (prizeTypes) to expected format (prizeFields)
      sortedBetTypes.forEach((betType) => {
        if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
          betType.prizeFields = betType.prizeTypes;
          betType.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
        } else if (betType.prizeFields && Array.isArray(betType.prizeFields)) {
          // Legacy support: if API already returns prizeFields
          betType.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
        }
      });

      console.log('✅ Using OPTIMIZED endpoint');
    } catch (error) {
      // Fallback to legacy method: Multiple API calls
      console.log('⚠️ Optimized endpoint not available, using legacy method...');

      const betTypesList = await getAllBetTypes();
      const detailPromises = betTypesList.map((betType) =>
        getBetTypeById(betType.betTypeId)
      );
      const detailedBetTypes = await Promise.all(detailPromises);
      sortedBetTypes = detailedBetTypes.sort((a, b) => a.betTypeId - b.betTypeId);

      console.log(`✅ Using LEGACY method (${betTypesList.length} calls)`);
    }

    // Store in cache
    betTypesCache = sortedBetTypes;
    betTypesCacheTimestamp = now;

    const fetchTime = (performance.now() - fetchStartTime).toFixed(2);
    console.log(
      `✅ Bet types fetched and cached in ${fetchTime}ms (${sortedBetTypes.length} types)`
    );

    return sortedBetTypes;
  } catch (error) {
    console.error('Error in getAllBetTypesWithFields:', error);
    throw error;
  }
};

/**
 * Get a specific bet type with its prize fields
 * @param betTypeId - Bet type ID
 * @returns Bet type details with prize fields
 */
export const getBetTypeById = async (betTypeId: number): Promise<BetTypeWithFields> => {
  try {
    const data = await api.get<BetTypeWithFields>(`/bet-types/${betTypeId}`);

    // Transform API response (prizeTypes) to expected format (prizeFields)
    if (data.prizeTypes && Array.isArray(data.prizeTypes)) {
      data.prizeFields = data.prizeTypes;
      data.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
    } else if (data.prizeFields && Array.isArray(data.prizeFields)) {
      // Legacy support: if API already returns prizeFields
      data.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return data;
  } catch (error) {
    console.error('Error in getBetTypeById:', error);
    throw error;
  }
};

/**
 * Get prize configurations for a specific betting pool
 * @param bettingPoolId - Betting pool ID
 * @returns List of custom prize configurations
 */
export const getBettingPoolPrizeConfigs = async (
  bettingPoolId: number
): Promise<PrizeConfig[]> => {
  try {
    const response = await api.get<PrizeConfig[]>(
      `/betting-pools/${bettingPoolId}/prize-config`
    );
    return response;
  } catch (error) {
    console.warn('Error fetching prize configs, returning empty:', error);
    return [];
  }
};

/**
 * Create or update prize configuration for a betting pool
 * @param bettingPoolId - Betting pool ID
 * @param prizeConfig - Prize configuration data
 * @returns Created/updated prize configuration
 */
export const savePrizeConfig = async (
  bettingPoolId: number,
  prizeConfig: PrizeConfig
): Promise<PrizeConfig> => {
  try {
    const response = await api.post<PrizeConfig>(
      `/betting-pools/${bettingPoolId}/prize-config`,
      prizeConfig
    );
    return response;
  } catch (error) {
    console.error('Error in savePrizeConfig:', error);
    throw error;
  }
};

/**
 * Get merged prize data for a betting pool
 * Returns default values from bet_types merged with custom values from betting_pool_config
 * Custom values override defaults
 *
 * @param bettingPoolId - Betting pool ID (optional, if not provided returns only defaults)
 * @returns Merged prize data with precedence: custom > default
 */
export const getMergedPrizeData = async (
  bettingPoolId: number | null = null
): Promise<MergedPrizeData> => {
  try {
    // Get default values from bet types with all prize fields
    const betTypes = await getAllBetTypesWithFields();

    // Get custom values if bettingPoolId is provided
    let customConfigs: PrizeConfig[] = [];
    if (bettingPoolId) {
      customConfigs = await getBettingPoolPrizeConfigs(bettingPoolId);
    }

    // Build a map of custom values by field code for quick lookup
    // The key format matches the form field naming: BETTYPE_FIELDCODE
    const customMap: Record<string, number> = {};
    customConfigs.forEach((config) => {
      // Check for customValue (from backend) or value (from older format)
      const value = config.customValue !== undefined ? config.customValue : config.value;

      if (config.fieldCode && value !== undefined && value !== null) {
        // Extract betTypeCode from fieldCode (first part before underscore)
        const parts = config.fieldCode.split('_');
        const betTypeCode = parts[0];

        // Build the key in the same format as formData: BETTYPE_FIELDCODE
        const customKey = `${betTypeCode}_${config.fieldCode}`;
        customMap[customKey] = value;

        console.log(`Mapped custom value: ${customKey} = ${value}`);
      }
    });

    console.log(`Built customMap with ${Object.keys(customMap).length} custom values`);

    return {
      betTypes,
      customConfigs,
      customMap,
      hasCustomValues: customConfigs.length > 0,
    };
  } catch (error) {
    console.error('Error in getMergedPrizeData:', error);
    throw error;
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  getAllBetTypes,
  getAllBetTypesWithFields,
  getBetTypeById,
  getBettingPoolPrizeConfigs,
  savePrizeConfig,
  getMergedPrizeData,
  clearBetTypesCache,
};
