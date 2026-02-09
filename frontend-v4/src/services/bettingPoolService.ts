/**
 * Betting Pool Service - Manejo de operaciones de betting pools
 * Basado en la documentación API V4.0
 * NOTA: Usa el endpoint /api/betting-pools del backend
 */

import { api } from './api';

// Types - Export for re-use
export interface BettingPoolListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  zoneId?: number | string;
  isActive?: boolean;
}

export interface BettingPoolListResponse {
  items?: BettingPool[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  message?: string;
}

export interface BettingPool {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode?: string;
  branchCode?: string;
  zoneId: number;
  location?: string;
  reference?: string;
  comment?: string;
  username?: string;
  isActive?: boolean;
}

export interface BettingPoolCreateData {
  bettingPoolName: string;
  bettingPoolCode?: string; // Alternate name for branchCode
  branchCode?: string;
  zoneId: number;
  location?: string | null;
  reference?: string | null;
  comment?: string | null;
  username?: string | null;
  userId?: number;
  password?: string | null;
  // Config fields that may be included
  config?: Record<string, unknown>;
  printConfig?: Record<string, unknown>;
  discountConfig?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BettingPoolUpdateData {
  bettingPoolName?: string;
  location?: string | null;
  reference?: string | null;
  comment?: string | null;
  zoneId?: number;
  username?: string | null;
  password?: string | null;
  isActive?: boolean;
}

export interface BettingPoolConfigData {
  config?: {
    fallType?: string;
    deactivationBalance?: number | null;
    dailySaleLimit?: number | null;
    dailyBalanceLimit?: number | null;
    temporaryAdditionalBalance?: number | null;
    enableTemporaryBalance?: boolean;
    creditLimit?: number;
    controlWinningTickets?: boolean;
    allowJackpot?: boolean;
    enableRecharges?: boolean;
    allowPasswordChange?: boolean;
    cancelMinutes?: number;
    dailyCancelTickets?: number | null;
    maxCancelAmount?: number | null;
    maxTicketAmount?: number | null;
    maxDailyRecharge?: number | null;
    paymentMode?: string;
    allowFutureSales?: boolean;
    maxFutureDays?: number;
    useCentralLogo?: boolean;
  };
  discountConfig?: {
    discountProvider?: string;
    discountMode?: string;
  };
  printConfig?: {
    printMode?: string;
    printEnabled?: boolean;
    printTicketCopy?: boolean;
    printRechargeReceipt?: boolean;
    smsOnly?: boolean;
  };
  footer?: {
    autoFooter?: boolean;
    footerLine1?: string;
    footerLine2?: string;
    footerLine3?: string;
    footerLine4?: string;
    showBranchInfo?: boolean;
    showDateTime?: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BettingPoolUser {
  userId: number;
  username: string;
  email?: string;
}

const API_ENDPOINT = '/betting-pools';

/**
 * Listar betting pools con filtros y paginación
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.pageSize - Tamaño de página (default: 20)
 * @param {string} params.search - Búsqueda por nombre o código
 * @param {number} params.zoneId - Filtrar por zona
 * @param {boolean} params.isActive - Filtrar por estado activo/inactivo
 * @returns {Promise<Object>} Respuesta con datos y paginación
 */
export const getBettingPools = async (params: BettingPoolListParams = {}): Promise<BettingPoolListResponse | null> => {
  try {
    const queryParams = new URLSearchParams();

    // Add parameters si existen
    if (params.page) queryParams.append('page', String(params.page));
    if (params.pageSize) queryParams.append('pageSize', String(params.pageSize));
    if (params.search) queryParams.append('search', params.search);
    if (params.zoneId) queryParams.append('zoneId', String(params.zoneId));
    if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINT}?${queryString}` : API_ENDPOINT;

    const data = await api.get<BettingPoolListResponse>(endpoint);
    return data;
  } catch (error) {
    console.error('Error en getBettingPools:', error);
    throw error;
  }
};

/**
 * Obtener betting pool por ID
 * @param {number} bettingPoolId - ID del betting pool
 * @returns {Promise<Object>} Datos del betting pool envueltos en { success, data }
 */
export const getBettingPoolById = async (bettingPoolId: number | string): Promise<ApiResponse<BettingPool>> => {
  try {
    const data = await api.get<BettingPool>(`${API_ENDPOINT}/${bettingPoolId}`);
    return {
      success: true,
      data: data as BettingPool
    };
  } catch (error) {
    console.error('Error en getBettingPoolById:', error);
    throw error;
  }
};

/**
 * Obtener el próximo código de betting pool disponible
 * @returns {Promise<Object>} Objeto con nextCode
 */
export const getNextBettingPoolCode = async (): Promise<{ nextCode: string } | null> => {
  try {
    const data = await api.get<{ nextCode: string }>(`${API_ENDPOINT}/next-code`);
    return data;
  } catch (error) {
    console.error('Error en getNextBettingPoolCode:', error);
    throw error;
  }
};

/**
 * Crear nuevo betting pool
 * @param {Object} bettingPoolData - Datos del betting pool
 * @param {string} bettingPoolData.bettingPoolName - Nombre del betting pool (1-100 chars)
 * @param {string} bettingPoolData.branchCode - Código único (1-20 chars)
 * @param {number} bettingPoolData.zoneId - ID de la zona
 * @param {string} [bettingPoolData.location] - Ubicación física (max 255 chars)
 * @param {string} [bettingPoolData.reference] - Referencia adicional (max 255 chars)
 * @param {string} [bettingPoolData.comment] - Comentarios
 * @param {number} [bettingPoolData.userId] - ID del usuario asignado
 * @param {string} [bettingPoolData.password] - Contraseña del usuario (6-100 chars)
 * @returns {Promise<Object>} Betting pool creado
 */
export const createBettingPool = async (bettingPoolData: BettingPoolCreateData): Promise<ApiResponse<BettingPool>> => {
  try {
    const data = await api.post<BettingPool>(API_ENDPOINT, bettingPoolData);
    return {
      success: true,
      data: data as BettingPool
    };
  } catch (error) {
    console.error('Error en createBettingPool:', error);
    throw error;
  }
};

/**
 * Actualizar betting pool existente
 * @param {number} bettingPoolId - ID del betting pool
 * @param {Object} updateData - Datos a actualizar
 * @param {string} [updateData.bettingPoolName] - Nombre del betting pool
 * @param {string} [updateData.location] - Ubicación física
 * @param {string} [updateData.reference] - Referencia adicional
 * @param {string} [updateData.comment] - Comentarios
 * @returns {Promise<Object>} Betting pool actualizado
 */
export const updateBettingPool = async (bettingPoolId: number | string, updateData: BettingPoolUpdateData): Promise<ApiResponse<BettingPool>> => {
  try {
    const data = await api.put<BettingPool>(`${API_ENDPOINT}/${bettingPoolId}`, updateData);
    return {
      success: true,
      data: data as BettingPool
    };
  } catch (error) {
    console.error('Error en updateBettingPool:', error);
    throw error;
  }
};

/**
 * Get betting pool configuration (Config, Print, Discount, Footer)
 * @param {number} bettingPoolId - ID del betting pool
 * @returns {Promise<Object>} Configuration data
 */
export const getBettingPoolConfig = async (bettingPoolId: number | string): Promise<ApiResponse<BettingPoolConfigData>> => {
  try {
    const data = await api.get<BettingPoolConfigData>(`${API_ENDPOINT}/${bettingPoolId}/config`);
    return {
      success: true,
      data: data as BettingPoolConfigData
    };
  } catch (error) {
    console.error('Error en getBettingPoolConfig:', error);
    throw error;
  }
};

/**
 * Update betting pool configuration (Config, Print, Discount, Footer)
 * @param {number} bettingPoolId - ID del betting pool
 * @param {Object} configData - Configuration data
 * @param {Object} configData.config - Main configuration
 * @param {Object} configData.printConfig - Print configuration
 * @param {Object} configData.discountConfig - Discount configuration
 * @param {Object} configData.footer - Footer configuration
 * @returns {Promise<Object>} Updated configuration
 */
export const updateBettingPoolConfig = async (bettingPoolId: number | string, configData: BettingPoolConfigData): Promise<ApiResponse<BettingPoolConfigData>> => {
  try {
    const data = await api.post<BettingPoolConfigData>(`${API_ENDPOINT}/${bettingPoolId}/config`, configData);
    return {
      success: true,
      data: data as BettingPoolConfigData
    };
  } catch (error) {
    console.error('Error en updateBettingPoolConfig:', error);
    throw error;
  }
};

/**
 * Eliminar betting pool
 * @param {number} bettingPoolId - ID del betting pool
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteBettingPool = async (bettingPoolId: number | string): Promise<{ success: boolean; message?: string } | null> => {
  try {
    await api.delete(`${API_ENDPOINT}/${bettingPoolId}`);
    return { success: true };
  } catch (error) {
    console.error('Error en deleteBettingPool:', error);
    throw error;
  }
};

/**
 * Obtener usuarios de un betting pool
 * @param {number} bettingPoolId - ID del betting pool
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getBettingPoolUsers = async (bettingPoolId: number | string): Promise<BettingPoolUser[] | null> => {
  try {
    const data = await api.get<BettingPoolUser[]>(`${API_ENDPOINT}/${bettingPoolId}/users`);
    return data;
  } catch (error) {
    console.error('Error en getBettingPoolUsers:', error);
    throw error;
  }
};

/**
 * Manejar errores de API de forma consistente
 * @param {Error} error - Error capturado
 * @param {string} operation - Operación que falló
 * @returns {string} Mensaje de error amigable
 */
export const handleBettingPoolError = (error: unknown, operation: string = 'operation'): string => {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  
  // Mapear errores comunes a mensajes más amigables
  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }
  
  if (errorMessage.includes('409') || errorMessage.includes('duplicado')) {
    return 'El código del betting pool ya existe. Usa un código diferente.';
  }

  if (errorMessage.includes('404') || errorMessage.includes('no encontrado')) {
    return 'El betting pool no existe o ha sido eliminado.';
  }
  
  if (errorMessage.includes('400') || errorMessage.includes('validation')) {
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
  getBettingPools,
  getBettingPoolById,
  getBettingPoolConfig,
  getNextBettingPoolCode,
  createBettingPool,
  updateBettingPool,
  updateBettingPoolConfig,
  deleteBettingPool,
  getBettingPoolUsers,
  handleBettingPoolError
};