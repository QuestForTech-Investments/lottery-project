/**
 * CreateTicketsAdvanced Constants
 */

import type { SectionName } from './types';

export const SECTION_NAMES: readonly SectionName[] = [
  'DIRECTO',
  'PALE & TRIPLETA',
  'CASH 3',
  'PLAY 4 & PICK 5',
] as const;

export const COLORS = {
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  success: '#28a745',
  danger: '#dc3545',
  secondary: '#6c757d',
  background: '#f8f9fa',
  summaryBg: '#e9ecef',
  detectionBg: '#e7f9f9',
  errorBg: '#ffe6e6',
  errorBorder: '#ff4444',
} as const;

export const MOCK_DRAWS = [
  { drawId: 1, drawName: 'TEXAS DAY', lotteryName: 'TEXAS', drawTime: '12:00 PM' },
  { drawId: 2, drawName: 'NEW YORK DAY', lotteryName: 'NEW YORK', drawTime: '12:00 PM' },
  { drawId: 3, drawName: 'FLORIDA AM', lotteryName: 'FLORIDA', drawTime: '10:00 AM' },
] as const;
