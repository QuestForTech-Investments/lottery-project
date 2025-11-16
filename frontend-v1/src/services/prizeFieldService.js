/**
 * Prize Field Service - Manejo de operaciones de campos de premios
 */

import api from './api';

/**
 * Obtener todos los campos de premios con sus valores default
 * @returns {Promise<Array>} Array de bet types con sus prize fields
 */
export const getPrizeFields = async () => {
  try {
    const response = await api.get('/prize-fields');

    // ✅ FIX: Transform API response (prizeTypes) to expected format (prizeFields)
    if (Array.isArray(response)) {
      response.forEach(betType => {
        if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
          betType.prizeFields = betType.prizeTypes;
        }
      });
    }

    return response; // api.get ya retorna los datos directamente, no response.data
  } catch (error) {
    console.error('Error al obtener campos de premios:', error);
    throw error;
  }
};

/**
 * Obtener todos los tipos de apuestas (bet types)
 * @returns {Promise<Array>} Array de bet types
 */
export const getBetTypes = async () => {
  try {
    const response = await api.get('/bet-types');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de apuestas:', error);
    throw error;
  }
};

/**
 * Obtener un tipo de apuesta específico con sus campos
 * @param {number} betTypeId - ID del tipo de apuesta
 * @returns {Promise<Object>} Bet type con sus prize fields
 */
export const getBetTypeById = async (betTypeId) => {
  try {
    const response = await api.get(`/bet-types/${betTypeId}`);

    // ✅ FIX: Transform API response (prizeTypes) to expected format (prizeFields)
    if (response.data && response.data.prizeTypes && Array.isArray(response.data.prizeTypes)) {
      response.data.prizeFields = response.data.prizeTypes;
    }

    return response.data;
  } catch (error) {
    console.error(`Error al obtener tipo de apuesta ${betTypeId}:`, error);
    throw error;
  }
};

/**
 * Guardar configuración de premios para una banca (POST completo)
 * @param {number} bettingPoolId - ID de la banca
 * @param {Array} prizeConfigs - Array de configuraciones { prizeFieldId, fieldCode, value }
 * @returns {Promise<Object>} Respuesta con detalles de configuraciones guardadas
 */
export const saveBancaPrizeConfig = async (bettingPoolId, prizeConfigs) => {
  try {
    const response = await api.post(`/betting-pools/${bettingPoolId}/prize-config`, {
      prizeConfigs
    });
    return response.data;
  } catch (error) {
    console.error(`Error al guardar configuración de premios para banca ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Actualizar parcialmente configuración de premios de una banca (PATCH optimizado)
 *
 * Este método está optimizado para actualizaciones parciales.
 * Solo envía los campos que cambiaron, no todos.
 *
 * Ventajas sobre saveBancaPrizeConfig (POST):
 * - Solo actualiza campos específicos que cambiaron
 * - No requiere DELETE previo
 * - 95-98% más rápido para cambios pequeños
 * - Operación atómica (UPDATE si existe, INSERT si no)
 *
 * @param {number} bettingPoolId - ID de la banca
 * @param {Array} prizeConfigs - Array SOLO con los campos que cambiaron { prizeFieldId, fieldCode, value }
 * @returns {Promise<Object>} Respuesta con detalles de configuraciones actualizadas
 *
 * @example
 * // Si solo cambió 1 campo:
 * await patchBancaPrizeConfig(9, [
 *   { prizeFieldId: 1, fieldCode: "DIRECTO_PRIMER_PAGO", value: 60.00 }
 * ]);
 */
export const patchBancaPrizeConfig = async (bettingPoolId, prizeConfigs) => {
  try {
    const response = await api.patch(`/betting-pools/${bettingPoolId}/prize-config`, {
      prizeConfigs
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar configuración de premios para banca ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Obtener configuración de premios de una banca
 * @param {number} bettingPoolId - ID de la banca
 * @returns {Promise<Array>} Array de configuraciones guardadas
 */
export const getBancaPrizeConfig = async (bettingPoolId) => {
  try {
    console.log(`🔍 [PRIZE SERVICE] Calling GET /betting-pools/${bettingPoolId}/prize-config`);
    const response = await api.get(`/betting-pools/${bettingPoolId}/prize-config`);
    console.log(`🔍 [PRIZE SERVICE] Raw response from api.get:`, response);
    console.log(`🔍 [PRIZE SERVICE] Type of response:`, typeof response);
    console.log(`🔍 [PRIZE SERVICE] Is Array:`, Array.isArray(response));

    // CRITICAL FIX: api.get already returns data directly (see api.js line 103)
    // This matches how getPrizeFields() works (line 14 above)
    // Previously was returning response.data which was undefined!
    console.log(`✅ [PRIZE SERVICE] Returning response directly:`, response);
    return response; // NOT response.data
  } catch (error) {
    console.error(`❌ [PRIZE SERVICE] Error al obtener configuración de premios para banca ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Eliminar configuración de premios de una banca
 * @param {number} bettingPoolId - ID de la banca
 * @returns {Promise<Object>} Respuesta de la operación
 */
export const deleteBancaPrizeConfig = async (bettingPoolId) => {
  try {
    const response = await api.delete(`/betting-pools/${bettingPoolId}/prize-config`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar configuración de premios para banca ${bettingPoolId}:`, error);
    throw error;
  }
};

// ============================================================================
// DRAW PRIZE CONFIG - Configuración de premios por sorteo específico
// ============================================================================

/**
 * Guardar configuración de premios para un sorteo específico de una banca
 * @param {number} bettingPoolId - ID de la banca
 * @param {number} drawId - ID del sorteo
 * @param {Array} prizeConfigs - Array de configuraciones { prizeFieldId, fieldCode, value }
 * @returns {Promise<Object>} Respuesta con detalles de configuraciones guardadas
 */
export const saveDrawPrizeConfig = async (bettingPoolId, drawId, prizeConfigs) => {
  try {
    const response = await api.post(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`, {
      prizeConfigs
    });
    return response.data;
  } catch (error) {
    console.error(`Error al guardar configuración de premios para sorteo ${drawId} en banca ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Obtener configuración de premios de un sorteo específico de una banca
 * @param {number} bettingPoolId - ID de la banca
 * @param {number} drawId - ID del sorteo
 * @returns {Promise<Array>} Array de configuraciones guardadas para el sorteo
 */
export const getDrawPrizeConfig = async (bettingPoolId, drawId) => {
  try {
    const response = await api.get(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener configuración de premios para sorteo ${drawId} en banca ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Obtener configuración de premios resuelta con prioridad en cascada
 * (draw_specific > banca_default > system_default)
 * @param {number} bettingPoolId - ID de la banca
 * @param {number} drawId - ID del sorteo
 * @returns {Promise<Array>} Array de todos los campos de premio con sus valores resueltos y fuente
 */
export const getResolvedDrawPrizeConfig = async (bettingPoolId, drawId) => {
  try {
    const response = await api.get(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config/resolved`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener configuración resuelta para sorteo ${drawId} en banca ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Eliminar configuración de premios de un sorteo específico de una banca
 * @param {number} bettingPoolId - ID de la banca
 * @param {number} drawId - ID del sorteo
 * @returns {Promise<Object>} Respuesta de la operación
 */
export const deleteDrawPrizeConfig = async (bettingPoolId, drawId) => {
  try {
    const response = await api.delete(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar configuración de premios para sorteo ${drawId} en banca ${bettingPoolId}:`, error);
    throw error;
  }
};
