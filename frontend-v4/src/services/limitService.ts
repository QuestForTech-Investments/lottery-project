/**
 * Limit Service
 * Handles all API operations for limit rules (Limites)
 */

import { api } from './api';
import type {
  LimitRule,
  CreateLimitRequest,
  UpdateLimitRequest,
  LimitFilter,
  LimitParams,
  LimitsListResponse,
  BatchDeleteResponse,
  LimitType
} from '../types/limits';

const BASE_URL = '/limits';

/**
 * Build query string from filter object
 */
const buildFilterQueryString = (filter?: LimitFilter): string => {
  if (!filter) return '';

  const params = new URLSearchParams();

  if (filter.limitTypes?.length) {
    filter.limitTypes.forEach(t => params.append('limitTypes', t.toString()));
  }
  if (filter.drawIds?.length) {
    filter.drawIds.forEach(d => params.append('drawIds', d.toString()));
  }
  if (filter.daysOfWeek?.length) {
    filter.daysOfWeek.forEach(d => params.append('daysOfWeek', d.toString()));
  }
  if (filter.bettingPoolId) {
    params.append('bettingPoolId', filter.bettingPoolId.toString());
  }
  if (filter.zoneId) {
    params.append('zoneId', filter.zoneId.toString());
  }
  if (filter.groupId) {
    params.append('groupId', filter.groupId.toString());
  }
  if (filter.isActive !== undefined) {
    params.append('isActive', filter.isActive.toString());
  }
  if (filter.search) {
    params.append('search', filter.search);
  }

  return params.toString();
};

