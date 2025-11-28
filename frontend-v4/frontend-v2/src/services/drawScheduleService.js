import api from './api';

/**
 * Get draw schedules (all draws or filtered by lottery)
 * @param {number|null} lotteryId - Optional lottery ID filter
 * @returns {Promise} Draw schedules data
 */
export const getDrawSchedules = async (lotteryId = null) => {
  try {
    const endpoint = lotteryId
      ? `/draws/schedules?lotteryId=${lotteryId}`
      : '/draws/schedules';

    const data = await api.get(endpoint);
    console.log('📅 [DRAW SCHEDULE] Fetched schedules:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DRAW SCHEDULE] Error getting draw schedules:', error);
    throw error;
  }
};

/**
 * Update draw schedules (weekly schedules)
 * @param {Array} schedules - Array of draw schedule updates
 * @returns {Promise} Update result
 */
export const updateDrawSchedules = async (schedules) => {
  try {
    console.log('📅 [DRAW SCHEDULE] Updating schedules:', schedules);

    const payload = { schedules };
    const data = await api.patch('/draws/schedules', payload);

    console.log('✅ [DRAW SCHEDULE] Schedules updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [DRAW SCHEDULE] Error updating draw schedules:', error);
    throw error;
  }
};

/**
 * Group draws by lottery
 * @param {Array} draws - Array of draw schedule objects
 * @returns {Array} Array of lotteries with their draws
 */
export const groupDrawsByLottery = (draws) => {
  const lotteryMap = new Map();

  draws.forEach(draw => {
    if (!lotteryMap.has(draw.lotteryId)) {
      lotteryMap.set(draw.lotteryId, {
        lotteryId: draw.lotteryId,
        lotteryName: draw.lotteryName,
        timezone: draw.timezone,
        draws: []
      });
    }
    lotteryMap.get(draw.lotteryId).draws.push(draw);
  });

  return Array.from(lotteryMap.values());
};

/**
 * Validate weekly schedule
 * @param {Object} weeklySchedule - Weekly schedule object
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
export const validateWeeklySchedule = (weeklySchedule) => {
  const errors = [];
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
 * @returns {Object} Empty weekly schedule with all days disabled
 */
export const createEmptyWeeklySchedule = () => ({
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
 * @param {string} time24 - Time in 24-hour format (e.g., "14:30:00")
 * @returns {string} Time in 12-hour format (e.g., "02:30 PM")
 */
export const convertTo12Hour = (time24) => {
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
 * @param {string} time12 - Time in 12-hour format (e.g., "02:30 PM")
 * @returns {string} Time in 24-hour format (e.g., "14:30:00")
 */
export const convertTo24Hour = (time12) => {
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
 * @param {string} time - Time in HH:MM:SS format
 * @returns {string} Time in HH:MM format
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return '';
  return time.substring(0, 5);
};

/**
 * Format time for API (ensure HH:MM:SS format)
 * @param {string} time - Time in HH:MM or HH:MM:SS format
 * @returns {string} Time in HH:MM:SS format
 */
export const formatTimeForAPI = (time) => {
  if (!time) return '00:00:00';
  if (time.split(':').length === 2) {
    return `${time}:00`;
  }
  return time;
};
