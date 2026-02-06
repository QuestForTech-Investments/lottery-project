/**
 * Automatic Limit Service
 * Handles API operations for automatic limits configuration
 */

import { api } from './api';
import type {
  AutomaticLimitConfig,
  RandomBlockConfig,
  defaultAutomaticLimitConfig
} from '../types/limits';

const BASE_URL = '/automatic-limits';

export const automaticLimitService = {
  /**
   * Get current automatic limits configuration
   * @returns Promise with automatic limit config
   */
  async getConfig(): Promise<AutomaticLimitConfig> {
    try {
      const response = await api.get<AutomaticLimitConfig>(BASE_URL);

      // Return default config if response is null/undefined
      if (!response) {
        return {
          generalNumberControls: {
            enableDirecto: false,
            montoDirecto: 0,
            enablePale: false,
            montoPale: 0,
            enableSuperPale: false,
            montoSuperPale: 0
          },
          lineControls: {
            enableDirecto: false,
            montoDirecto: 0,
            enablePale: false,
            montoPale: 0,
            enableSuperPale: false,
            montoSuperPale: 0
          }
        };
      }

      return response;
    } catch (error) {
      console.error('Error in getConfig:', error);
      throw error;
    }
  },

  /**
   * Get general number controls configuration
   * @returns Promise with general number controls
   */
  async getGeneralNumberControls(): Promise<AutomaticLimitConfig['generalNumberControls']> {
    try {
      const config = await this.getConfig();
      return config.generalNumberControls;
    } catch (error) {
      console.error('Error in getGeneralNumberControls:', error);
      throw error;
    }
  },

  /**
   * Get line controls configuration
   * @returns Promise with line controls
   */
  async getLineControls(): Promise<AutomaticLimitConfig['lineControls']> {
    try {
      const config = await this.getConfig();
      return config.lineControls;
    } catch (error) {
      console.error('Error in getLineControls:', error);
      throw error;
    }
  },

  /**
   * Save complete automatic limits configuration
   * @param config - Full configuration to save
   */
  async saveConfig(config: AutomaticLimitConfig): Promise<void> {
    try {
      await api.put(`${BASE_URL}`, config);
    } catch (error) {
      console.error('Error in saveConfig:', error);
      throw error;
    }
  },

  /**
   * Save general number controls configuration
   * @param config - General number controls configuration
   */
  async saveGeneralConfig(config: AutomaticLimitConfig): Promise<void> {
    try {
      await api.put(`${BASE_URL}/general`, config);
    } catch (error) {
      console.error('Error in saveGeneralConfig:', error);
      throw error;
    }
  },

  /**
   * Update general number controls only
   * @param controls - General number controls to update
   */
  async updateGeneralNumberControls(
    controls: AutomaticLimitConfig['generalNumberControls']
  ): Promise<void> {
    try {
      await api.put(`${BASE_URL}/general-number-controls`, controls);
    } catch (error) {
      console.error('Error in updateGeneralNumberControls:', error);
      throw error;
    }
  },

  /**
   * Update line controls only
   * @param controls - Line controls to update
   */
  async updateLineControls(
    controls: AutomaticLimitConfig['lineControls']
  ): Promise<void> {
    try {
      await api.put(`${BASE_URL}/line-controls`, controls);
    } catch (error) {
      console.error('Error in updateLineControls:', error);
      throw error;
    }
  },

  /**
   * Get random block configuration
   * @returns Promise with random block config
   */
  async getRandomBlockConfig(): Promise<RandomBlockConfig> {
    try {
      const response = await api.get<RandomBlockConfig>(`${BASE_URL}/random-block`);
      return response || {
        drawIds: [],
        palesToBlock: 0
      };
    } catch (error) {
      console.error('Error in getRandomBlockConfig:', error);
      throw error;
    }
  },

  /**
   * Save random block configuration
   * @param config - Random block configuration
   */
  async saveRandomBlock(config: RandomBlockConfig): Promise<void> {
    try {
      await api.put(`${BASE_URL}/random-block`, config);
    } catch (error) {
      console.error('Error in saveRandomBlock:', error);
      throw error;
    }
  },

  /**
   * Execute random block action
   * Triggers the random blocking of pales based on configuration
   * @param config - Random block configuration to execute
   * @returns Promise with result of blocking action
   */
  async executeRandomBlock(config: RandomBlockConfig): Promise<{ blockedCount: number }> {
    try {
      const response = await api.post<{ blockedCount: number }>(
        `${BASE_URL}/random-block/execute`,
        config
      );
      return response || { blockedCount: 0 };
    } catch (error) {
      console.error('Error in executeRandomBlock:', error);
      throw error;
    }
  },

  /**
   * Reset automatic limits to default values
   */
  async resetToDefaults(): Promise<void> {
    try {
      await api.post(`${BASE_URL}/reset`);
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
      throw error;
    }
  },

  /**
   * Check if automatic limits are enabled
   * @returns Promise with boolean indicating if any automatic limit is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return (
        config.generalNumberControls.enableDirecto ||
        config.generalNumberControls.enablePale ||
        config.generalNumberControls.enableSuperPale ||
        config.lineControls.enableDirecto ||
        config.lineControls.enablePale ||
        config.lineControls.enableSuperPale
      );
    } catch (error) {
      console.error('Error in isEnabled:', error);
      return false;
    }
  }
};

/**
 * Handle automatic limit service errors
 * @param error - Error caught
 * @param operation - Operation that failed
 * @returns User-friendly error message in Spanish
 */
export const handleAutomaticLimitError = (
  error: unknown,
  operation: string = 'operacion'
): string => {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexion. Verifica tu internet e intenta nuevamente.';
  }

  if (errorMessage.includes('400') || errorMessage.includes('validation')) {
    return 'Configuracion invalida. Verifica los valores ingresados.';
  }

  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'No tienes permisos para modificar la configuracion de limites automaticos.';
  }

  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'Sesion expirada. Inicia sesion nuevamente.';
  }

  return `Error en ${operation}: ${errorMessage}`;
};

export default automaticLimitService;
