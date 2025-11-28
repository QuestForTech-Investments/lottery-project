/**
 * Schedule Service
 * Handles all schedule-related API calls for betting pools
 * TypeScript version with proper typing and api client usage
 */

import { api } from './api/client'
import logger from '@/utils/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface Schedule {
  dayOfWeek: number
  openingTime: string | null
  closingTime: string | null
  isActive: boolean
}

export interface ScheduleFormData {
  domingoInicio?: string
  domingoFin?: string
  lunesInicio?: string
  lunesFin?: string
  martesInicio?: string
  martesFin?: string
  miercolesInicio?: string
  miercolesFin?: string
  juevesInicio?: string
  juevesFin?: string
  viernesInicio?: string
  viernesFin?: string
  sabadoInicio?: string
  sabadoFin?: string
}

interface ScheduleResponse {
  schedules: Schedule[]
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get schedules for a betting pool
 * @param bettingPoolId - ID of the betting pool
 * @returns Schedule data with AM/PM format
 */
export const getBettingPoolSchedules = async (
  bettingPoolId: number
): Promise<{ success: boolean; data: Schedule[] }> => {
  try {
    const data = await api.get<ScheduleResponse>(`/betting-pools/${bettingPoolId}/schedules`)
    return { success: true, data: data.schedules }
  } catch (error) {
    logger.error('Error getting betting pool schedules', error)
    throw error
  }
}

/**
 * Save schedules for a betting pool
 * @param bettingPoolId - ID of the betting pool
 * @param schedules - Array of schedule objects with dayOfWeek, openingTime, closingTime
 * @returns Saved schedule data
 */
export const saveBettingPoolSchedules = async (
  bettingPoolId: number,
  schedules: Schedule[]
): Promise<{ success: boolean; data: Schedule[] }> => {
  try {
    logger.info('Saving schedules for betting pool', { bettingPoolId, schedules })

    const payload = { schedules }
    const data = await api.post<ScheduleResponse>(
      `/betting-pools/${bettingPoolId}/schedules`,
      payload
    )

    logger.info('Schedules saved successfully', data)
    return { success: true, data: data.schedules }
  } catch (error) {
    logger.error('Error saving betting pool schedules', error)
    throw error
  }
}

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transform frontend schedule data (domingoInicio, domingoFin, etc.) to API format
 * @param formData - Form data with schedule fields
 * @returns Array of schedule objects ready for API
 */
export const transformSchedulesToApiFormat = (formData: ScheduleFormData): Schedule[] => {
  logger.debug('Converting formData to API format', {
    keys: Object.keys(formData).filter((k) => k.includes('Inicio') || k.includes('Fin')),
  })

  const days: Array<{ key: keyof ScheduleFormData; dayOfWeek: number }> = [
    { key: 'domingo', dayOfWeek: 0 },
    { key: 'lunes', dayOfWeek: 1 },
    { key: 'martes', dayOfWeek: 2 },
    { key: 'miercoles', dayOfWeek: 3 },
    { key: 'jueves', dayOfWeek: 4 },
    { key: 'viernes', dayOfWeek: 5 },
    { key: 'sabado', dayOfWeek: 6 },
  ]

  const result = days.map((day) => {
    const inicioKey = `${day.key}Inicio` as keyof ScheduleFormData
    const finKey = `${day.key}Fin` as keyof ScheduleFormData

    const schedule: Schedule = {
      dayOfWeek: day.dayOfWeek,
      openingTime: formData[inicioKey] || null,
      closingTime: formData[finKey] || null,
      isActive: true,
    }

    logger.debug(`Schedule for ${day.key}`, {
      opening: schedule.openingTime,
      closing: schedule.closingTime,
    })

    return schedule
  })

  logger.debug('Transformation complete', result)
  return result
}

/**
 * Transform API schedule data to frontend format (domingoInicio, domingoFin, etc.)
 * @param schedules - Array of schedule objects from API
 * @returns Object with schedule fields for form
 */
export const transformSchedulesToFormFormat = (schedules: Schedule[]): ScheduleFormData => {
  logger.debug('Converting API data to form format', { schedules })

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  const formData: ScheduleFormData = {}

  schedules.forEach((schedule) => {
    const dayKey = days[schedule.dayOfWeek]
    if (dayKey) {
      const inicioKey = `${dayKey}Inicio` as keyof ScheduleFormData
      const finKey = `${dayKey}Fin` as keyof ScheduleFormData

      formData[inicioKey] = schedule.openingTime || '12:00 AM'
      formData[finKey] = schedule.closingTime || '11:59 PM'

      logger.debug(`Schedule for ${dayKey}`, {
        opening: formData[inicioKey],
        closing: formData[finKey],
      })
    }
  })

  logger.debug('Form data result', formData)
  return formData
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  getBettingPoolSchedules,
  saveBettingPoolSchedules,
  transformSchedulesToApiFormat,
  transformSchedulesToFormFormat,
}
