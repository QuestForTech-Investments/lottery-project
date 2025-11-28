import api from './api';

/**
 * Get schedules for a betting pool
 * @param {number} bettingPoolId - ID of the betting pool
 * @returns {Promise} Schedule data with AM/PM format
 */
export const getBettingPoolSchedules = async (bettingPoolId) => {
  try {
    const data = await api.get(`/betting-pools/${bettingPoolId}/schedules`);
    return { success: true, data: data.schedules };
  } catch (error) {
    console.error('Error getting betting pool schedules:', error);
    throw error;
  }
};

/**
 * Save schedules for a betting pool
 * @param {number} bettingPoolId - ID of the betting pool
 * @param {Array} schedules - Array of schedule objects with dayOfWeek, openingTime, closingTime
 * @returns {Promise} Saved schedule data
 */
export const saveBettingPoolSchedules = async (bettingPoolId, schedules) => {
  try {
    console.log('📅 [SCHEDULE SERVICE] Saving schedules for betting pool:', bettingPoolId);
    console.log('📅 [SCHEDULE SERVICE] Schedules to save:', JSON.stringify(schedules, null, 2));

    const payload = { schedules: schedules };
    console.log('📅 [SCHEDULE SERVICE] Request payload:', JSON.stringify(payload, null, 2));

    const data = await api.post(`/betting-pools/${bettingPoolId}/schedules`, payload);

    console.log('✅ [SCHEDULE SERVICE] Schedules saved successfully:', data);
    return { success: true, data: data.schedules };
  } catch (error) {
    console.error('❌ [SCHEDULE SERVICE] Error saving betting pool schedules:', error);
    console.error('❌ [SCHEDULE SERVICE] Error details:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Transform frontend schedule data (domingoInicio, domingoFin, etc.) to API format
 * @param {Object} formData - Form data with schedule fields
 * @returns {Array} Array of schedule objects ready for API
 */
export const transformSchedulesToApiFormat = (formData) => {
  console.log('🔄 [TRANSFORM] Converting formData to API format');
  console.log('🔄 [TRANSFORM] Input formData keys:', Object.keys(formData).filter(k => k.includes('Inicio') || k.includes('Fin')));

  const days = [
    { key: 'domingo', dayOfWeek: 0 },
    { key: 'lunes', dayOfWeek: 1 },
    { key: 'martes', dayOfWeek: 2 },
    { key: 'miercoles', dayOfWeek: 3 },
    { key: 'jueves', dayOfWeek: 4 },
    { key: 'viernes', dayOfWeek: 5 },
    { key: 'sabado', dayOfWeek: 6 }
  ];

  const result = days.map(day => {
    const schedule = {
      dayOfWeek: day.dayOfWeek,
      openingTime: formData[`${day.key}Inicio`] || null,
      closingTime: formData[`${day.key}Fin`] || null,
      isActive: true
    };
    console.log(`🔄 [TRANSFORM] ${day.key}: opening="${schedule.openingTime}", closing="${schedule.closingTime}"`);
    return schedule;
  });

  console.log('🔄 [TRANSFORM] Transformation complete:', result);
  return result;
};

/**
 * Transform API schedule data to frontend format (domingoInicio, domingoFin, etc.)
 * @param {Array} schedules - Array of schedule objects from API
 * @returns {Object} Object with schedule fields for form
 */
export const transformSchedulesToFormFormat = (schedules) => {
  console.log('🔄 [TRANSFORM] Converting API data to form format');
  console.log('🔄 [TRANSFORM] Input schedules:', schedules);

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const formData = {};

  schedules.forEach(schedule => {
    const dayKey = days[schedule.dayOfWeek];
    formData[`${dayKey}Inicio`] = schedule.openingTime || '12:00 AM';
    formData[`${dayKey}Fin`] = schedule.closingTime || '11:59 PM';
    console.log(`🔄 [TRANSFORM] ${dayKey}: opening="${formData[`${dayKey}Inicio`]}", closing="${formData[`${dayKey}Fin`]}"`);
  });

  console.log('🔄 [TRANSFORM] Form data result:', formData);
  return formData;
};
