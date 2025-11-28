/**
 * Branch Service - Alias para Betting Pool Service
 * Este archivo actúa como adaptador para mantener compatibilidad con código existente
 * que usa los nombres "branch" en lugar de "bettingPool"
 */

import {
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
} from './bettingPoolService';

/**
 * Listar bancas con filtros y paginación
 * @param {Object} params - Parámetros de búsqueda
 * @returns {Promise<Object>} Respuesta con datos y paginación
 */
export const getBranches = getBettingPools;

/**
 * Obtener banca por ID
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Object>} Datos de la banca envueltos en { success, data }
 */
export const getBranchById = getBettingPoolById;

/**
 * Obtener banca con su configuración completa
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Object>} Banca con config, discountConfig y printConfig
 */
export const getBranchWithConfig = getBettingPoolConfig;

/**
 * Obtener el próximo código de banca disponible
 * @returns {Promise<Object>} Objeto con nextCode
 */
export const getNextBranchCode = getNextBettingPoolCode;

/**
 * Crear nueva banca
 * @param {Object} branchData - Datos de la banca
 * @returns {Promise<Object>} Banca creada
 */
export const createBranch = createBettingPool;

/**
 * Actualizar banca existente
 * @param {number} branchId - ID de la banca
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Banca actualizada
 */
export const updateBranch = updateBettingPool;

/**
 * Actualizar configuración de una banca existente
 * @param {number} branchId - ID de la banca
 * @param {Object} config - Configuración principal
 * @param {Object} discountConfig - Configuración de descuentos
 * @param {Object} printConfig - Configuración de impresión
 * @param {Object} footer - Configuración de pie de página
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateBranchConfig = (branchId, config, discountConfig, printConfig, footer) => {
  // Construir el objeto de configuración en el formato esperado por la API
  const configData = {
    config,
    discountConfig,
    printConfig,
    footer
  };

  return updateBettingPoolConfig(branchId, configData);
};

/**
 * Eliminar banca
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteBranch = deleteBettingPool;

/**
 * Obtener usuarios de una banca
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getBranchUsers = getBettingPoolUsers;

/**
 * Manejar errores de API de forma consistente
 * @param {Error} error - Error capturado
 * @param {string} operation - Operación que falló
 * @returns {string} Mensaje de error amigable
 */
export const handleBranchError = handleBettingPoolError;

export default {
  getBranches,
  getBranchById,
  getBranchWithConfig,
  getNextBranchCode,
  createBranch,
  updateBranch,
  updateBranchConfig,
  deleteBranch,
  getBranchUsers,
  handleBranchError
};