export const limitService = {
  /**
   * Get list of limits with optional filters
   * @param filter - Optional filter criteria
   * @returns Promise with array of limit rules
   */
  async getLimits(filter?: LimitFilter): Promise<LimitRule[]> {
    try {
      const queryString = buildFilterQueryString(filter);
      const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

      const response = await api.get<LimitRule[] | LimitsListResponse>(url);

      // Handle both array and paginated response
      if (response && Array.isArray(response)) {
        return response;
      }
      if (response && 'items' in response) {
        return response.items;
      }

      return [];
    } catch (error) {
      console.error('Error in getLimits:', error);
      throw error;
    }
  },

  /**
   * Get paginated list of limits
   * @param filter - Optional filter criteria
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @returns Promise with paginated response
   */
  async getLimitsPaginated(
    filter?: LimitFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<LimitsListResponse> {
    try {
      const queryString = buildFilterQueryString(filter);
      const paginationParams = `page=${page}&pageSize=${pageSize}`;
      const fullQuery = queryString
        ? `${queryString}&${paginationParams}`
        : paginationParams;

      const url = `${BASE_URL}?${fullQuery}`;
      const response = await api.get<LimitsListResponse>(url);

      // Handle array response (convert to paginated format)
      if (response && Array.isArray(response)) {
        return {
          items: response,
          totalCount: response.length,
          page: 1,
          pageSize: response.length,
          totalPages: 1
        };
      }

      return response || {
        items: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0
      };
    } catch (error) {
      console.error('Error in getLimitsPaginated:', error);
      throw error;
    }
  },

  /**
   * Get a single limit by ID
   * @param id - Limit rule ID
   * @returns Promise with limit rule
   */
  async getLimitById(id: number): Promise<LimitRule> {
    try {
      const response = await api.get<LimitRule>(`${BASE_URL}/${id}`);
      if (!response) {
        throw new Error(`Limit with ID ${id} not found`);
      }
      return response;
    } catch (error) {
      console.error('Error in getLimitById:', error);
      throw error;
    }
  },

  /**
   * Get limits by type
   * @param limitType - Type of limit to filter by
   * @returns Promise with array of limit rules
   */
  async getLimitsByType(limitType: LimitType): Promise<LimitRule[]> {
    return this.getLimits({ limitTypes: [limitType] });
  },

  /**
   * Get limits for a specific betting pool
   * @param bettingPoolId - Betting pool ID
   * @returns Promise with array of limit rules
   */
  async getLimitsByBettingPool(bettingPoolId: number): Promise<LimitRule[]> {
    return this.getLimits({ bettingPoolId });
  },

  /**
   * Get limits for a specific zone
   * @param zoneId - Zone ID
   * @returns Promise with array of limit rules
   */
  async getLimitsByZone(zoneId: number): Promise<LimitRule[]> {
    return this.getLimits({ zoneId });
  },

  /**
   * Create a new limit rule
   * @param data - Limit creation data
   * @returns Promise with created limit rule
   */
  async createLimit(data: CreateLimitRequest): Promise<LimitRule> {
    try {
      const response = await api.post<LimitRule>(BASE_URL, data);
      if (!response) {
        throw new Error('Failed to create limit');
      }
      return response;
    } catch (error) {
      console.error('Error in createLimit:', error);
      throw error;
    }
  },

  /**
   * Create multiple limits at once
   * @param limits - Array of limit creation data
   * @returns Promise with array of created limit rules
   */
  async createLimitsBatch(limits: CreateLimitRequest[]): Promise<LimitRule[]> {
    try {
      const response = await api.post<LimitRule[]>(`${BASE_URL}/batch`, { limits });
      return response || [];
    } catch (error) {
      console.error('Error in createLimitsBatch:', error);
      throw error;
    }
  },

  /**
   * Update an existing limit rule
   * @param id - Limit rule ID
   * @param data - Updated limit data
   * @returns Promise with updated limit rule
   */
  async updateLimit(id: number, data: UpdateLimitRequest): Promise<LimitRule> {
    try {
      const response = await api.put<LimitRule>(`${BASE_URL}/${id}`, data);
      if (!response) {
        throw new Error(`Failed to update limit ${id}`);
      }
      return response;
    } catch (error) {
      console.error('Error in updateLimit:', error);
      throw error;
    }
  },

  /**
   * Delete a single limit rule
   * @param id - Limit rule ID
   */
  async deleteLimit(id: number): Promise<void> {
    try {
      await api.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error in deleteLimit:', error);
      throw error;
    }
  },

  /**
   * Delete multiple limits matching filter criteria
   * @param filter - Filter criteria for deletion
   * @returns Promise with count of deleted items
   */
  async deleteLimitsBatch(filter: LimitFilter): Promise<BatchDeleteResponse> {
    try {
      // Build query string for delete
      const queryString = buildFilterQueryString(filter);
      const url = queryString ? `${BASE_URL}/batch?${queryString}` : `${BASE_URL}/batch`;

      const response = await api.delete<BatchDeleteResponse>(url);
      return response || { deletedCount: 0 };
    } catch (error) {
      console.error('Error in deleteLimitsBatch:', error);
      throw error;
    }
  },

  /**
   * Delete limits by IDs
   * @param ids - Array of limit rule IDs to delete
   * @returns Promise with count of deleted items
   */
  async deleteLimitsByIds(ids: number[]): Promise<BatchDeleteResponse> {
    try {
      const response = await api.delete<BatchDeleteResponse>(`${BASE_URL}/batch`, {
        body: JSON.stringify({ ids })
      });
      return response || { deletedCount: 0 };
    } catch (error) {
      console.error('Error in deleteLimitsByIds:', error);
      throw error;
    }
  },

  /**
   * Toggle limit active status
   * @param id - Limit rule ID
   * @param isActive - New active status
   * @returns Promise with updated limit rule
   */
  async toggleLimitStatus(id: number, isActive: boolean): Promise<LimitRule> {
    try {
      const response = await api.patch<LimitRule>(`${BASE_URL}/${id}/status`, { isActive });
      if (!response) {
        throw new Error(`Failed to toggle limit ${id} status`);
      }
      return response;
    } catch (error) {
      console.error('Error in toggleLimitStatus:', error);
      throw error;
    }
  },

  /**
   * Get form parameters (dropdowns data)
   * @returns Promise with limit params for forms
   */
  async getLimitParams(): Promise<LimitParams> {
    try {
      const response = await api.get<LimitParams>(`${BASE_URL}/params`);
      return response || {
        limitTypes: [],
        draws: [],
        lotteries: [],
        gameTypes: [],
        bettingPools: [],
        zones: [],
        groups: [],
        daysOfWeek: []
      };
    } catch (error) {
      console.error('Error in getLimitParams:', error);
      throw error;
    }
  },

  /**
   * Check if a limit exists for given criteria
   * @param filter - Filter criteria
   * @returns Promise with boolean indicating existence
   */
  async checkLimitExists(filter: LimitFilter): Promise<boolean> {
    try {
      const limits = await this.getLimits(filter);
      return limits.length > 0;
    } catch (error) {
      console.error('Error in checkLimitExists:', error);
      return false;
    }
  }
};

/**
 * Handle limit service errors consistently
 * @param error - Error caught
 * @param operation - Operation that failed
 * @returns User-friendly error message in Spanish
 */
export const handleLimitError = (error: unknown, operation: string = 'operacion'): string => {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

  // Map common errors to friendly messages
  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexion. Verifica tu internet e intenta nuevamente.';
  }

  if (errorMessage.includes('409') || errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
    return 'Ya existe un limite con estos criterios.';
  }

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'El limite no existe o ha sido eliminado.';
  }

  if (errorMessage.includes('400') || errorMessage.includes('validation')) {
    return 'Datos invalidos. Verifica la informacion ingresada.';
  }

  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'No tienes permisos para realizar esta accion.';
  }

  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'Sesion expirada. Inicia sesion nuevamente.';
  }

  return `Error en ${operation}: ${errorMessage}`;
};

export default limitService;
