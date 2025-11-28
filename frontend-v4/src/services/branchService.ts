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
  type BettingPoolConfigData
} from './bettingPoolService';

// Re-export types
export type {
  BettingPoolListParams,
  BettingPool,
  BettingPoolCreateData,
  BettingPoolUpdateData,
  BettingPoolConfigData
} from './bettingPoolService';

/**
 * Listar bancas con filtros y paginación
 */
export const getBranches = getBettingPools;

/**
 * Obtener banca por ID
 */
export const getBranchById = getBettingPoolById;

/**
 * Obtener banca con su configuration completa
 */
export const getBranchWithConfig = getBettingPoolConfig;

/**
 * Obtener el próximo código de banca disponible
 */
export const getNextBranchCode = getNextBettingPoolCode;

/**
 * Crear nueva banca
 */
export const createBranch = createBettingPool;

/**
 * Actualizar banca existente
 */
export const updateBranch = updateBettingPool;

/**
 * Actualizar configuration de una banca existente
 */
export const updateBranchConfig = (
  branchId: number | string,
  config: BettingPoolConfigData['config'],
  discountConfig: BettingPoolConfigData['discountConfig'],
  printConfig: BettingPoolConfigData['printConfig'],
  footer: BettingPoolConfigData['footer']
): ReturnType<typeof updateBettingPoolConfig> => {
  // Construir el objeto de configuration en el formato esperado por la API
  const configData: BettingPoolConfigData = {
    config,
    discountConfig,
    printConfig,
    footer
  };

  return updateBettingPoolConfig(branchId, configData);
};

/**
 * Eliminar banca
 */
export const deleteBranch = deleteBettingPool;

/**
 * Obtener usuarios de una banca
 */
export const getBranchUsers = getBettingPoolUsers;

/**
 * Manejar errores de API de forma consistente
 */
export const handleBranchError = (error: unknown, operation: string): string => {
  const err = error as Error;
  console.error(`Error in ${operation}:`, err);
  return err.message || `Error en operación: ${operation}`;
};

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
