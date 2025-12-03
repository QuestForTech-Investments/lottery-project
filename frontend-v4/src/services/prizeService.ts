/**
 * Prize and Commission Service
 * Handles all prize-related API calls for betting pools
 */

// Types - Export for re-use
export interface PrizeType {
  prizeTypeId: number;
  fieldCode: string;
  fieldName: string;
  defaultValue: number;
  displayOrder: number;
}

export interface BetType {
  betTypeId: number;
  betTypeName: string;
  betTypeCode?: string;
  prizeTypes?: PrizeType[];
  prizeFields?: PrizeType[];
}

export interface PrizeConfig {
  prizeTypeId?: number;
  fieldCode: string;
  value?: number;
  customValue?: number;
  prizeConfigs?: PrizeConfig[];
}

interface MergedPrizeData {
  betTypes: BetType[];
  customConfigs: PrizeConfig[];
  customMap: Record<string, number>;
  hasCustomValues: boolean;
}

// ⚡ CACHE: Bet types are static data, cache them in memory
let betTypesCache: BetType[] | null = null;
let betTypesCacheTimestamp: number | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the bet types cache (useful for testing or force refresh)
 */
export const clearBetTypesCache = (): void => {
  betTypesCache = null;
  betTypesCacheTimestamp = null;
  console.log('[DELETE] Bet types cache cleared');
};

/**
 * Get all bet types (summary list)
 */
export const getAllBetTypes = async (): Promise<BetType[]> => {
  try {
    const response = await fetch('/api/bet-types');
    if (!response.ok) {
      throw new Error(`Error fetching bet types: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllBetTypes:', error);
    throw error;
  }
};

/**
 * Get all bet types with their complete prize types
 * 🚀 OPTIMIZED: Uses single API call to /api/bet-types/with-fields endpoint
 * ⚡ CACHED: Uses in-memory cache to avoid redundant API calls
 */
export const getAllBetTypesWithFields = async (forceRefresh: boolean = false): Promise<BetType[]> => {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    const cacheIsValid = betTypesCache &&
                         betTypesCacheTimestamp &&
                         (now - betTypesCacheTimestamp) < CACHE_DURATION_MS;

    if (!forceRefresh && cacheIsValid) {
      console.log('[SUCCESS] Using cached bet types (cache hit)');
      return betTypesCache as BetType[];
    }

    // Cache miss or expired - fetch fresh data
    console.log('[TIMING] Fetching bet types from API (cache miss)...');
    const fetchStartTime = performance.now();

    let sortedBetTypes: BetType[];

    // 🚀 TRY OPTIMIZED ENDPOINT FIRST: Single API call (5-8x faster)
    try {
      const response = await fetch('/api/bet-types/with-fields');

      if (response.ok) {
        // ✅ NEW OPTIMIZED ENDPOINT AVAILABLE
        const detailedBetTypes = await response.json() as BetType[];

        if (!Array.isArray(detailedBetTypes)) {
          throw new Error('Invalid response format: expected array of bet types');
        }

        sortedBetTypes = detailedBetTypes.sort((a, b) => a.betTypeId - b.betTypeId);

        sortedBetTypes.forEach(betType => {
          // ✅ FIX: Transform API response (prizeTypes) to expected format (prizeFields)
          if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
            betType.prizeFields = betType.prizeTypes;
            betType.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
          } else if (betType.prizeFields && Array.isArray(betType.prizeFields)) {
            // Legacy support: if API already returns prizeFields
            betType.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
          }
        });

        console.log(`[SUCCESS] Using OPTIMIZED endpoint`);
      } else {
        // Endpoint not available, use fallback
        throw new Error('Endpoint not available');
      }
    } catch {
      // 🔄 FALLBACK TO LEGACY METHOD: Multiple API calls
      console.log('[WARN] Optimized endpoint not available, using legacy method...');

      const betTypesList = await getAllBetTypes();
      const detailPromises = betTypesList.map(betType =>
        getBetTypeById(betType.betTypeId)
      );
      const detailedBetTypes = await Promise.all(detailPromises);
      sortedBetTypes = detailedBetTypes.sort((a, b) => a.betTypeId - b.betTypeId);

      console.log(`[SUCCESS] Using LEGACY method (${betTypesList.length} calls)`);
    }

    // Store in cache
    betTypesCache = sortedBetTypes;
    betTypesCacheTimestamp = now;

    const fetchTime = (performance.now() - fetchStartTime).toFixed(2);
    console.log(`[SUCCESS] Bet types fetched and cached in ${fetchTime}ms (${sortedBetTypes.length} types)`);

    return sortedBetTypes;
  } catch (error) {
    console.error('Error in getAllBetTypesWithFields:', error);
    throw error;
  }
};

/**
 * Get a specific bet type with its prize types
 */
export const getBetTypeById = async (betTypeId: number): Promise<BetType> => {
  try {
    const response = await fetch(`/api/bet-types/${betTypeId}`);
    if (!response.ok) {
      throw new Error(`Error fetching bet type: ${response.status}`);
    }
    const data = await response.json() as BetType;

    // ✅ FIX: Transform API response (prizeTypes) to expected format (prizeFields)
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
 */
export const getBettingPoolPrizeConfigs = async (bettingPoolId: number | string): Promise<PrizeConfig[]> => {
  try {
    const response = await fetch(`/api/betting-pools/${bettingPoolId}/prize-config`);
    if (!response.ok) {
      // No custom configs found, return empty array
      return [];
    }
    return await response.json();
  } catch (err) {
    const error = err as Error;
    console.warn('Error fetching prize configs, returning empty:', error.message);
    return [];
  }
};

/**
 * Create or update prize configuration for a betting pool
 * API expects: { prizeConfigs: [...] }
 */
export const savePrizeConfig = async (bettingPoolId: number | string, prizeConfig: PrizeConfig | PrizeConfig[]): Promise<unknown> => {
  try {
    // ✅ FIX: Wrap array in { prizeConfigs: [...] } as expected by API
    const body = Array.isArray(prizeConfig)
      ? { prizeConfigs: prizeConfig }
      : { prizeConfigs: [prizeConfig] };

    console.log(`[SAVE] Sending ${Array.isArray(prizeConfig) ? prizeConfig.length : 1} prize configs to /api/betting-pools/${bettingPoolId}/prize-config`);

    const response = await fetch(`/api/betting-pools/${bettingPoolId}/prize-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Error saving prize config: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in savePrizeConfig:', error);
    throw error;
  }
};

/**
 * Get merged prize data for a betting pool
 * Returns default values from bet_types merged with custom values from betting_pool_config
 * Custom values override defaults
 */
export const getMergedPrizeData = async (bettingPoolId: number | string | null = null): Promise<MergedPrizeData> => {
  try {
    // Get default values from bet types with all prize types
    const betTypes = await getAllBetTypesWithFields();

    // Get custom values if bettingPoolId is provided
    let customConfigs: PrizeConfig[] = [];
    if (bettingPoolId) {
      customConfigs = await getBettingPoolPrizeConfigs(bettingPoolId);
    }

    // Build a map of custom values by field code for quick lookup
    const customMap: Record<string, number> = {};
    customConfigs.forEach(config => {
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
      hasCustomValues: customConfigs.length > 0
    };
  } catch (error) {
    console.error('Error in getMergedPrizeData:', error);
    throw error;
  }
};

export default {
  getAllBetTypes,
  getAllBetTypesWithFields,
  getBetTypeById,
  getBettingPoolPrizeConfigs,
  savePrizeConfig,
  getMergedPrizeData,
  clearBetTypesCache
};
