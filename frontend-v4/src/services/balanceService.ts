import api from './api';
import { getCaidaStatus, type CaidaStatusItem } from './caidaService';

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
  caidaAcumulada: number | null;
}

export interface BalanceZone {
  id: number;
  name: string;
}

/**
 * Get betting pool balances from API
 * @param date - Optional date filter (YYYY-MM-DD). Defaults to yesterday on the server.
 */
export const getBettingPoolBalances = async (date?: string): Promise<BettingPoolBalanceData[]> => {
  const params = date ? `?date=${date}` : '';
  const [apiData, caidaData] = await Promise.all([
    api.get(`/balances/betting-pools${params}`) as Promise<BettingPoolBalanceAPI[]>,
    getCaidaStatus().catch((): CaidaStatusItem[] => [])
  ]);

  // Build caída map: bettingPoolId -> accumulatedFall (only for bancas with caída enabled)
  const caidaMap = new Map<number, number>();
  caidaData.forEach(item => caidaMap.set(item.bettingPoolId, item.accumulatedFall));

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
    caidaAcumulada: caidaMap.has(item.bettingPoolId) ? caidaMap.get(item.bettingPoolId)! : null,
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
