/**
 * Betting Pool Service - Manejo de operaciones de betting pools
 * Basado en la documentación API V4.0
 * NOTA: Usa el endpoint /api/betting-pools del backend
 */

const API_BASE_URL = '/api/betting-pools';

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
export const getBettingPools = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Agregar parámetros si existen
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    if (params.search) queryParams.append('search', params.search);
    if (params.zoneId) queryParams.append('zoneId', params.zoneId);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);

    // Verificar content-type antes de parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en getBettingPools:', parseError);
          console.error('Respuesta recibida:', text.substring(0, 200));
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      console.error('getBettingPools - Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(data?.message || `Error al obtener betting pools (${response.status})`);
    }

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
export const getBettingPoolById = async (bettingPoolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}`);

    // Verificar content-type antes de parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en getBettingPoolById:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Betting pool no encontrado');
      }
      throw new Error(data?.message || 'Error al obtener el betting pool');
    }

    // Envolver en formato consistente con otros servicios
    return {
      success: true,
      data: data
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
export const getNextBettingPoolCode = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/next-code`);

    // Verificar content-type antes de parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en getNextBettingPoolCode:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Error al obtener el próximo código');
    }

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
export const createBettingPool = async (bettingPoolData) => {
  try {
    console.log('Enviando datos a la API:', bettingPoolData);

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bettingPoolData)
    });

    console.log('Respuesta de la API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
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
          console.error('Error parseando JSON:', parseError);
          console.error('Texto recibido:', text);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(data?.message || 'Error de validación');
      }
      if (response.status === 409) {
        throw new Error('El código del betting pool ya existe');
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
        message: 'Betting pool creado exitosamente',
        data: {
          bettingPoolId: Date.now(), // ID temporal
          ...bettingPoolData
        }
      };
    }

    return data;
  } catch (error) {
    console.error('Error en createBettingPool:', error);
    
    // Si es un error de red, proporcionar un mensaje más específico
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que la API esté ejecutándose.');
    }
    
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
export const updateBettingPool = async (bettingPoolId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    // Verificar content-type antes de parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en updateBettingPool:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Betting pool no encontrado');
      }
      if (response.status === 400) {
        throw new Error(data?.message || 'Error de validación');
      }
      throw new Error(data?.message || 'Error al actualizar el betting pool');
    }

    // Envolver en formato consistente con otros servicios
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en updateBettingPool:', error);
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
/**
 * Get betting pool configuration (Config, Print, Discount, Footer)
 * @param {number} bettingPoolId - ID del betting pool
 * @returns {Promise<Object>} Configuration data
 */
export const getBettingPoolConfig = async (bettingPoolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}/config`);

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en getBettingPoolConfig:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Betting pool no encontrado');
      }
      throw new Error(data?.message || 'Error al obtener la configuración');
    }

    return {
      success: true,
      data: data
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
export const updateBettingPoolConfig = async (bettingPoolId, configData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData)
    });

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en updateBettingPoolConfig:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Betting pool no encontrado');
      }
      if (response.status === 400) {
        throw new Error(data?.message || 'Error de validación en configuración');
      }
      throw new Error(data?.message || 'Error al actualizar la configuración');
    }

    return {
      success: true,
      data: data
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
export const deleteBettingPool = async (bettingPoolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}`, {
      method: 'DELETE'
    });

    // Verificar content-type antes de parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en deleteBettingPool:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Betting pool no encontrado');
      }
      if (response.status === 400) {
        throw new Error(data?.message || 'No se puede eliminar el betting pool. Tiene usuarios asociados.');
      }
      throw new Error(data?.message || 'Error al eliminar el betting pool');
    }

    return data;
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
export const getBettingPoolUsers = async (bettingPoolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}/users`);

    // Verificar content-type antes de parsear JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en getBettingPoolUsers:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Betting pool no encontrado');
      }
      throw new Error(data?.message || 'Error al obtener usuarios del betting pool');
    }

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
export const handleBettingPoolError = (error, operation = 'operation') => {
  const errorMessage = error.message || 'Error desconocido';
  
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