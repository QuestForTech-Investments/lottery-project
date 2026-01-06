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

    const payload: SchedulePayload = { schedules: schedules };

    const data = await api.post(`/betting-pools/${bettingPoolId}/schedules`, payload) as ApiScheduleData;

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
    return schedule;
  });

  return result;
};

/**
 * Transform API schedule data to frontend format (domingoInicio, domingoFin, etc.)
 */
export const transformSchedulesToFormFormat = (schedules: Schedule[]): FormScheduleData => {

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const formData: FormScheduleData = {};

  schedules.forEach(schedule => {
    const dayKey = days[schedule.dayOfWeek];
    formData[`${dayKey}Inicio`] = schedule.openingTime || '12:00 AM';
    formData[`${dayKey}Fin`] = schedule.closingTime || '11:59 PM';
  });

  return formData;
};
