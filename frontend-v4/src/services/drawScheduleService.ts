import api from './api';

// Types
interface DaySchedule {
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  [key: string]: DaySchedule;
}

interface DrawSchedule {
  drawId: number;
  drawName: string;
  lotteryId: number;
  lotteryName: string;
  timezone?: string;
  weeklySchedule?: WeeklySchedule;
}

interface DrawScheduleResponse {
  success: boolean;
  data: DrawSchedule[];
}

interface UpdateResponse {
  success: boolean;
  data: unknown;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface LotteryWithDraws {
  lotteryId: number;
  lotteryName: string;
  timezone?: string;
  draws: DrawSchedule[];
}

/**
 * Get draw schedules (all draws or filtered by lottery)
 */
export const getDrawSchedules = async (lotteryId: number | string | null = null): Promise<DrawScheduleResponse> => {
  try {
    const endpoint = lotteryId
      ? `/draws/schedules?lotteryId=${lotteryId}`
      : '/draws/schedules';

    const data = await api.get(endpoint) as DrawSchedule[];
    console.log('[SCHEDULE] [DRAW SCHEDULE] Fetched schedules:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[ERROR] [DRAW SCHEDULE] Error getting draw schedules:', error);
    throw error;
  }
};

/**
 * Update draw schedules (weekly schedules)
 */
export const updateDrawSchedules = async (schedules: DrawSchedule[]): Promise<UpdateResponse> => {
  try {
    console.log('[SCHEDULE] [DRAW SCHEDULE] Updating schedules:', schedules);

    const payload = { schedules };
    const data = await api.patch('/draws/schedules', payload);

    console.log('[SUCCESS] [DRAW SCHEDULE] Schedules updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[ERROR] [DRAW SCHEDULE] Error updating draw schedules:', error);
    throw error;
  }
};

/**
 * Group draws by lottery
 */
export const groupDrawsByLottery = (draws: DrawSchedule[]): LotteryWithDraws[] => {
  const lotteryMap = new Map<number, LotteryWithDraws>();

  draws.forEach(draw => {
    if (!lotteryMap.has(draw.lotteryId)) {
      lotteryMap.set(draw.lotteryId, {
        lotteryId: draw.lotteryId,
        lotteryName: draw.lotteryName,
        timezone: draw.timezone,
        draws: []
      });
    }
    lotteryMap.get(draw.lotteryId)!.draws.push(draw);
  });

  return Array.from(lotteryMap.values());
};

/**
 * Validate weekly schedule
 */
export const validateWeeklySchedule = (weeklySchedule: WeeklySchedule): ValidationResult => {
  const errors: string[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  days.forEach(day => {
    const schedule = weeklySchedule[day];
    if (schedule && schedule.enabled) {
      const start = schedule.startTime;
      const end = schedule.endTime;

      // Validate time format (HH:MM:SS)
      const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
      if (!timeRegex.test(start)) {
        errors.push(`${day}: Hora de inicio inválida (${start})`);
      }
      if (!timeRegex.test(end)) {
        errors.push(`${day}: Hora de fin inválida (${end})`);
      }

      // Validate end > start
      if (start && end && start >= end) {
        errors.push(`${day}: La hora de fin debe ser mayor que la hora de inicio`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Create empty weekly schedule
 */
export const createEmptyWeeklySchedule = (): WeeklySchedule => ({
  monday: { startTime: '08:00:00', endTime: '20:00:00', enabled: false },
  tuesday: { startTime: '08:00:00', endTime: '20:00:00', enabled: false },
  wednesday: { startTime: '08:00:00', endTime: '20:00:00', enabled: false },
  thursday: { startTime: '08:00:00', endTime: '20:00:00', enabled: false },
  friday: { startTime: '08:00:00', endTime: '20:00:00', enabled: false },
  saturday: { startTime: '08:00:00', endTime: '20:00:00', enabled: false },
  sunday: { startTime: '08:00:00', endTime: '17:00:00', enabled: false }
});

/**
 * Convert 24-hour time (HH:MM:SS) to 12-hour format (HH:MM AM/PM)
 */
export const convertTo12Hour = (time24: string): string => {
  if (!time24) return '';

  const [hours24, minutes] = time24.split(':');
  const hour = parseInt(hours24, 10);

  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${String(hour).padStart(2, '0')}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${String(hour - 12).padStart(2, '0')}:${minutes} PM`;
  }
};

/**
 * Convert 12-hour time (HH:MM AM/PM) to 24-hour format (HH:MM:SS)
 */
export const convertTo24Hour = (time12: string): string => {
  if (!time12) return '00:00:00';

  const timeParts = time12.trim().split(' ');
  if (timeParts.length !== 2) return '00:00:00';

  const [time, period] = timeParts;
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours, 10);

  if (period.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${minutes}:00`;
};

/**
 * Format time for display (remove seconds)
 */
export const formatTimeForDisplay = (time: string): string => {
  if (!time) return '';
  return time.substring(0, 5);
};

/**
 * Format time for API (ensure HH:MM:SS format)
 */
export const formatTimeForAPI = (time: string): string => {
  if (!time) return '00:00:00';
  if (time.split(':').length === 2) {
    return `${time}:00`;
  }
  return time;
};
