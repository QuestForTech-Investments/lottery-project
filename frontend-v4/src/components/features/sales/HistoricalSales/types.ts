/**
 * Shared types for HistoricalSales component
 */

export interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
}

export interface Grupo {
  id: number;
  name: string;
}

export interface BancaData {
  ref: string;
  codigo: string;
  tickets: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  caida: number;
  gastos: number;
  final: number;
}

export interface SorteoData {
  sorteo: string;
  tickets: number;
  lineas: number;
  ganadores: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
}

export interface CombinacionData {
  combinacion: string;
  sorteo: string;
  tipoApuesta: string;
  lineas: number;
  totalVendido: number;
  comisiones: number;
  comisiones2: number;
  premios: number;
  balances: number;
}

export interface ZonaData {
  zona?: string;
  nombre?: string;
  bancasActivas?: number;
  tickets?: number;
  lineas?: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  p?: number;
  l?: number;
  w?: number;
  total?: number;
  caida?: number;
  final?: number;
  balance?: number;
}

export interface Totals {
  tickets: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  caida: number;
  gastos: number;
  final: number;
}

// API Response interfaces
export interface BettingPoolSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

export interface DrawSalesDto {
  drawId: number;
  drawName: string;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

export interface DrawSalesResponse {
  draws: DrawSalesDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
}

export interface CombinationSalesDto {
  betNumber: string;
  drawName: string;
  betTypeName: string;
  lineCount: number;
  totalSold: number;
  totalCommissions: number;
  totalPrizes: number;
  balance: number;
}

export interface CombinationSalesResponse {
  combinations: CombinationSalesDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
}

export interface ZoneSalesDto {
  zoneId: number;
  zoneName: string;
  bettingPoolCount: number;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  totalNet: number;
  fall: number;
  final: number;
  balance: number;
}

export interface ZoneSalesResponse {
  zones: ZoneSalesDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
}

// Common props for tab components
export interface TabCommonProps {
  fechaInicial: string;
  fechaFinal: string;
  zonas: Zona[];
  zonasList: Zona[];
  setFechaInicial: (date: string) => void;
  setFechaFinal: (date: string) => void;
  setZonas: (zonas: Zona[]) => void;
  loading: boolean;
  onFilter: () => void;
}
