import api from './api';

export interface AccountableEntityAPI {
  entityId: number;
  entityName: string;
  entityCode: string;
  entityType: string;
  zoneId: number | null;
  zoneName: string | null;
  currentBalance: number;
  isActive: boolean;
  createdAt: string | null;
}

export interface CreateAccountableEntityData {
  entityName: string;
  entityCode: string;
  entityType: string;
  zoneId: number | null;
}

export interface UpdateAccountableEntityData {
  entityName?: string;
  entityCode?: string;
  entityType?: string;
  zoneId?: number | null;
  isActive?: boolean;
}

export const getAccountableEntities = async (params?: {
  search?: string;
  entityType?: string;
  zoneId?: number;
  isActive?: boolean;
}): Promise<AccountableEntityAPI[]> => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.entityType) searchParams.set('entityType', params.entityType);
  if (params?.zoneId) searchParams.set('zoneId', String(params.zoneId));
  if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));

  const query = searchParams.toString();
  return await api.get(`/accountable-entities${query ? `?${query}` : ''}`) as AccountableEntityAPI[];
};

export const getAccountableEntity = async (id: number): Promise<AccountableEntityAPI> => {
  return await api.get(`/accountable-entities/${id}`) as AccountableEntityAPI;
};

export const createAccountableEntity = async (data: CreateAccountableEntityData): Promise<AccountableEntityAPI> => {
  return await api.post('/accountable-entities', data) as AccountableEntityAPI;
};

export const updateAccountableEntity = async (id: number, data: UpdateAccountableEntityData): Promise<AccountableEntityAPI> => {
  return await api.put(`/accountable-entities/${id}`, data) as AccountableEntityAPI;
};

export const deleteAccountableEntity = async (id: number): Promise<void> => {
  await api.delete(`/accountable-entities/${id}`);
};
