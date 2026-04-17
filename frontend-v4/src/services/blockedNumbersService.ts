import api from './api';

export interface BlockedNumber {
  blockedNumberId: number;
  drawId: number;
  drawName?: string | null;
  gameTypeId: number;
  gameTypeName?: string | null;
  betNumber: string;
  expirationDate?: string | null;
  createdAt: string;
  isExpired: boolean;
}

export interface BlockedNumberCreateItem {
  drawId: number;
  gameTypeId: number;
  betNumber: string;
  expirationDate?: string | null;
}

export const getBlockedNumbers = async (includeExpired = false): Promise<BlockedNumber[]> => {
  const params = includeExpired ? '?includeExpired=true' : '';
  return await api.get(`/blocked-numbers${params}`) as BlockedNumber[] || [];
};

export const createBlockedNumbers = async (items: BlockedNumberCreateItem[]): Promise<void> => {
  await api.post('/blocked-numbers', { items });
};

export const deleteBlockedNumber = async (id: number): Promise<void> => {
  await api.delete(`/blocked-numbers/${id}`);
};
