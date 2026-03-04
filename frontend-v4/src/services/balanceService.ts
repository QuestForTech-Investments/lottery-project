import api from './api';

export interface BettingPoolBalanceAPI {
  bettingPoolId: number;
  bettingPoolCode: string;
  bettingPoolName: string;
  users: string | null;
  reference: string | null;
  zoneId: number;
  zoneName: string | null;
  balance: number;
  loans: number;
  lastUpdated: string | null;
}

export interface BettingPoolBalanceData {
  id: number;
  numero: string;
  nombre: string;
  usuarios: string;
  referencia: string;
  zona: string;
  zoneId: number;
  balance: number;
  prestamos: number;
}

export interface BalanceZone {
  id: number;
  name: string;
}

/**
 * Get betting pool balances from API
 */
export const getBettingPoolBalances = async (): Promise<BettingPoolBalanceData[]> => {
  const apiData = await api.get('/balances/betting-pools') as BettingPoolBalanceAPI[];

  return apiData.map(item => ({
    id: item.bettingPoolId,
    numero: item.bettingPoolCode,
    nombre: item.bettingPoolName,
    usuarios: item.users || '',
    referencia: item.reference || '',
    zona: item.zoneName || '',
    zoneId: item.zoneId,
    balance: item.balance,
    prestamos: item.loans,
  }));
};

/**
 * Extract unique zones from balance data
 */
export const extractZonesFromBalances = (data: BettingPoolBalanceData[]): BalanceZone[] => {
  const zoneMap = new Map<number, string>();
  data.forEach(item => {
    if (item.zoneId && item.zona) {
      zoneMap.set(item.zoneId, item.zona);
    }
  });
  return Array.from(zoneMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
