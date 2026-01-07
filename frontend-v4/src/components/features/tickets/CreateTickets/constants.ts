/**
 * CreateTickets Constants
 *
 * Centralized constants for the CreateTickets component.
 */

import type { BetType } from './types';

// Bet types for dropdown
export const BET_TYPES: BetType[] = [
  { id: 'directo', name: 'Directo' },
  { id: 'pale', name: 'Pale' },
  { id: 'tripleta', name: 'Tripleta' },
  { id: 'cash3-straight', name: 'Cash3 Straight' },
  { id: 'cash3-box', name: 'Cash3 Box' },
  { id: 'play4-straight', name: 'Play4 Straight' },
  { id: 'play4-box', name: 'Play4 Box' },
  { id: 'pick5', name: 'Pick 5' },
];

// Column header colors
export const COLUMN_COLORS = {
  directo: { headerColor: '#51cbce', headerBgColor: '#e0f2f1' },
  pale: { headerColor: '#3d9970', headerBgColor: '#e8f5e9' },
  cash3: { headerColor: '#51cbce', headerBgColor: '#e0f2f1' },
  play4: { headerColor: '#3d9970', headerBgColor: '#e8f5e9' },
} as const;

// Column titles
export const COLUMN_TITLES = {
  directo: 'DIRECTO',
  pale: 'PALE & TRIPLETA',
  cash3: 'CASH 3',
  play4: 'PLAY 4 & PICK 5',
} as const;
