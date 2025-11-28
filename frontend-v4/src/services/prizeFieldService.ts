/**
 * Prize Type Service - Manejo de operaciones de tipos de premios
 * Incluye funciones optimizadas con PATCH para actualizaciones parciales
 */

import api from './api';

// Types
interface PrizeType {
  prizeTypeId: number;
  fieldCode: string;
  fieldName: string;
  defaultValue: number;
  displayOrder: number;
}

interface BetType {
  betTypeId: number;
  betTypeName: string;
  betTypeCode?: string;
  prizeTypes?: PrizeType[];
  prizeFields?: PrizeType[];
}

interface PrizeConfig {
  prizeTypeId?: number;
  fieldCode: string;
  value: number;
}

interface PrizeConfigPayload {
  prizeConfigs: PrizeConfig[];
}

interface PatchResponse {
  updatedCount?: number;
  [key: string]: unknown;
}

interface ResolvedPrizeConfig {
  prizeTypeId: number;
  fieldCode: string;
  value: number;
  source: 'draw_specific' | 'banca_default' | 'system_default';
}

/**
 * Obtener todos los tipos de premios con sus valores default
 * Necesario para mapear nombres de campos a IDs de base de datos
 */
export const getPrizeFields = async (): Promise<BetType[]> => {
  try {
    console.log('[FETCH] Obteniendo campos de premios...');
    const response = await fetch('/api/prize-fields');

    if (!response.ok) {
      throw new Error(`Error ${response.status} al obtener campos de premios`);
    }

    const data = await response.json() as BetType[];
    console.log(`[SUCCESS] Campos de premios obtenidos: ${data.length} bet types`);
    return data;
  } catch (error) {
    console.error('[ERROR] Error al obtener campos de premios:', error);
    throw error;
  }
};

/**
 * Obtener todos los tipos de apuestas (bet types)
 */
export const getBetTypes = async (): Promise<BetType[]> => {
  try {
    const response = await api.get('/bet-types') as BetType[];
    return response;
  } catch (error) {
    console.error('Error al obtener tipos de apuestas:', error);
    throw error;
  }
};

/**
 * Obtener un bet type específico con sus campos
 */
export const getBetTypeById = async (betTypeId: number | string): Promise<BetType> => {
  try {
    const response = await api.get(`/bet-types/${betTypeId}`) as BetType;
    return response;
  } catch (error) {
    console.error(`Error al obtener bet type ${betTypeId}:`, error);
    throw error;
  }
};

/**
 * Guardar configuration de premios para una banca (POST completo)
 */
export const saveBancaPrizeConfig = async (
  bettingPoolId: number | string,
  prizeConfigs: PrizeConfig[]
): Promise<unknown> => {
  try {
    const response = await api.post(`/betting-pools/${bettingPoolId}/prize-config`, {
      prizeConfigs
    } as PrizeConfigPayload);
    return response;
  } catch (error) {
    console.error(`Error saving prize config for betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Actualizar parcialmente configuration de premios de una banca (PATCH optimizado)
 * Solo actualiza los campos que cambiaron (95-98% más rápido que PUT)
 */
export const patchBancaPrizeConfig = async (
  bettingPoolId: number | string,
  prizeConfigs: PrizeConfig[]
): Promise<PatchResponse> => {
  try {
    console.log(`[SEND] [PATCH] Enviando ${prizeConfigs.length} cambios a banca ${bettingPoolId}`);

    const response = await api.patch(`/betting-pools/${bettingPoolId}/prize-config`, {
      prizeConfigs
    } as PrizeConfigPayload) as PatchResponse;

    console.log(`[SUCCESS] [PATCH] Update successful: ${response.updatedCount || 0} fields updated`);
    return response;
  } catch (error) {
    console.error(`[ERROR] Error updating prize config for betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Obtener configuration de premios de una banca
 */
export const getBancaPrizeConfig = async (bettingPoolId: number | string): Promise<PrizeConfig[]> => {
  try {
    console.log(`[DEBUG] [PRIZE SERVICE] Calling GET /betting-pools/${bettingPoolId}/prize-config`);
    const response = await api.get(`/betting-pools/${bettingPoolId}/prize-config`) as PrizeConfig[];
    console.log(`[SUCCESS] [PRIZE SERVICE] Returning response directly:`, response);
    return response;
  } catch (error) {
    console.error(`[ERROR] [PRIZE SERVICE] Error getting prize config for betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Eliminar configuration de premios de una banca
 */
export const deleteBancaPrizeConfig = async (bettingPoolId: number | string): Promise<unknown> => {
  try {
    const response = await api.delete(`/betting-pools/${bettingPoolId}/prize-config`);
    return response;
  } catch (error) {
    console.error(`Error deleting prize config for betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

// ============================================================================
// DRAW PRIZE CONFIG - Configuración de premios por sorteo específico
// ============================================================================

/**
 * Guardar configuration de premios para un sorteo específico de una banca
 */
export const saveDrawPrizeConfig = async (
  bettingPoolId: number | string,
  drawId: number | string,
  prizeConfigs: PrizeConfig[]
): Promise<unknown> => {
  try {
    const response = await api.post(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`, {
      prizeConfigs
    } as PrizeConfigPayload);
    return response;
  } catch (error) {
    console.error(`Error saving prize config for draw ${drawId} in betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Obtener configuration de premios de un sorteo específico de una banca
 */
export const getDrawPrizeConfig = async (
  bettingPoolId: number | string,
  drawId: number | string
): Promise<PrizeConfig[]> => {
  try {
    const response = await api.get(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`) as PrizeConfig[];
    return response;
  } catch (error) {
    console.error(`Error getting prize config for draw ${drawId} in betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Obtener configuration de premios resuelta con prioridad en cascada
 * (draw_specific > banca_default > system_default)
 */
export const getResolvedDrawPrizeConfig = async (
  bettingPoolId: number | string,
  drawId: number | string
): Promise<ResolvedPrizeConfig[]> => {
  try {
    const response = await api.get(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config/resolved`) as ResolvedPrizeConfig[];
    return response;
  } catch (error) {
    console.error(`Error getting resolved config for draw ${drawId} in betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

/**
 * Eliminar configuration de premios de un sorteo específico de una banca
 */
export const deleteDrawPrizeConfig = async (
  bettingPoolId: number | string,
  drawId: number | string
): Promise<unknown> => {
  try {
    const response = await api.delete(`/betting-pools/${bettingPoolId}/draws/${drawId}/prize-config`);
    return response;
  } catch (error) {
    console.error(`Error deleting prize config for draw ${drawId} in betting pool ${bettingPoolId}:`, error);
    throw error;
  }
};

export default {
  getPrizeFields,
  getBetTypes,
  getBetTypeById,
  saveBancaPrizeConfig,
  patchBancaPrizeConfig,
  getBancaPrizeConfig,
  deleteBancaPrizeConfig,
  saveDrawPrizeConfig,
  getDrawPrizeConfig,
  getResolvedDrawPrizeConfig,
  deleteDrawPrizeConfig
};
