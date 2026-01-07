/**
 * GroupConfiguration Constants
 *
 * Constants and default values for group configuration.
 */

import type { AllowedValuesType, PrizesData, CommissionsData, FooterData, PrizeFieldConfig } from './types';

// Allowed values for selection chips
export const ALLOWED_VALUES: AllowedValuesType = {
  directo: {
    primerPago: ['56', '70', '75', '72', '65', '60', '55', '50', '80'],
    segundoPago: ['12', '15', '8', '20'],
    tercerPago: ['4', '10'],
    dobles: ['56', '60', '55', '70', '75', '65', '72', '50', '80']
  },
  pale: {
    todosSecuencia: ['1200', '1300', '1100', '800', '700', '1400', '1500', '1000', '2000', '900', '1800'],
    primerPago: ['1200', '1000', '1500', '800', '900', '700', '1300', '1100', '1400', '2000', '1800'],
    segundoPago: ['1200', '1000', '1500', '900', '800', '700', '1300', '1100', '1400', '2000', '1800'],
    tercerPago: ['200', '1200', '1000', '800', '900', '700', '100', '1100', '1500', '1300']
  },
  pickTwo: {
    primerPago: ['80', '75', '60', '66', '65'],
    dobles: ['80', '75', '60', '66', '65']
  }
};

// Tab styles
export const TABS_STYLE = {
  borderBottom: 1,
  borderColor: 'divider',
  mb: 2,
  '& .MuiTab-root': {
    fontSize: '14px',
    textTransform: 'none',
    fontFamily: 'Montserrat, sans-serif'
  },
  '& .Mui-selected': {
    color: '#6366f1'
  }
};

export const TAB_INDICATOR_PROPS = {
  style: { backgroundColor: '#6366f1' }
};

// Gradient button style
export const GRADIENT_BUTTON_STYLE = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
  color: 'white',
  textTransform: 'none',
  fontSize: '12px',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 500
};

// Initial prizes data
export const INITIAL_PRIZES_DATA: PrizesData = {
  directo: { primerPago: '56', segundoPago: '12', tercerPago: '4', dobles: '56' },
  pale: { todosSecuencia: '1200', primerPago: '1200', segundoPago: '1200', tercerPago: '200' },
  tripleta: { primerPago: '10000', segundoPago: '100' },
  cash3Straight: { todosSecuencia: '700', triples: '700' },
  cash3Box: { threeWay: '232', sixWay: '116' },
  play4Straight: { todosSecuencia: '5000', dobles: '5000' },
  play4Box: { twentyFourWay: '200', twelveWay: '400', sixWay: '800', fourWay: '1200' },
  superPale: { primerPago: '2000' },
  bolita1: { primerPago: '80' },
  bolita2: { primerPago: '80' },
  singulacion1: { primerPago: '9' },
  singulacion2: { primerPago: '9' },
  singulacion3: { primerPago: '9' },
  pickTwo: { primerPago: '80', dobles: '80' },
  pick5Straight: { todosSecuencia: '30000', dobles: '30000' }
};

// Initial commissions data
export const INITIAL_COMMISSIONS_DATA: CommissionsData = {
  general: '',
  directo: '20',
  pale: '30',
  tripleta: '30',
  cash3Straight: '20',
  cash3Box: '20',
  play4Straight: '20',
  play4Box: '20',
  superPale: '30',
  bolita1: '20',
  bolita2: '20',
  singulacion1: '10',
  singulacion2: '10',
  singulacion3: '10',
  pickTwo: '20',
  pick5Straight: '20'
};

// Initial footer data
export const INITIAL_FOOTER_DATA: FooterData = {
  primerPie: 'Revise su Ticket Al Recibirlo',
  segundoPie: 'Jugadas Combinada se Paga una sola vez',
  tercerPie: 'Buena Suerte en sus Jugadas !',
  cuartoPie: 'LACENTRALRD.COM'
};

// Prize fields configuration for each game type
export const PRIZE_FIELDS_CONFIG: PrizeFieldConfig[] = [
  { title: 'Directo', gameType: 'directo', fields: { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago', dobles: 'Dobles' } },
  { title: 'Pale', gameType: 'pale', fields: { todosSecuencia: 'Todos en secuencia', primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago' } },
  { title: 'Tripleta', gameType: 'tripleta', fields: { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago' } },
  { title: 'Cash3 Straight', gameType: 'cash3Straight', fields: { todosSecuencia: 'Todos en secuencia', triples: 'Triples' } },
  { title: 'Cash3 Box', gameType: 'cash3Box', fields: { threeWay: '3-Way: 2 identicos', sixWay: '6-Way: 3 unicos' } },
  { title: 'Play4 Straight', gameType: 'play4Straight', fields: { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' } },
  { title: 'Play4 Box', gameType: 'play4Box', fields: { twentyFourWay: '24-Way: 4 unicos', twelveWay: '12-Way: 2 identicos', sixWay: '6-Way: 2 identicos', fourWay: '4-Way: 3 identicos' } },
  { title: 'Super Pale', gameType: 'superPale', fields: { primerPago: 'Primer Pago' } },
  { title: 'Bolita 1', gameType: 'bolita1', fields: { primerPago: 'Primer Pago' } },
  { title: 'Bolita 2', gameType: 'bolita2', fields: { primerPago: 'Primer Pago' } },
  { title: 'Singulacion 1', gameType: 'singulacion1', fields: { primerPago: 'Primer Pago' } },
  { title: 'Singulacion 2', gameType: 'singulacion2', fields: { primerPago: 'Primer Pago' } },
  { title: 'Singulacion 3', gameType: 'singulacion3', fields: { primerPago: 'Primer Pago' } },
  { title: 'Pick Two', gameType: 'pickTwo', fields: { primerPago: 'Primer Pago', dobles: 'Dobles' } },
  { title: 'Pick5 Straight', gameType: 'pick5Straight', fields: { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' } }
];

// Commission fields configuration
export const COMMISSION_FIELDS = [
  { label: 'General', gameType: 'general' },
  { label: 'Directo', gameType: 'directo' },
  { label: 'Pale', gameType: 'pale' },
  { label: 'Tripleta', gameType: 'tripleta' },
  { label: 'Cash3 Straight', gameType: 'cash3Straight' },
  { label: 'Cash3 Box', gameType: 'cash3Box' },
  { label: 'Play4 Straight', gameType: 'play4Straight' },
  { label: 'Play4 Box', gameType: 'play4Box' },
  { label: 'Super Pale', gameType: 'superPale' },
  { label: 'Bolita 1', gameType: 'bolita1' },
  { label: 'Bolita 2', gameType: 'bolita2' },
  { label: 'Singulacion 1', gameType: 'singulacion1' },
  { label: 'Singulacion 2', gameType: 'singulacion2' },
  { label: 'Singulacion 3', gameType: 'singulacion3' },
  { label: 'Pick Two', gameType: 'pickTwo' },
  { label: 'Pick5 Straight', gameType: 'pick5Straight' }
];

// Footer shortcut buttons
export const FOOTER_SHORTCUTS_ROW1 = ['1RA [1]', '2DA [2]', '3RA [3]', 'DOBLES [4]', 'PALE [5]', 'SUPER PALE [6]'];
export const FOOTER_SHORTCUTS_ROW2 = ['TRIPLETA [7]', 'CASH 3 [8]', 'TRIPLES [9]', 'PLAY 4 [10]', 'PICK 5 [11]', 'PICK 2 [12]'];
