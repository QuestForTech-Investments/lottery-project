/**
 * CreateTickets Constants
 *
 * Centralized constants for the CreateTickets component.
 */

import type { BetType, ColumnType } from './types';

// Game type configuration for all 21 types
export interface GameTypeConfig {
  code: string;
  name: string;
  column: ColumnType;
  displaySuffix: string;
}

export const GAME_TYPES: Record<number, GameTypeConfig> = {
  1:  { code: 'DIRECTO',           name: 'Directo',              column: 'directo', displaySuffix: '' },
  2:  { code: 'PALE',              name: 'Pale',                 column: 'pale',    displaySuffix: '' },
  3:  { code: 'TRIPLETA',          name: 'Tripleta',             column: 'pale',    displaySuffix: '' },
  4:  { code: 'CASH3_STRAIGHT',    name: 'Cash3 Straight',       column: 'cash3',   displaySuffix: 's' },
  5:  { code: 'CASH3_BOX',         name: 'Cash3 Box',            column: 'cash3',   displaySuffix: 'b' },
  6:  { code: 'CASH3_FRONT_STR',   name: 'Cash3 Front Straight', column: 'cash3',   displaySuffix: 'fs' },
  7:  { code: 'CASH3_FRONT_BOX',   name: 'Cash3 Front Box',      column: 'cash3',   displaySuffix: 'fb' },
  8:  { code: 'CASH3_BACK_STR',    name: 'Cash3 Back Straight',  column: 'cash3',   displaySuffix: 'bs' },
  9:  { code: 'CASH3_BACK_BOX',    name: 'Cash3 Back Box',       column: 'cash3',   displaySuffix: 'bb' },
  10: { code: 'PLAY4_STRAIGHT',    name: 'Play4 Straight',       column: 'play4',   displaySuffix: 's' },
  11: { code: 'PLAY4_BOX',         name: 'Play4 Box',            column: 'play4',   displaySuffix: 'b' },
  12: { code: 'PICK5_STRAIGHT',    name: 'Pick5 Straight',       column: 'play4',   displaySuffix: 's' },
  13: { code: 'PICK5_BOX',         name: 'Pick5 Box',            column: 'play4',   displaySuffix: 'b' },
  14: { code: 'SUPER_PALE',        name: 'Super Pale',           column: 'pale',    displaySuffix: '' },
  15: { code: 'PICK2',             name: 'Pick 2',               column: 'play4',   displaySuffix: '' },
  16: { code: 'PICK2_FRONT',       name: 'Pick 2 Front',         column: 'play4',   displaySuffix: 'f' },
  17: { code: 'PICK2_BACK',        name: 'Pick 2 Back',          column: 'play4',   displaySuffix: 'bk' },
  18: { code: 'PICK2_MIDDLE',      name: 'Pick 2 Middle',        column: 'play4',   displaySuffix: 'm' },
  19: { code: 'BOLITA',            name: 'Bolita',               column: 'directo', displaySuffix: '' },
  20: { code: 'SINGULACION',       name: 'Singulacion',          column: 'directo', displaySuffix: '' },
  21: { code: 'PANAMA',            name: 'Panama',               column: 'directo', displaySuffix: 's' },
};

// Bet types for dropdown (all 21 game types)
export const BET_TYPES: BetType[] = [
  { id: 'directo',           name: 'Directo',               gameTypeId: 1 },
  { id: 'pale',              name: 'Pale',                  gameTypeId: 2 },
  { id: 'tripleta',          name: 'Tripleta',              gameTypeId: 3 },
  { id: 'cash3-straight',    name: 'Cash3 Straight',        gameTypeId: 4 },
  { id: 'cash3-box',         name: 'Cash3 Box',             gameTypeId: 5 },
  { id: 'cash3-front-str',   name: 'Cash3 Front Straight',  gameTypeId: 6 },
  { id: 'cash3-front-box',   name: 'Cash3 Front Box',       gameTypeId: 7 },
  { id: 'cash3-back-str',    name: 'Cash3 Back Straight',   gameTypeId: 8 },
  { id: 'cash3-back-box',    name: 'Cash3 Back Box',        gameTypeId: 9 },
  { id: 'play4-straight',    name: 'Play4 Straight',        gameTypeId: 10 },
  { id: 'play4-box',         name: 'Play4 Box',             gameTypeId: 11 },
  { id: 'pick5-straight',    name: 'Pick5 Straight',        gameTypeId: 12 },
  { id: 'pick5-box',         name: 'Pick5 Box',             gameTypeId: 13 },
  { id: 'super-pale',        name: 'Super Pale',            gameTypeId: 14 },
  { id: 'pick2',             name: 'Pick 2',                gameTypeId: 15 },
  { id: 'pick2-front',       name: 'Pick 2 Front',          gameTypeId: 16 },
  { id: 'pick2-back',        name: 'Pick 2 Back',           gameTypeId: 17 },
  { id: 'pick2-middle',      name: 'Pick 2 Middle',         gameTypeId: 18 },
  { id: 'bolita',            name: 'Bolita',                gameTypeId: 19 },
  { id: 'singulacion',       name: 'Singulacion',           gameTypeId: 20 },
  { id: 'panama',            name: 'Panama',                gameTypeId: 21 },
];

// Split amount pairs: maps each split-eligible game type ID to its straight/box pair
export const SPLIT_PAIRS: Record<number, { straightId: number; boxId: number }> = {
  4:  { straightId: 4, boxId: 5 },    // Cash3
  5:  { straightId: 4, boxId: 5 },
  6:  { straightId: 6, boxId: 7 },    // Cash3 Front
  7:  { straightId: 6, boxId: 7 },
  8:  { straightId: 8, boxId: 9 },    // Cash3 Back
  9:  { straightId: 8, boxId: 9 },
  10: { straightId: 10, boxId: 11 },  // Play4
  11: { straightId: 10, boxId: 11 },
  12: { straightId: 12, boxId: 13 },  // Pick5
  13: { straightId: 12, boxId: 13 },
};

// Column header colors
export const COLUMN_COLORS = {
  directo: { headerColor: '#8b5cf6', headerBgColor: '#ede9fe' },
  pale: { headerColor: '#3d9970', headerBgColor: '#e8f5e9' },
  cash3: { headerColor: '#8b5cf6', headerBgColor: '#ede9fe' },
  play4: { headerColor: '#3d9970', headerBgColor: '#e8f5e9' },
} as const;

// Column titles
export const COLUMN_TITLES = {
  directo: 'DIRECTO',
  pale: 'PALE & TRIPLETA',
  cash3: 'CASH 3',
  play4: 'PLAY 4 & PICK 5',
} as const;
