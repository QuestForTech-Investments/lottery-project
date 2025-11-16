/**
 * Branch Service - Manejo de operaciones de bancas (betting pools)
 * Basado en la documentación API V4.0
 * NOTA: Endpoints actualizados de /api/branches a /api/betting-pools
 */

import * as logger from '../utils/logger';
import { API_URL, API_ENDPOINTS, buildApiUrl } from '../config/apiConfig';

const API_BASE_URL = buildApiUrl(API_ENDPOINTS.BETTING_POOLS);

/**
 * Listar bancas con filtros y paginación
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.pageSize - Tamaño de página (default: 20)
 * @param {string} params.search - Búsqueda por nombre o código
 * @param {number} params.zoneId - Filtrar por zona
 * @param {boolean} params.isActive - Filtrar por estado activo/inactivo
 * @returns {Promise<Object>} Respuesta con datos y paginación
 */
export const getBranches = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar parámetros si existen
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    if (params.search) queryParams.append('search', params.search);
    if (params.zoneId) queryParams.append('zoneId', params.zoneId);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener bancas');
    }

    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en getBranches', { error: error.message, params });
    throw error;
  }
};

/**
 * Obtener banca por ID
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Object>} Datos de la banca
 */
export const getBranchById = async (branchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${branchId}`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      throw new Error(data.message || 'Error al obtener la banca');
    }

    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en getBranchById', { error: error.message, branchId });
    throw error;
  }
};

/**
 * Obtener el próximo código de banca disponible
 * @returns {Promise<Object>} Objeto con nextCode
 */
export const getNextBranchCode = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/next-code`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener el próximo código');
    }

    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en getNextBranchCode', { error: error.message });
    throw error;
  }
};

/**
 * Crear nueva banca
 * @param {Object} branchData - Datos de la banca
 * @param {string} branchData.branchName - Nombre de la banca (1-100 chars)
 * @param {string} branchData.branchCode - Código único (1-20 chars)
 * @param {number} branchData.zoneId - ID de la zona
 * @param {string} [branchData.location] - Ubicación física (max 255 chars)
 * @param {string} [branchData.reference] - Referencia adicional (max 255 chars)
 * @param {string} [branchData.comment] - Comentarios
 * @param {number} [branchData.userId] - ID del usuario asignado
 * @param {string} [branchData.password] - Contraseña del usuario (6-100 chars)
 * @returns {Promise<Object>} Banca creada
 */
export const createBranch = async (branchData) => {
  try {
    logger.info('BRANCH_SERVICE', 'Creando nueva banca', { branchName: branchData.branchName, branchCode: branchData.branchCode });

    // Map only the fields that the API accepts (CreateBettingPoolDto)
    const apiData = {
      bettingPoolName: branchData.branchName,
      bettingPoolCode: branchData.branchCode,
      zoneId: branchData.zoneId,
      bankId: branchData.bankId || null,
      address: branchData.address || null,
      phone: branchData.phone || null,
      location: branchData.location || null,
      reference: branchData.reference || null,
      comment: branchData.comment || null,
      username: branchData.username || null,
      password: branchData.password || null,
      isActive: branchData.isActive !== undefined ? branchData.isActive : true
    };

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData)
    });

    logger.debug('BRANCH_SERVICE', 'Respuesta de la API', {
      status: response.status,
      statusText: response.statusText
    });

    // Verificar si la respuesta tiene contenido antes de intentar parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          logger.error('BRANCH_SERVICE', 'Error parseando JSON', { parseError: parseError.message, text });
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 400) {
        // Intentar extraer errores específicos de validación
        let errorDetails = '';

        if (data) {
          // Si hay un mensaje directo, usarlo
          if (data.message) {
            errorDetails = data.message;
          }
          // Si hay errores de validación detallados (formato estándar de ASP.NET)
          else if (data.errors) {
            const errors = Object.entries(data.errors)
              .map(([field, messages]) => {
                const fieldName = field.replace(/([A-Z])/g, ' $1').trim();
                return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
              })
              .join('\n');
            errorDetails = errors || 'Error de validación';
          }
          // Si hay un título y detalles (formato ProblemDetails)
          else if (data.title || data.detail) {
            errorDetails = data.detail || data.title || 'Error de validación';
          }
          // Intentar convertir el objeto de error a string
          else if (typeof data === 'object') {
            errorDetails = JSON.stringify(data);
          }
        }

        logger.error('BRANCH_SERVICE', 'Error de validación 400', { data, errorDetails });
        throw new Error(errorDetails || 'Error de validación');
      }
      if (response.status === 409) {
        throw new Error('El código de banca ya existe');
      }
      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }
      throw new Error(data?.message || `Error del servidor (${response.status})`);
    }

    // Si no hay datos pero la respuesta es exitosa, crear una respuesta por defecto
    if (!data) {
      data = {
        success: true,
        message: 'Banca creada exitosamente',
        data: {
          branchId: Date.now(), // ID temporal
          ...branchData
        }
      };
    }

    logger.success('BRANCH_SERVICE', 'Banca creada exitosamente', { branchId: data.data?.branchId });
    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en createBranch', { error: error.message, branchData });

    // Si es un error de red, proporcionar un mensaje más específico
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que la API esté ejecutándose.');
    }

    throw error;
  }
};

