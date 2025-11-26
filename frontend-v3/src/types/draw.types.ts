/**
 * Draw & Lottery Types
 * Based on frontend-v2 with TypeScript strict typing
 */

export interface DaySchedule {
  startTime: string; // HH:MM:SS format
  endTime: string;   // HH:MM:SS format
  enabled: boolean;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface Draw {
  drawId: number;
  drawName: string;
  abbreviation: string;
  color: string;
  logoUrl?: string;
  lotteryId: number;
  lotteryName: string;
  timezone: string;
  useWeeklySchedule: boolean;
  weeklySchedule: WeeklySchedule;
  isClosed: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface Lottery {
  lotteryId: number;
  lotteryName: string;
  timezone: string;
  draws: Draw[];
}

export interface DrawScheduleUpdate {
  drawId: number;
  useWeeklySchedule: boolean;
  weeklySchedule: WeeklySchedule;
}

// Day keys for iteration
export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type DayKey = typeof DAY_KEYS[number];

export const DAYS_ES: Record<DayKey, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};
