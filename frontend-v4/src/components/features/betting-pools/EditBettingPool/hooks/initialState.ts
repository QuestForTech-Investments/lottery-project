import type { FormData } from './types';

/**
 * Default initial state for the betting pool edit form
 * Contains all 80+ fields with their default values
 */
export const INITIAL_FORM_DATA: FormData = {
  // General
  bettingPoolName: '',
  branchCode: '',
  username: '',
  location: '',
  password: '',
  reference: '',
  confirmPassword: '',
  comment: '',

  // Configuration
  selectedZone: '',
  zoneId: '',
  fallType: '1',
  deactivationBalance: '',
  dailySaleLimit: '',
  dailyBalanceLimit: '',
  todayBalanceLimit: '',
  enableTemporaryBalance: false,
  temporaryAdditionalBalance: '',
  isActive: true,
  winningTicketsControl: false,
  controlWinningTickets: false,
  allowPassPot: true,
  allowJackpot: true,
  printTickets: true,
  printEnabled: true,
  printTicketCopy: true,
  smsOnly: false,
  minutesToCancelTicket: '30',
  ticketsToCancelPerDay: '',
  enableRecharges: true,
  printRechargeReceipt: true,
  allowPasswordChange: true,
  printerType: '1',
  discountProvider: '2',
  discountMode: '1',
  maximumCancelTicketAmount: '',
  maxTicketAmount: '',
  dailyPhoneRechargeLimit: '',
  limitPreference: null,
  creditLimit: '',

  // Footers
  autoFooter: false,
  footerText1: '',
  footerText2: '',
  footerText3: '',
  footerText4: '',
  showBranchInfo: true,
  showDateTime: true,

  // Prizes - Pick 3
  pick3FirstPayment: '',
  pick3SecondPayment: '',
  pick3ThirdPayment: '',
  pick3Doubles: '',

  // Pick 3 Super
  pick3SuperAllSequence: '',
  pick3SuperFirstPayment: '',
  pick3SuperSecondPayment: '',
  pick3SuperThirdPayment: '',

  // Pick 4
  pick4FirstPayment: '',
  pick4SecondPayment: '',

  // Pick 4 Super
  pick4SuperAllSequence: '',
  pick4SuperDoubles: '',

  // Pick 3 NY
  pick3NY_3Way2Identical: '',
  pick3NY_6Way3Unique: '',

  // Pick 4 NY
  pick4NY_AllSequence: '',
  pick4NY_Doubles: '',

  // Pick 4 Extra
  pick4_24Way4Unique: '',
  pick4_12Way2Identical: '',
  pick4_6Way2Identical: '',
  pick4_4Way3Identical: '',

  // Pick 5 Mega
  pick5MegaFirstPayment: '',

  // Pick 5 NY
  pick5NYFirstPayment: '',

  // Pick 5 Bronx
  pick5BronxFirstPayment: '',

  // Pick 5 Brooklyn
  pick5BrooklynFirstPayment: '',

  // Pick 5 Queens
  pick5QueensFirstPayment: '',

  // Pick 5 Extra
  pick5FirstPayment: '',

  // Pick 5 Super
  pick5SuperAllSequence: '',
  pick5SuperDoubles: '',

  // Pick 5 Super Extra
  pick5Super_5Way4Identical: '',
  pick5Super_10Way3Identical: '',
  pick5Super_20Way3Identical: '',
  pick5Super_30Way2Identical: '',
  pick5Super_60Way2Identical: '',
  pick5Super_120Way5Unique: '',

  // Pick 6 Miami
  pick6MiamiFirstPayment: '',
  pick6MiamiDoubles: '',

  // Pick 6 California
  pick6CaliforniaAllSequence: '',
  pick6CaliforniaTriples: '',

  // Pick 6 New York
  pick6NY_3Way2Identical: '',
  pick6NY_6Way3Unique: '',

  // Pick 6 Extra
  pick6AllSequence: '',
  pick6Triples: '',

  // Pick 6 California Extra
  pick6Cali_3Way2Identical: '',
  pick6Cali_6Way3Unique: '',

  // Lotto Classic
  lottoClassicFirstPayment: '',
  lottoClassicDoubles: '',

  // Lotto Plus
  lottoPlusFirstPayment: '',
  lottoPlusDoubles: '',

  // Mega Millions
  megaMillionsFirstPayment: '',
  megaMillionsDoubles: '',

  // Powerball
  powerball4NumbersFirstRound: '',
  powerball3NumbersFirstRound: '',
  powerball2NumbersFirstRound: '',
  powerballLastNumberFirstRound: '',
  powerball4NumbersSecondRound: '',
  powerball3NumbersSecondRound: '',
  powerballLast2NumbersSecondRound: '',
  powerballLastNumberSecondRound: '',
  powerball4NumbersThirdRound: '',
  powerball3NumbersThirdRound: '',
  powerballLast2NumbersThirdRound: '',
  powerballLastNumberThirdRound: '',

  // Schedules
  domingoInicio: '12:00 AM',
  domingoFin: '11:59 PM',
  lunesInicio: '12:00 AM',
  lunesFin: '11:59 PM',
  martesInicio: '12:00 AM',
  martesFin: '11:59 PM',
  miercolesInicio: '12:00 AM',
  miercolesFin: '11:59 PM',
  juevesInicio: '12:00 AM',
  juevesFin: '11:59 PM',
  viernesInicio: '12:00 AM',
  viernesFin: '11:59 PM',
  sabadoInicio: '12:00 AM',
  sabadoFin: '11:59 PM',

  // Draws
  selectedDraws: [],
  anticipatedClosing: '',
  anticipatedClosingDraws: [],

  // Styles
  sellScreenStyles: 'estilo1',
  ticketPrintStyles: 'original',

  // Auto expenses
  autoExpenses: []
};
