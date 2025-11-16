/**
 * Schedule Service - Manejo de operaciones de horarios de bancas
 */

import * as logger from '../utils/logger';
import { API_ENDPOINTS, buildApiUrl } from '../config/apiConfig';

const API_BASE_URL = buildApiUrl(API_ENDPOINTS.BETTING_POOLS);

/**
 * Obtener horarios de una banca
 * @param {number} bettingPoolId - ID de la banca
 * @returns {Promise<Object>} Horarios con formato AM/PM
 */
export const getBettingPoolSchedules = async (bettingPoolId) => {
  try {
    logger.info('SCHEDULE_SERVICE', 'Obteniendo horarios de banca', { bettingPoolId });

    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}/schedules`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      throw new Error(data.message || 'Error al obtener horarios');
    }

    logger.success('SCHEDULE_SERVICE', 'Horarios obtenidos exitosamente', {
      bettingPoolId,
      scheduleCount: data.schedules?.length || 0
    });

    return { success: true, data: data.schedules };
  } catch (error) {
    logger.error('SCHEDULE_SERVICE', 'Error en getBettingPoolSchedules', {
      error: error.message,
      bettingPoolId
    });
    throw error;
  }
};

/**
 * Guardar horarios de una banca
 * @param {number} bettingPoolId - ID de la banca
 * @param {Array} schedules - Array de horarios
 * @param {number} schedules[].dayOfWeek - Día de la semana (0=Domingo, 6=Sábado)
 * @param {string} schedules[].openingTime - Hora de apertura en formato "HH:MM AM/PM"
 * @param {string} schedules[].closingTime - Hora de cierre en formato "HH:MM AM/PM"
 * @param {boolean} [schedules[].isActive] - Estado activo (default: true)
 * @returns {Promise<Object>} Horarios guardados
 */
export const saveBettingPoolSchedules = async (bettingPoolId, schedules) => {
  try {
    logger.info('SCHEDULE_SERVICE', 'Guardando horarios de banca', {
      bettingPoolId,
      scheduleCount: schedules.length
    });

    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schedules })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Banca no encontrada');
      }
      if (response.status === 400) {
        throw new Error(data.message || 'Error de validación en los horarios');
      }
      throw new Error(data.message || 'Error al guardar horarios');
    }

    logger.success('SCHEDULE_SERVICE', 'Horarios guardados exitosamente', {
      bettingPoolId,
      scheduleCount: data.schedules?.length || 0
    });

    return { success: true, data: data.schedules };
  } catch (error) {
    logger.error('SCHEDULE_SERVICE', 'Error en saveBettingPoolSchedules', {
      error: error.message,
      bettingPoolId,
      schedules
    });
    throw error;
  }
};

/**
 * Transformar datos del formulario (domingoInicio, domingoFin, etc.) a formato API
 * @param {Object} formData - Datos del formulario con campos de horario
 * @returns {Array} Array de horarios en formato API
 */
export const transformSchedulesToApiFormat = (formData) => {
  const days = [
    { key: 'domingo', dayOfWeek: 0 },
    { key: 'lunes', dayOfWeek: 1 },
    { key: 'martes', dayOfWeek: 2 },
    { key: 'miercoles', dayOfWeek: 3 },
    { key: 'jueves', dayOfWeek: 4 },
    { key: 'viernes', dayOfWeek: 5 },
    { key: 'sabado', dayOfWeek: 6 }
  ];

  return days.map(day => ({
    dayOfWeek: day.dayOfWeek,
    openingTime: formData[`${day.key}Inicio`] || null,
    closingTime: formData[`${day.key}Fin`] || null,
    isActive: true
  }));
};

/**
 * Transformar datos de la API a formato del formulario (domingoInicio, domingoFin, etc.)
 * @param {Array} schedules - Array de horarios desde la API
 * @returns {Object} Objeto con campos de horario para el formulario
 */
export const transformSchedulesToFormFormat = (schedules) => {
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const formData = {};

  // Inicializar valores por defecto
  days.forEach(day => {
    formData[`${day}Inicio`] = '12:00 AM';
    formData[`${day}Fin`] = '11:59 PM';
  });

  // Sobrescribir con datos de la API si existen
  schedules.forEach(schedule => {
    const dayKey = days[schedule.dayOfWeek];
    if (dayKey) {
      formData[`${dayKey}Inicio`] = schedule.openingTime || '12:00 AM';
      formData[`${dayKey}Fin`] = schedule.closingTime || '11:59 PM';
    }
  });

  return formData;
};

/**
 * Manejar errores de horarios de forma consistente
 * @param {Error} error - Error capturado
 * @returns {string} Mensaje de error amigable
 */
export const handleScheduleError = (error) => {
  const errorMessage = error.message || 'Error desconocido';

  if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }

  if (errorMessage.includes('404') || errorMessage.includes('no encontrada')) {
    return 'La banca no existe o ha sido eliminada.';
  }

  if (errorMessage.includes('400') || errorMessage.includes('validación')) {
    return 'Datos de horarios inválidos. Verifica los horarios ingresados.';
  }

  return `Error al procesar horarios: ${errorMessage}`;
};

export default {
  getBettingPoolSchedules,
  saveBettingPoolSchedules,
  transformSchedulesToApiFormat,
  transformSchedulesToFormFormat,
  handleScheduleError
};
