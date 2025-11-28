/**
 * Prize and Commission Service
 * Handles all prize-related API calls for betting pools
 */

import api from './api';

// ⚡ CACHE: Bet types are static data, cache them in memory
let betTypesCache = null;
let betTypesCacheTimestamp = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the bet types cache (useful for testing or force refresh)
 */
export const clearBetTypesCache = () => {
  betTypesCache = null;
  betTypesCacheTimestamp = null;
  console.log('🗑️ Bet types cache cleared');
};

/**
 * Get all bet types (summary list)
 * @returns {Promise} - List of all bet types (without prize types)
 */
export const getAllBetTypes = async () => {
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
 * @param {boolean} forceRefresh - Force refresh cache (default: false)
 * @returns {Promise<Array>} - List of all bet types with prize types
 */
export const getAllBetTypesWithFields = async (forceRefresh = false) => {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    const cacheIsValid = betTypesCache &&
                         betTypesCacheTimestamp &&
                         (now - betTypesCacheTimestamp) < CACHE_DURATION_MS;

    if (!forceRefresh && cacheIsValid) {
      console.log('✅ Using cached bet types (cache hit)');
      return betTypesCache;
    }

    // Cache miss or expired - fetch fresh data
    console.log('⏱️ Fetching bet types from API (cache miss)...');
    const fetchStartTime = performance.now();

    let sortedBetTypes;

    // 🚀 TRY OPTIMIZED ENDPOINT FIRST: Single API call (5-8x faster)
    try {
      const response = await fetch('/api/bet-types/with-fields');

      if (response.ok) {
        // ✅ NEW OPTIMIZED ENDPOINT AVAILABLE
        const detailedBetTypes = await response.json();

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

        console.log(`✅ Using OPTIMIZED endpoint`);
      } else {
        // Endpoint not available, use fallback
        throw new Error('Endpoint not available');
      }
    } catch (error) {
      // 🔄 FALLBACK TO LEGACY METHOD: Multiple API calls
      console.log('⚠️ Optimized endpoint not available, using legacy method...');

      const betTypesList = await getAllBetTypes();
      const detailPromises = betTypesList.map(betType =>
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
    console.log(`✅ Bet types fetched and cached in ${fetchTime}ms (${sortedBetTypes.length} types)`);

    return sortedBetTypes;
  } catch (error) {
    console.error('Error in getAllBetTypesWithFields:', error);
    throw error;
  }
};

/**
 * Get a specific bet type with its prize types
 * @param {number} betTypeId - Bet type ID
 * @returns {Promise} - Bet type details with prize types
 */
export const getBetTypeById = async (betTypeId) => {
  try {
    const response = await fetch(`/api/bet-types/${betTypeId}`);
    if (!response.ok) {
      throw new Error(`Error fetching bet type: ${response.status}`);
    }
    const data = await response.json();

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
 * @param {number} bettingPoolId - Betting pool ID
 * @returns {Promise} - List of custom prize configurations
 * Expected format: [{ prizeTypeId, fieldCode, value }]
 */
export const getBettingPoolPrizeConfigs = async (bettingPoolId) => {
  try {
    const response = await fetch(`/api/betting-pools/${bettingPoolId}/prize-config`);
    if (!response.ok) {
      // No custom configs found, return empty array
      return [];
    }
    return await response.json();
  } catch (error) {
    console.warn('Error fetching prize configs, returning empty:', error.message);
    return [];
  }
};

/**
 * Create or update prize configuration for a betting pool
 * @param {number} bettingPoolId - Betting pool ID
 * @param {Object} prizeConfig - Prize configuration data
 * @returns {Promise} - Created/updated prize configuration
 */
export const savePrizeConfig = async (bettingPoolId, prizeConfig) => {
  try {
    const response = await fetch(`/api/betting-pools/${bettingPoolId}/prize-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prizeConfig)
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
 *
 * @param {number} bettingPoolId - Betting pool ID (optional, if not provided returns only defaults)
 * @returns {Promise} - Merged prize data with precedence: custom > default
 */
export const getMergedPrizeData = async (bettingPoolId = null) => {
  try {
    // Get default values from bet types with all prize types
    const betTypes = await getAllBetTypesWithFields();

    // Get custom values if bettingPoolId is provided
    // Expected format: [{ prizeTypeId, fieldCode, value }]
    let customConfigs = [];
    if (bettingPoolId) {
      customConfigs = await getBettingPoolPrizeConfigs(bettingPoolId);
    }

    // Build a map of custom values by field code for quick lookup
    // The key format matches the form field naming: BETTYPE_FIELDCODE
    // Example: fieldCode "DIRECTO_PRIMER_PAGO" → key "DIRECTO_DIRECTO_PRIMER_PAGO"
    const customMap = {};
    customConfigs.forEach(config => {
      // Check for customValue (from backend) or value (from older format)
      const value = config.customValue !== undefined ? config.customValue : config.value;

      if (config.fieldCode && value !== undefined && value !== null) {
        // Extract betTypeCode from fieldCode (first part before underscore)
        // fieldCode format: "DIRECTO_PRIMER_PAGO" → betTypeCode: "DIRECTO"
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
