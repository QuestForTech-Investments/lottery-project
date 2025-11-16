/**
 * Lottery Service - Manejo de operaciones de loterías
 * Basado en la documentación API
 */

import api from './api';

/**
 * Listar loterías con filtros opcionales
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.countryId - Filtrar por país
 * @param {string} params.type - Filtrar por tipo de lotería
 * @param {boolean} params.isActive - Filtrar por estado activo/inactivo
 * @returns {Promise<Object>} Respuesta con datos de loterías
 */
export const getLotteries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Agregar parámetros si existen
    if (params.countryId) queryParams.append('countryId', params.countryId);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    // Si se solicita cargar TODAS las loterías, usar un pageSize muy grande
    if (params.loadAll) {
      queryParams.append('pageSize', '200');
    }

    const endpoint = queryParams.toString()
      ? `/lotteries?${queryParams}`
      : '/lotteries';

    const data = await api.get(endpoint);
    return data;
  } catch (error) {
    console.error('Error en getLotteries:', error);
    throw error;
  }
};

/**
 * Obtener lotería por ID
 * @param {number} lotteryId - ID de la lotería
 * @returns {Promise<Object>} Datos de la lotería
 */
export const getLotteryById = async (lotteryId) => {
  try {
    const data = await api.get(`/lotteries/${lotteryId}`);
    return data;
  } catch (error) {
    console.error('Error en getLotteryById:', error);
    if (error.response?.status === 404) {
      throw new Error('Lotería no encontrada');
    }
    throw error;
  }
};

/**
 * Obtener sorteos de una lotería
 * @param {number} lotteryId - ID de la lotería
 * @returns {Promise<Array>} Lista de sorteos
 */
export const getLotteryDraws = async (lotteryId) => {
  try {
    const data = await api.get(`/lotteries/${lotteryId}/draws`);
    return data;
  } catch (error) {
    console.error('Error en getLotteryDraws:', error);
    if (error.response?.status === 404) {
      throw new Error('Lotería no encontrada');
    }
    throw error;
  }
};

/**
 * Obtener tipos de apuesta (bet types) disponibles para una lotería específica
 * Retorna solo los tipos de apuesta compatibles con la lotería seleccionada
 * @param {number} lotteryId - ID de la lotería
 * @returns {Promise<Array>} Lista de bet types con sus prize fields
 */
export const getBetTypesByLottery = async (lotteryId) => {
  try {
    const data = await api.get(`/lotteries/${lotteryId}/bet-types`);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en getBetTypesByLottery:', error);
    if (error.response?.status === 404) {
      throw new Error('Lotería no encontrada o sin tipos de apuesta configurados');
    }
    throw error;
  }
};

/**
 * Obtener TODAS las loterías activas (útil para cargar dropdowns)
 * @param {Object} params - Parámetros de búsqueda
 * @returns {Promise<Object>} Respuesta con datos de loterías
 */
export const getAllLotteries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Por defecto, cargar todas las activas
    if (params.isActive !== false) {
      queryParams.append('isActive', 'true');
    }

    // Cargar todas (pageSize grande)
    if (params.loadAll) {
      queryParams.append('pageSize', '200');
    }

    const endpoint = queryParams.toString()
      ? `/lotteries?${queryParams}`
      : '/lotteries';

    const data = await api.get(endpoint);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en getAllLotteries:', error);
    throw error;
  }
};

/**
 * Manejar errores de API de forma consistente
 * @param {Error} error - Error capturado
 * @param {string} operation - Operación que falló
 * @returns {string} Mensaje de error amigable
 */
export const handleLotteryError = (error, operation = 'operación') => {
  const errorMessage = error.message || 'Error desconocido';

  // Mapear errores comunes a mensajes más amigables
  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }

  if (errorMessage.includes('404') || errorMessage.includes('no encontrada')) {
    return 'La lotería no existe o ha sido eliminada.';
  }

  if (errorMessage.includes('400') || errorMessage.includes('validación')) {
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
  getLotteries,
  getLotteryById,
  getLotteryDraws,
  getBetTypesByLottery,
  getAllLotteries,
  handleLotteryError
};