/**
 * Actualizar banca existente
 * @param {number} branchId - ID de la banca
 * @param {Object} updateData - Datos a actualizar
 * @param {string} [updateData.branchName] - Nombre de la banca
 * @param {string} [updateData.location] - Ubicación física
 * @param {string} [updateData.reference] - Referencia adicional
 * @param {string} [updateData.comment] - Comentarios
 * @returns {Promise<Object>} Banca actualizada
 */
export const updateBranch = async (branchId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${branchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      if (response.status === 400) {
        throw new Error(data.message || 'Error de validación');
      }
      throw new Error(data.message || 'Error al actualizar la banca');
    }

    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en updateBranch', { error: error.message, branchId, updateData });
    throw error;
  }
};

/**
 * Eliminar banca
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteBranch = async (branchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${branchId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      if (response.status === 400) {
        throw new Error(data.message || 'No se puede eliminar la banca. Tiene usuarios asociados.');
      }
      throw new Error(data.message || 'Error al eliminar la banca');
    }

    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en deleteBranch', { error: error.message, branchId });
    throw error;
  }
};

/**
 * Obtener usuarios de una banca
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getBranchUsers = async (branchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${branchId}/users`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      throw new Error(data.message || 'Error al obtener usuarios de la banca');
    }

    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en getBranchUsers', { error: error.message, branchId });
    throw error;
  }
};

/**
 * Manejar errores de API de forma consistente
 * @param {Error} error - Error capturado
 * @param {string} operation - Operación que falló
 * @returns {string} Mensaje de error amigable
 */
