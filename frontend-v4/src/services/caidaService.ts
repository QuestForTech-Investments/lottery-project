import api from './api';

export interface CaidaStatusItem {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  fallType: string;
  fallPercentage: number;
  accumulatedFall: number;
}

/**
 * Get caída status. When `date` is in the past, the API returns each banca's
 * accumulated_fall as of that day's close (from caida_history); otherwise it
 * returns the live value. Lets the balances page show historic caída.
 */
export const getCaidaStatus = async (zoneId?: number, date?: string): Promise<CaidaStatusItem[]> => {
  const search = new URLSearchParams();
  if (zoneId) search.set('zoneId', String(zoneId));
  if (date) search.set('date', date);
  const params = search.toString();
  return await api.get(`/caida/status${params ? `?${params}` : ''}`) as CaidaStatusItem[];
};

export const updateAccumulatedFall = async (bettingPoolId: number, accumulatedFall: number): Promise<void> => {
  await api.put(`/caida/${bettingPoolId}/accumulated-fall`, { accumulatedFall });
};
