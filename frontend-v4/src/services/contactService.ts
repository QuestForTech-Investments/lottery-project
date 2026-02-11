import { api } from './api';

const API_ENDPOINT = '/contacts';

export const clearContactsByBettingPool = async (bettingPoolId: number): Promise<{ message: string; deletedCount: number }> => {
  const data = await api.delete<{ message: string; deletedCount: number }>(`${API_ENDPOINT}/by-betting-pool/${bettingPoolId}`);
  return data as { message: string; deletedCount: number };
};