export const handleBranchError = (error, operation = 'operación') => {
  const errorMessage = error.message || 'Error desconocido';
  
  // Mapear errores comunes a mensajes más amigables
  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }
  
  if (errorMessage.includes('409') || errorMessage.includes('duplicado')) {
    return 'El código de banca ya existe. Usa un código diferente.';
  }
  
  if (errorMessage.includes('404') || errorMessage.includes('no encontrada')) {
    return 'La banca no existe o ha sido eliminada.';
  }
  
  // Si el mensaje ya contiene información específica de validación (como campos separados por : o saltos de línea),
  // retornarlo directamente sin modificar
  if (errorMessage.includes(':') || errorMessage.includes('\n') || errorMessage.length > 60) {
    return errorMessage;
  }

  // Solo si es un mensaje corto y genérico de validación
  if (errorMessage.includes('400') || errorMessage === 'Error de validación') {
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

/**
 * Obtener configuración de premios y comisiones para una banca
 * @param {number} branchId - ID de la banca
 * @param {number} [lotteryId] - ID de la lotería (null para configuración general)
 * @param {string} [gameType] - Tipo de juego (Straight, Box, etc.)
 * @returns {Promise<Array>} Configuraciones de premios y comisiones
 */
export const getBranchPrizesCommissions = async (branchId, lotteryId = null, gameType = null) => {
  try {
    const queryParams = new URLSearchParams();
    if (lotteryId !== null) queryParams.append('lotteryId', lotteryId);
    if (gameType) queryParams.append('gameType', gameType);

    const url = `${API_BASE_URL}/${branchId}/prizes-commissions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      throw new Error(data.message || 'Error al obtener premios y comisiones');
    }

    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en getBranchPrizesCommissions', { error: error.message, branchId, lotteryId, gameType });
    throw error;
  }
};

/**
 * Crear nueva banca con configuración completa
 * @param {Object} branchData - Datos de la banca (mismos que createBranch)
 * @param {Object} config - Configuración de la banca
 * @param {Object} discountConfig - Configuración de descuentos
 * @param {Object} printConfig - Configuración de impresión
 * @param {Object} footer - Configuración de pie de página
 * @returns {Promise<Object>} Banca creada con toda su configuración
 */
export const createBranchWithConfig = async (branchData, config, discountConfig, printConfig, footer) => {
  try {
    logger.info('BRANCH_SERVICE', 'Creando nueva banca con configuración', {
      branchName: branchData.branchName,
      branchCode: branchData.branchCode
    });

    // Construir el payload para CreateBettingPoolWithConfigDto
    const apiData = {
      // Datos básicos de la banca
      bettingPoolName: branchData.branchName,
      bettingPoolCode: branchData.branchCode,
      zoneId: branchData.zoneId,
      bankId: branchData.bankId || null,
      address: branchData.address || null,
      phone: branchData.phone || null,
      location: branchData.location || null,
      reference: branchData.reference || null,
      comment: branchData.comment || null,
      username: branchData.username || null,
      password: branchData.password || null,
      isActive: branchData.isActive !== undefined ? branchData.isActive : true,

      // Configuración principal
      config: config ? {
        fallType: config.fallType || "OFF",
        deactivationBalance: config.deactivationBalance || null,
        dailySaleLimit: config.dailySaleLimit || null,
        dailyBalanceLimit: config.dailyBalanceLimit || null,
        temporaryAdditionalBalance: config.temporaryAdditionalBalance || null,
        enableTemporaryBalance: config.enableTemporaryBalance !== undefined ? config.enableTemporaryBalance : false,
        creditLimit: config.creditLimit || 0,
        isActive: config.isActive !== undefined ? config.isActive : true,
        controlWinningTickets: config.controlWinningTickets || false,
        allowJackpot: config.allowJackpot !== undefined ? config.allowJackpot : true,
        enableRecharges: config.enableRecharges !== undefined ? config.enableRecharges : true,
        allowPasswordChange: config.allowPasswordChange !== undefined ? config.allowPasswordChange : true,
        cancelMinutes: config.cancelMinutes || 30,
        dailyCancelTickets: config.dailyCancelTickets || null,
        maxCancelAmount: config.maxCancelAmount || null,
        maxTicketAmount: config.maxTicketAmount || null,
        maxDailyRecharge: config.maxDailyRecharge || null,
        paymentMode: config.paymentMode || "BANCA"
      } : null,

      // Configuración de descuentos
      discountConfig: discountConfig ? {
        discountProvider: discountConfig.discountProvider || "GRUPO",
        discountMode: discountConfig.discountMode || "OFF"
      } : null,

      // Configuración de impresión
      printConfig: printConfig ? {
        printMode: printConfig.printMode || "DRIVER",
        printEnabled: printConfig.printEnabled !== undefined ? printConfig.printEnabled : true,
        printTicketCopy: printConfig.printTicketCopy !== undefined ? printConfig.printTicketCopy : true,
        printRechargeReceipt: printConfig.printRechargeReceipt !== undefined ? printConfig.printRechargeReceipt : true,
        smsOnly: printConfig.smsOnly || false
      } : null,

      // Configuración de pie de página
      footer: footer ? {
        autoFooter: footer.autoFooter !== undefined ? footer.autoFooter : false,
        footerLine1: footer.footerLine1 || null,
        footerLine2: footer.footerLine2 || null,
        footerLine3: footer.footerLine3 || null,
        footerLine4: footer.footerLine4 || null
      } : null
    };

    const response = await fetch(`${API_BASE_URL}/with-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData)
    });

    logger.debug('BRANCH_SERVICE', 'Respuesta de la API (with-config)', {
      status: response.status,
      statusText: response.statusText
    });

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          logger.error('BRANCH_SERVICE', 'Error parseando JSON', { parseError: parseError.message, text });
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 400) {
        let errorDetails = '';
        if (data) {
          if (data.message) {
            errorDetails = data.message;
          } else if (data.errors) {
            const errors = Object.entries(data.errors)
              .map(([field, messages]) => {
                const fieldName = field.replace(/([A-Z])/g, ' $1').trim();
                return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
              })
              .join('\n');
            errorDetails = errors || 'Error de validación';
          } else if (data.title || data.detail) {
            errorDetails = data.detail || data.title || 'Error de validación';
          }
        }
        logger.error('BRANCH_SERVICE', 'Error de validación 400', { data, errorDetails });
        throw new Error(errorDetails || 'Error de validación');
      }
      if (response.status === 409) {
        throw new Error('El código de banca ya existe');
      }
      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }
      throw new Error(data?.message || `Error del servidor (${response.status})`);
    }

    if (!data) {
      data = {
        success: true,
        message: 'Banca creada exitosamente con configuración',
        bettingPoolId: Date.now()
      };
    }

    logger.success('BRANCH_SERVICE', 'Banca con configuración creada exitosamente', {
      bettingPoolId: data.bettingPoolId
    });
    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en createBranchWithConfig', {
      error: error.message,
      branchData
    });

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que la API esté ejecutándose.');
    }

    throw error;
  }
};

