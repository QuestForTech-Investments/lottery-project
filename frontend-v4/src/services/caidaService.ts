import api from './api';

export interface CaidaStatusItem {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  fallType: string;
  fallPercentage: number;
  accumulatedFall: number;
}

export const getCaidaStatus = async (zoneId?: number): Promise<CaidaStatusItem[]> => {
  const params = zoneId ? `?zoneId=${zoneId}` : '';
  return await api.get(`/caida/status${params}`) as CaidaStatusItem[];
};
