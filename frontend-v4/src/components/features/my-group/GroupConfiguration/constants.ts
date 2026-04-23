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
  directo: { primerPago: '', segundoPago: '', tercerPago: '', dobles: '' },
  pale: { todosSecuencia: '', primerPago: '', segundoPago: '', tercerPago: '' },
  tripleta: { primerPago: '', segundoPago: '' },
  cash3Straight: { todosSecuencia: '', triples: '' },
  cash3Box: { threeWay: '', sixWay: '' },
  cash3FrontStraight: { todosSecuencia: '', triples: '' },
  cash3FrontBox: { threeWay: '', sixWay: '' },
  cash3BackStraight: { todosSecuencia: '', triples: '' },
  cash3BackBox: { threeWay: '', sixWay: '' },
  play4Straight: { todosSecuencia: '', dobles: '' },
  play4Box: { twentyFourWay: '', twelveWay: '', sixWay: '', fourWay: '' },
  superPale: { primerPago: '' },
  bolita1: { primerPago: '' },
  bolita2: { primerPago: '' },
  singulacion1: { primerPago: '' },
  singulacion2: { primerPago: '' },
  singulacion3: { primerPago: '' },
  pickTwo: { primerPago: '', dobles: '' },
  pickTwoFront: { primerPago: '', dobles: '' },
  pickTwoBack: { primerPago: '', dobles: '' },
  pickTwoMiddle: { primerPago: '', dobles: '' },
  pick5Straight: { todosSecuencia: '', dobles: '' },
  pick5Box: { fiveWay: '', tenWay: '', twentyWay: '', thirtyWay: '' }
};

// Initial commissions data
export const INITIAL_COMMISSIONS_DATA: CommissionsData = {
  general: '',
  directo: '',
  pale: '',
  tripleta: '',
  cash3Straight: '',
  cash3Box: '',
  cash3FrontStraight: '',
  cash3FrontBox: '',
  cash3BackStraight: '',
  cash3BackBox: '',
  play4Straight: '',
  play4Box: '',
  superPale: '',
  bolita1: '',
  bolita2: '',
  singulacion1: '',
  singulacion2: '',
  singulacion3: '',
  pickTwo: '',
  pickTwoFront: '',
  pickTwoBack: '',
  pickTwoMiddle: '',
  pick5Straight: '',
  pick5Box: ''
};

// Initial footer data (up to 6 lines, 30 chars each)
export const INITIAL_FOOTER_DATA: FooterData = {
  line1: '',
  line2: '',
  line3: '',
  line4: '',
  line5: '',
  line6: ''
};

