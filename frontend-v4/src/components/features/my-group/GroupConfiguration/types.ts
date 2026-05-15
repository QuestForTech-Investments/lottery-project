/**
 * GroupConfiguration Types
 *
 * Type definitions for group configuration component.
 */

// Game types
export type GameType =
  | 'directo'
  | 'pale'
  | 'tripleta'
  | 'cash3Straight'
  | 'cash3Box'
  | 'cash3FrontStraight'
  | 'cash3FrontBox'
  | 'cash3BackStraight'
  | 'cash3BackBox'
  | 'play4Straight'
  | 'play4Box'
  | 'superPale'
  | 'bolita1'
  | 'bolita2'
  | 'singulacion1'
  | 'singulacion2'
  | 'singulacion3'
  | 'pickTwo'
  | 'pickTwoFront'
  | 'pickTwoBack'
  | 'pickTwoMiddle'
  | 'pick5Straight'
  | 'pick5Box';

// Prize data structures
export interface DirectoPrizes {
  primerPago: string;
  segundoPago: string;
  tercerPago: string;
  dobles: string;
}

export interface PalePrizes {
  todosSecuencia: string;
  primerPago: string;
  segundoPago: string;
  tercerPago: string;
}

export interface PrizesData {
  directo: DirectoPrizes;
  pale: PalePrizes;
  tripleta: { primerPago: string; segundoPago: string };
  cash3Straight: { todosSecuencia: string; triples: string };
  cash3Box: { threeWay: string; sixWay: string };
  cash3FrontStraight: { todosSecuencia: string; triples: string };
  cash3FrontBox: { threeWay: string; sixWay: string };
  cash3BackStraight: { todosSecuencia: string; triples: string };
  cash3BackBox: { threeWay: string; sixWay: string };
  play4Straight: { todosSecuencia: string; dobles: string };
  play4Box: { twentyFourWay: string; twelveWay: string; sixWay: string; fourWay: string };
  superPale: { primerPago: string };
  bolita1: { primerPago: string };
  bolita2: { primerPago: string };
  singulacion1: { primerPago: string };
  singulacion2: { primerPago: string };
  singulacion3: { primerPago: string };
  pickTwo: { primerPago: string; dobles: string };
  pickTwoFront: { primerPago: string; dobles: string };
  pickTwoBack: { primerPago: string; dobles: string };
  pickTwoMiddle: { primerPago: string; dobles: string };
  pick5Straight: { todosSecuencia: string; dobles: string };
  pick5Box: { fiveWay: string; tenWay: string; twentyWay: string; thirtyWay: string; sixtyWay: string; oneTwentyWay: string };
}

// Commissions
export interface CommissionsData {
  general: string;
  directo: string;
  pale: string;
  tripleta: string;
  cash3Straight: string;
  cash3Box: string;
  cash3FrontStraight: string;
  cash3FrontBox: string;
  cash3BackStraight: string;
  cash3BackBox: string;
  play4Straight: string;
  play4Box: string;
  superPale: string;
  bolita1: string;
  bolita2: string;
  singulacion1: string;
  singulacion2: string;
  singulacion3: string;
  pickTwo: string;
  pickTwoFront: string;
  pickTwoBack: string;
  pickTwoMiddle: string;
  pick5Straight: string;
  pick5Box: string;
  [key: string]: string;
}

// Footer
export interface FooterData {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
  line7: string;
  line8: string;
}

// Allowed values structure
export interface AllowedValuesType {
  directo: {
    primerPago: string[];
    segundoPago: string[];
    tercerPago: string[];
    dobles: string[];
  };
  pale: {
    todosSecuencia: string[];
    primerPago: string[];
    segundoPago: string[];
    tercerPago: string[];
  };
  pickTwo: {
    primerPago: string[];
    dobles: string[];
  };
}

// Component props
export interface ValueChipProps {
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface PrizesSubTabProps {
  prizesData: PrizesData;
  onPrizeChange: (gameType: keyof PrizesData, field: string, value: string) => void;
}

export interface CommissionsSubTabProps {
  commissionsData: CommissionsData;
  onCommissionChange: (gameType: string, value: string) => void;
}

export interface AllowedValuesTabProps {
  prizesData: PrizesData;
  onPrizeChange: (gameType: keyof PrizesData, field: string, value: string) => void;
}

export interface FooterTabProps {
  footerData: FooterData;
  onFooterChange: (field: keyof FooterData, value: string) => void;
}

// Prize fields configuration
export interface PrizeFieldConfig {
  title: string;
  gameType: keyof PrizesData;
  fields: Record<string, string>;
}
