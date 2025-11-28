import api from './api';

// Types - Export for re-use
export interface Schedule {
  dayOfWeek: number;
  openingTime: string | null;
  closingTime: string | null;
  isActive?: boolean;
}

export interface ScheduleResponse {
  success: boolean;
  data: Schedule[];
}

interface SchedulePayload {
  schedules: Schedule[];
}

export interface FormScheduleData {
  domingoInicio?: string;
  domingoFin?: string;
  lunesInicio?: string;
  lunesFin?: string;
  martesInicio?: string;
  martesFin?: string;
  miercolesInicio?: string;
  miercolesFin?: string;
  juevesInicio?: string;
  juevesFin?: string;
  viernesInicio?: string;
  viernesFin?: string;
  sabadoInicio?: string;
  sabadoFin?: string;
  [key: string]: string | undefined;
}

interface ApiScheduleData {
  schedules?: Schedule[];
}

/**
 * Get schedules for a betting pool
 */
export const getBettingPoolSchedules = async (bettingPoolId: number | string): Promise<ScheduleResponse> => {
  try {
    const data = await api.get(`/betting-pools/${bettingPoolId}/schedules`) as ApiScheduleData;
    return { success: true, data: data.schedules || [] };
  } catch (error) {
    console.error('Error getting betting pool schedules:', error);
    throw error;
  }
};

/**
 * Save schedules for a betting pool
 */
export const saveBettingPoolSchedules = async (
  bettingPoolId: number | string,
  schedules: Schedule[]
): Promise<ScheduleResponse> => {
  try {
    console.log('[SCHEDULE] [SCHEDULE SERVICE] Saving schedules for betting pool:', bettingPoolId);
    console.log('[SCHEDULE] [SCHEDULE SERVICE] Schedules to save:', JSON.stringify(schedules, null, 2));

    const payload: SchedulePayload = { schedules: schedules };
    console.log('[SCHEDULE] [SCHEDULE SERVICE] Request payload:', JSON.stringify(payload, null, 2));

    const data = await api.post(`/betting-pools/${bettingPoolId}/schedules`, payload) as ApiScheduleData;

    console.log('[SUCCESS] [SCHEDULE SERVICE] Schedules saved successfully:', data);
    return { success: true, data: data.schedules || [] };
  } catch (err) {
    const error = err as Error & { response?: unknown; stack?: string };
    console.error('[ERROR] [SCHEDULE SERVICE] Error saving betting pool schedules:', error);
    console.error('[ERROR] [SCHEDULE SERVICE] Error details:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Transform frontend schedule data (domingoInicio, domingoFin, etc.) to API format
 */
export const transformSchedulesToApiFormat = (formData: FormScheduleData): Schedule[] => {
  console.log('[SYNC] [TRANSFORM] Converting formData to API format');
  console.log('[SYNC] [TRANSFORM] Input formData keys:', Object.keys(formData).filter(k => k.includes('Inicio') || k.includes('Fin')));

  const days: Array<{ key: string; dayOfWeek: number }> = [
    { key: 'domingo', dayOfWeek: 0 },
    { key: 'lunes', dayOfWeek: 1 },
    { key: 'martes', dayOfWeek: 2 },
    { key: 'miercoles', dayOfWeek: 3 },
    { key: 'jueves', dayOfWeek: 4 },
    { key: 'viernes', dayOfWeek: 5 },
    { key: 'sabado', dayOfWeek: 6 }
  ];

  const result = days.map(day => {
    const schedule: Schedule = {
      dayOfWeek: day.dayOfWeek,
      openingTime: formData[`${day.key}Inicio`] || null,
      closingTime: formData[`${day.key}Fin`] || null,
      isActive: true
    };
    console.log(`[SYNC] [TRANSFORM] ${day.key}: opening="${schedule.openingTime}", closing="${schedule.closingTime}"`);
    return schedule;
  });

  console.log('[SYNC] [TRANSFORM] Transformation complete:', result);
  return result;
};

/**
 * Transform API schedule data to frontend format (domingoInicio, domingoFin, etc.)
 */
export const transformSchedulesToFormFormat = (schedules: Schedule[]): FormScheduleData => {
  console.log('[SYNC] [TRANSFORM] Converting API data to form format');
  console.log('[SYNC] [TRANSFORM] Input schedules:', schedules);

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const formData: FormScheduleData = {};

  schedules.forEach(schedule => {
    const dayKey = days[schedule.dayOfWeek];
    formData[`${dayKey}Inicio`] = schedule.openingTime || '12:00 AM';
    formData[`${dayKey}Fin`] = schedule.closingTime || '11:59 PM';
    console.log(`[SYNC] [TRANSFORM] ${dayKey}: opening="${formData[`${dayKey}Inicio`]}", closing="${formData[`${dayKey}Fin`]}"`);
  });

  console.log('[SYNC] [TRANSFORM] Form data result:', formData);
  return formData;
};
