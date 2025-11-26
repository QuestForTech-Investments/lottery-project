/**
 * Central export point for all TypeScript types
 * Use: import { Draw, Ticket, Limit } from '@/types';
 */

// Draw & Lottery types
export type {
  DaySchedule,
  WeeklySchedule,
  Draw,
  Lottery,
  DrawScheduleUpdate,
  DayKey,
} from './draw.types';

export { DAY_KEYS, DAYS_ES } from './draw.types';

// Ticket & Bet types
export type {
  BetType,
  Bet,
  Ticket,
  TicketStats,
  CreateTicketRequest,
  CreateTicketResponse,
} from './ticket.types';

// Limit types
export type {
  LimitType,
  Limit,
  LimitUpdate,
  LimitConfiguration,
  LimitUpdateEvent,
} from './limit.types';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Auth types
export interface User {
  userId: number;
  username: string;
  email?: string;
  role: string;
  permissions: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