/**
 * Obtener banca con su configuración completa
 * @param {number} branchId - ID de la banca
 * @returns {Promise<Object>} Banca con config, discountConfig y printConfig
 */
export const getBranchWithConfig = async (branchId) => {
  try {
    logger.info('BRANCH_SERVICE', 'Obteniendo banca con configuración', { branchId });

    const response = await fetch(`${API_BASE_URL}/${branchId}/config`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('BRANCH_SERVICE', 'Banca con configuración obtenida exitosamente', {
      branchId,
      branchName: data.bettingPoolName,
      hasConfig: !!data.config,
      hasDiscountConfig: !!data.discountConfig,
      hasPrintConfig: !!data.printConfig
    });

    return {
      success: true,
      data
    };
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error obteniendo banca con configuración', {
      branchId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Actualizar configuración de una banca existente
 * @param {number} branchId - ID de la banca
 * @param {Object} config - Configuración principal
 * @param {Object} discountConfig - Configuración de descuentos
 * @param {Object} printConfig - Configuración de impresión
 * @param {Object} footer - Configuración de pie de página
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateBranchConfig = async (branchId, config, discountConfig, printConfig, footer) => {
  try {
    logger.info('BRANCH_SERVICE', 'Actualizando configuración de banca', { branchId });

    const apiData = {
      config: config ? {
        fallType: config.fallType || "OFF",
        deactivationBalance: config.deactivationBalance || null,
        dailySaleLimit: config.dailySaleLimit || null,
        dailyBalanceLimit: config.dailyBalanceLimit || null,
        temporaryAdditionalBalance: config.temporaryAdditionalBalance || null,
        enableTemporaryBalance: config.enableTemporaryBalance !== undefined ? config.enableTemporaryBalance : false,
        creditLimit: config.creditLimit || 0,
        isActive: config.isActive !== undefined ? config.isActive : true,
        controlWinningTickets: config.controlWinningTickets || false,
        allowJackpot: config.allowJackpot !== undefined ? config.allowJackpot : true,
        enableRecharges: config.enableRecharges !== undefined ? config.enableRecharges : true,
        allowPasswordChange: config.allowPasswordChange !== undefined ? config.allowPasswordChange : true,
        cancelMinutes: config.cancelMinutes || 30,
        dailyCancelTickets: config.dailyCancelTickets || null,
        maxCancelAmount: config.maxCancelAmount || null,
        maxTicketAmount: config.maxTicketAmount || null,
        maxDailyRecharge: config.maxDailyRecharge || null,
        paymentMode: config.paymentMode || "BANCA"
      } : null,

      discountConfig: discountConfig ? {
        discountProvider: discountConfig.discountProvider || "GRUPO",
        discountMode: discountConfig.discountMode || "OFF"
      } : null,

      printConfig: printConfig ? {
        printMode: printConfig.printMode || "DRIVER",
        printEnabled: printConfig.printEnabled !== undefined ? printConfig.printEnabled : true,
        printTicketCopy: printConfig.printTicketCopy !== undefined ? printConfig.printTicketCopy : true,
        printRechargeReceipt: printConfig.printRechargeReceipt !== undefined ? printConfig.printRechargeReceipt : true,
        smsOnly: printConfig.smsOnly || false
      } : null,

      footer: footer ? {
        autoFooter: footer.autoFooter !== undefined ? footer.autoFooter : false,
        footerLine1: footer.footerLine1 || null,
        footerLine2: footer.footerLine2 || null,
        footerLine3: footer.footerLine3 || null,
        footerLine4: footer.footerLine4 || null
      } : null
    };

    const response = await fetch(`${API_BASE_URL}/${branchId}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    logger.info('BRANCH_SERVICE', 'Configuración actualizada exitosamente', { branchId });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error actualizando configuración', {
      branchId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Guardar configuración de premios y comisiones para una banca
 * @param {number} branchId - ID de la banca
 * @param {number|null} lotteryId - ID de la lotería (null para configuración general)
 * @param {Array} configurations - Array de configuraciones
 * @param {string} configurations[].gameType - Tipo de juego
 * @param {number} configurations[].prizePercentage - Porcentaje de premio (0-100)
 * @param {number} configurations[].commissionPercentage - Porcentaje de comisión (0-100)
 * @param {number} configurations[].maxPrizeAmount - Monto máximo de premio
 * @param {boolean} [configurations[].isActive] - Estado activo (default: true)
 * @returns {Promise<Object>} Resultado de la operación
 */
export const saveBranchPrizesCommissions = async (branchId, lotteryId, configurations) => {
  try {
    const requestData = {
      branchId,
      lotteryId,
      configurations: configurations.map(config => ({
        gameType: config.gameType,
        prizePercentage: parseFloat(config.prizePercentage) || 0,
        commissionPercentage: parseFloat(config.commissionPercentage) || 0,
        maxPrizeAmount: config.maxPrizeAmount ? parseFloat(config.maxPrizeAmount) : null,
        isActive: config.isActive !== undefined ? config.isActive : true
      }))
    };

    const response = await fetch(`${API_BASE_URL}/${branchId}/prizes-commissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      if (response.status === 400) {
        throw new Error(data.message || 'Error de validación');
      }
      throw new Error(data.message || 'Error al guardar premios y comisiones');
    }

    logger.success('BRANCH_SERVICE', 'Premios y comisiones guardados exitosamente', { branchId, lotteryId });
    return data;
  } catch (error) {
    logger.error('BRANCH_SERVICE', 'Error en saveBranchPrizesCommissions', { error: error.message, branchId, lotteryId });
    throw error;
  }
};

export default {
  getBranches,
  getBranchById,
  getNextBranchCode,
  createBranch,
  createBranchWithConfig,
  getBranchWithConfig,
  updateBranch,
  updateBranchConfig,
  deleteBranch,
  getBranchUsers,
  getBranchPrizesCommissions,
  saveBranchPrizesCommissions,
  handleBranchError
};