// Prize fields configuration for each game type
export const PRIZE_FIELDS_CONFIG: PrizeFieldConfig[] = [
  { title: 'Directo', gameType: 'directo', fields: { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago', dobles: 'Dobles' } },
  { title: 'Pale', gameType: 'pale', fields: { todosSecuencia: 'Todos en secuencia', primerPago: 'Primer Pago', segundoPago: 'Segundo Pago', tercerPago: 'Tercer Pago' } },
  { title: 'Tripleta', gameType: 'tripleta', fields: { primerPago: 'Primer Pago', segundoPago: 'Segundo Pago' } },
  { title: 'Super Pale', gameType: 'superPale', fields: { primerPago: 'Primer Pago' } },
  { title: 'Cash3 Straight', gameType: 'cash3Straight', fields: { todosSecuencia: 'Todos en secuencia', triples: 'Triples' } },
  { title: 'Cash3 Box', gameType: 'cash3Box', fields: { threeWay: '3-Way: 2 identicos', sixWay: '6-Way: 3 unicos' } },
  { title: 'Cash3 Front Straight', gameType: 'cash3FrontStraight', fields: { todosSecuencia: 'Todos en secuencia', triples: 'Triples' } },
  { title: 'Cash3 Front Box', gameType: 'cash3FrontBox', fields: { threeWay: '3-Way: 2 identicos', sixWay: '6-Way: 3 unicos' } },
  { title: 'Cash3 Back Straight', gameType: 'cash3BackStraight', fields: { todosSecuencia: 'Todos en secuencia', triples: 'Triples' } },
  { title: 'Cash3 Back Box', gameType: 'cash3BackBox', fields: { threeWay: '3-Way: 2 identicos', sixWay: '6-Way: 3 unicos' } },
  { title: 'Play4 Straight', gameType: 'play4Straight', fields: { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' } },
  { title: 'Play4 Box', gameType: 'play4Box', fields: { twentyFourWay: '24-Way: 4 unicos', twelveWay: '12-Way: 2 identicos', sixWay: '6-Way: 2 identicos', fourWay: '4-Way: 3 identicos' } },
  { title: 'Pick Two', gameType: 'pickTwo', fields: { primerPago: 'Primer Pago', dobles: 'Dobles' } },
  { title: 'Pick Two Front', gameType: 'pickTwoFront', fields: { primerPago: 'Primer Pago', dobles: 'Dobles' } },
  { title: 'Pick Two Back', gameType: 'pickTwoBack', fields: { primerPago: 'Primer Pago', dobles: 'Dobles' } },
  { title: 'Pick Two Middle', gameType: 'pickTwoMiddle', fields: { primerPago: 'Primer Pago', dobles: 'Dobles' } },
  { title: 'Pick5 Straight', gameType: 'pick5Straight', fields: { todosSecuencia: 'Todos en secuencia', dobles: 'Dobles' } },
  { title: 'Pick5 Box', gameType: 'pick5Box', fields: { fiveWay: '5-Way', tenWay: '10-Way', twentyWay: '20-Way', thirtyWay: '30-Way' } },
  { title: 'Bolita 1', gameType: 'bolita1', fields: { primerPago: 'Primer Pago' } },
  { title: 'Bolita 2', gameType: 'bolita2', fields: { primerPago: 'Primer Pago' } },
  { title: 'Singulacion 1', gameType: 'singulacion1', fields: { primerPago: 'Primer Pago' } },
  { title: 'Singulacion 2', gameType: 'singulacion2', fields: { primerPago: 'Primer Pago' } },
  { title: 'Singulacion 3', gameType: 'singulacion3', fields: { primerPago: 'Primer Pago' } }
];

// Commission fields configuration
export const COMMISSION_FIELDS = [
  { label: 'General', gameType: 'general' },
  { label: 'Directo', gameType: 'directo' },
  { label: 'Pale', gameType: 'pale' },
  { label: 'Tripleta', gameType: 'tripleta' },
  { label: 'Super Pale', gameType: 'superPale' },
  { label: 'Cash3 Straight', gameType: 'cash3Straight' },
  { label: 'Cash3 Box', gameType: 'cash3Box' },
  { label: 'Cash3 Front Straight', gameType: 'cash3FrontStraight' },
  { label: 'Cash3 Front Box', gameType: 'cash3FrontBox' },
  { label: 'Cash3 Back Straight', gameType: 'cash3BackStraight' },
  { label: 'Cash3 Back Box', gameType: 'cash3BackBox' },
  { label: 'Play4 Straight', gameType: 'play4Straight' },
  { label: 'Play4 Box', gameType: 'play4Box' },
  { label: 'Pick Two', gameType: 'pickTwo' },
  { label: 'Pick Two Front', gameType: 'pickTwoFront' },
  { label: 'Pick Two Back', gameType: 'pickTwoBack' },
  { label: 'Pick Two Middle', gameType: 'pickTwoMiddle' },
  { label: 'Pick5 Straight', gameType: 'pick5Straight' },
  { label: 'Pick5 Box', gameType: 'pick5Box' },
  { label: 'Bolita 1', gameType: 'bolita1' },
  { label: 'Bolita 2', gameType: 'bolita2' },
  { label: 'Singulacion 1', gameType: 'singulacion1' },
  { label: 'Singulacion 2', gameType: 'singulacion2' },
  { label: 'Singulacion 3', gameType: 'singulacion3' }
];

// Footer shortcut buttons
export const FOOTER_SHORTCUTS_ROW1 = ['1RA [1]', '2DA [2]', '3RA [3]', 'DOBLES [4]', 'PALE [5]', 'SUPER PALE [6]'];
export const FOOTER_SHORTCUTS_ROW2 = ['TRIPLETA [7]', 'CASH 3 [8]', 'TRIPLES [9]', 'PLAY 4 [10]', 'PICK 5 [11]', 'PICK 2 [12]'];
