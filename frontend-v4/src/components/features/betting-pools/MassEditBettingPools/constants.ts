/**
 * MassEditBettingPools Constants
 *
 * Initial values and constants for the mass edit feature.
 */

import type { FormData } from './types';

export const INITIAL_FORM_DATA: FormData = {
  zoneId: '',
  fallType: null,
  deactivationBalance: '',
  dailySaleLimit: '',
  minutesToCancelTicket: '',
  ticketsToCancelPerDay: '',
  printTicketCopy: 'no_change',
  isActive: 'no_change',
  winningTicketControl: 'no_change',
  useNormalizedPrizes: 'no_change',
  allowPassingPlays: 'no_change',
  canChangePassword: 'no_change',
  language: null,
  printMode: null,
  discountMode: null,
  discountAmount: '',
  discountPerEvery: '',
  updateGeneralValues: false,
  autoFooter: false,
  footer1: '',
  footer2: '',
  footer3: '',
  footer4: '',
  footer5: '',
  footer6: '',
};

export const FALL_TYPE_OPTIONS = [
  'OFF',
  'COBRO',
  'DIARIA',
  'MENSUAL',
  'SEMANAL_CON_ACUMULADO',
  'SEMANAL_SIN_ACUMULADO',
] as const;

export const LANGUAGE_OPTIONS = ['ESPAÑOL', 'INGLÉS'] as const;

export const PRINT_MODE_OPTIONS = ['DRIVER', 'GENÉRICO'] as const;

export const DISCOUNT_MODE_OPTIONS = ['OFF', 'GRUPO', 'RIFERO'] as const;
