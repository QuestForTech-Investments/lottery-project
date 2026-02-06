/**
 * Hot Number Service
 * Handles API operations for hot numbers configuration (Numeros Calientes)
 */

import { api } from './api';
import type {
  HotNumbersConfig,
  HotNumberLimit,
  HotNumberItem
} from '../types/limits';

const BASE_URL = '/hot-numbers';

export const hotNumberService = {
  /**
   * Get list of selected hot numbers
   * @returns Promise with hot numbers configuration
   */
  async getHotNumbers(): Promise<HotNumbersConfig> {
    try {
      const response = await api.get<HotNumbersConfig>(BASE_URL);
      return response || { selectedNumbers: [] };
    } catch (error) {
      console.error('Error in getHotNumbers:', error);
      throw error;
    }
  },

  /**
   * Get hot numbers as array of items with selection state
   * @returns Promise with array of hot number items (0-99)
   */
  async getHotNumberItems(): Promise<HotNumberItem[]> {
    try {
      const config = await this.getHotNumbers();
      const selectedSet = new Set(config.selectedNumbers);

      // Generate all numbers 0-99 with selection state
      return Array.from({ length: 100 }, (_, i) => ({
        number: i,
        isSelected: selectedSet.has(i)
      }));
    } catch (error) {
      console.error('Error in getHotNumberItems:', error);
      throw error;
    }
  },

  /**
   * Update the list of selected hot numbers
   * @param numbers - Array of selected number values (0-99)
   */
  async updateHotNumbers(numbers: number[]): Promise<void> {
    try {
      // Validate numbers are in valid range
      const validNumbers = numbers.filter(n => n >= 0 && n <= 99);
      await api.put(BASE_URL, { selectedNumbers: validNumbers });
    } catch (error) {
      console.error('Error in updateHotNumbers:', error);
      throw error;
    }
  },

  /**
   * Add a number to hot numbers list
   * @param number - Number to add (0-99)
   */
  async addHotNumber(number: number): Promise<void> {
    try {
      if (number < 0 || number > 99) {
        throw new Error('Number must be between 0 and 99');
      }

      const config = await this.getHotNumbers();
      if (!config.selectedNumbers.includes(number)) {
        await this.updateHotNumbers([...config.selectedNumbers, number]);
      }
    } catch (error) {
      console.error('Error in addHotNumber:', error);
      throw error;
    }
  },

  /**
   * Remove a number from hot numbers list
   * @param number - Number to remove (0-99)
   */
  async removeHotNumber(number: number): Promise<void> {
    try {
      const config = await this.getHotNumbers();
      await this.updateHotNumbers(config.selectedNumbers.filter(n => n !== number));
    } catch (error) {
      console.error('Error in removeHotNumber:', error);
      throw error;
    }
  },

  /**
   * Toggle a number's hot status
   * @param number - Number to toggle (0-99)
   * @returns Promise with new selection state
   */
  async toggleHotNumber(number: number): Promise<boolean> {
    try {
      const config = await this.getHotNumbers();
      const isCurrentlySelected = config.selectedNumbers.includes(number);

      if (isCurrentlySelected) {
        await this.updateHotNumbers(config.selectedNumbers.filter(n => n !== number));
      } else {
        await this.updateHotNumbers([...config.selectedNumbers, number]);
      }

      return !isCurrentlySelected;
    } catch (error) {
      console.error('Error in toggleHotNumber:', error);
      throw error;
    }
  },

  /**
   * Clear all hot numbers selection
   */
  async clearHotNumbers(): Promise<void> {
    try {
      await this.updateHotNumbers([]);
    } catch (error) {
      console.error('Error in clearHotNumbers:', error);
      throw error;
    }
  },

  /**
   * Get all hot number limits
   * @returns Promise with array of hot number limits
   */
  async getHotNumberLimits(): Promise<HotNumberLimit[]> {
    try {
      const response = await api.get<HotNumberLimit[]>(`${BASE_URL}/limits`);
      return response || [];
    } catch (error) {
      console.error('Error in getHotNumberLimits:', error);
      throw error;
    }
  },

  /**
   * Get a single hot number limit by ID
   * @param id - Hot number limit ID
   * @returns Promise with hot number limit
   */
  async getHotNumberLimitById(id: number): Promise<HotNumberLimit> {
    try {
      const response = await api.get<HotNumberLimit>(`${BASE_URL}/limits/${id}`);
      if (!response) {
        throw new Error(`Hot number limit with ID ${id} not found`);
      }
      return response;
    } catch (error) {
      console.error('Error in getHotNumberLimitById:', error);
      throw error;
    }
  },

  /**
   * Create a new hot number limit
   * @param limit - Hot number limit data
   * @returns Promise with created limit
   */
  async createHotNumberLimit(limit: Omit<HotNumberLimit, 'id'>): Promise<HotNumberLimit> {
    try {
      const response = await api.post<HotNumberLimit>(`${BASE_URL}/limits`, limit);
      if (!response) {
        throw new Error('Failed to create hot number limit');
      }
      return response;
    } catch (error) {
      console.error('Error in createHotNumberLimit:', error);
      throw error;
    }
  },

  /**
   * Update an existing hot number limit
   * @param id - Hot number limit ID
   * @param limit - Updated limit data
   * @returns Promise with updated limit
   */
  async updateHotNumberLimit(id: number, limit: Partial<HotNumberLimit>): Promise<HotNumberLimit> {
    try {
      const response = await api.put<HotNumberLimit>(`${BASE_URL}/limits/${id}`, limit);
      if (!response) {
        throw new Error(`Failed to update hot number limit ${id}`);
      }
      return response;
    } catch (error) {
      console.error('Error in updateHotNumberLimit:', error);
      throw error;
    }
  },

  /**
   * Create or update a hot number limit
   * @param limit - Hot number limit data
   * @returns Promise with created/updated limit
   */
  async saveHotNumberLimit(limit: HotNumberLimit): Promise<HotNumberLimit> {
    try {
      if (limit.id) {
        return await this.updateHotNumberLimit(limit.id, limit);
      }
      return await this.createHotNumberLimit(limit);
    } catch (error) {
      console.error('Error in saveHotNumberLimit:', error);
      throw error;
    }
  },

  /**
   * Delete a hot number limit
   * @param id - Hot number limit ID
   */
  async deleteHotNumberLimit(id: number): Promise<void> {
    try {
      await api.delete(`${BASE_URL}/limits/${id}`);
    } catch (error) {
      console.error('Error in deleteHotNumberLimit:', error);
      throw error;
    }
  },

  /**
   * Delete all hot number limits
   */
  async deleteAllHotNumberLimits(): Promise<void> {
    try {
      await api.delete(`${BASE_URL}/limits`);
    } catch (error) {
      console.error('Error in deleteAllHotNumberLimits:', error);
      throw error;
    }
  },

  /**
   * Get hot number limits for specific draws
   * @param drawIds - Array of draw IDs
   * @returns Promise with filtered hot number limits
   */
  async getHotNumberLimitsByDraws(drawIds: number[]): Promise<HotNumberLimit[]> {
    try {
      const params = new URLSearchParams();
      drawIds.forEach(id => params.append('drawIds', id.toString()));

      const response = await api.get<HotNumberLimit[]>(
        `${BASE_URL}/limits?${params.toString()}`
      );
      return response || [];
    } catch (error) {
      console.error('Error in getHotNumberLimitsByDraws:', error);
      throw error;
    }
  },

  /**
   * Check if a number is marked as hot
   * @param number - Number to check (0-99)
   * @returns Promise with boolean indicating if number is hot
   */
  async isNumberHot(number: number): Promise<boolean> {
    try {
      const config = await this.getHotNumbers();
      return config.selectedNumbers.includes(number);
    } catch (error) {
      console.error('Error in isNumberHot:', error);
      return false;
    }
  },

  /**
   * Get count of selected hot numbers
   * @returns Promise with count of selected hot numbers
   */
  async getHotNumberCount(): Promise<number> {
    try {
      const config = await this.getHotNumbers();
      return config.selectedNumbers.length;
    } catch (error) {
      console.error('Error in getHotNumberCount:', error);
      return 0;
    }
  }
};

/**
 * Handle hot number service errors
 * @param error - Error caught
 * @param operation - Operation that failed
 * @returns User-friendly error message in Spanish
 */
export const handleHotNumberError = (
  error: unknown,
  operation: string = 'operacion'
): string => {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexion. Verifica tu internet e intenta nuevamente.';
  }

  if (errorMessage.includes('409') || errorMessage.includes('duplicate')) {
    return 'Ya existe una configuracion de limite para estos sorteos.';
  }

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'La configuracion no existe o ha sido eliminada.';
  }

  if (errorMessage.includes('400') || errorMessage.includes('validation')) {
    return 'Datos invalidos. Verifica los valores ingresados.';
  }

  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'No tienes permisos para modificar numeros calientes.';
  }

  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'Sesion expirada. Inicia sesion nuevamente.';
  }

  return `Error en ${operation}: ${errorMessage}`;
};

export default hotNumberService;
