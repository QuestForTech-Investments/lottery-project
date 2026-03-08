import api from './api';

export interface TransactionGroupAPI {
  groupId: number;
  groupNumber: string;
  zoneId: number | null;
  zoneName: string | null;
  notes: string | null;
  isAutomatic: boolean;
  status: string;
  createdAt: string | null;
  createdBy: number | null;
  createdByName: string | null;
  entities: string | null;
  lines?: TransactionGroupLineAPI[];
}

export interface TransactionGroupLineAPI {
  lineId: number;
  transactionType: string;
  entity1Type: string;
  entity1Id: number;
  entity1Name: string;
  entity1Code: string;
  entity1InitialBalance: number;
  entity1FinalBalance: number;
  entity2Type: string | null;
  entity2Id: number | null;
  entity2Name: string | null;
  entity2Code: string | null;
  entity2InitialBalance: number;
  entity2FinalBalance: number;
  debit: number;
  credit: number;
  expenseCategory: string | null;
  notes: string | null;
  showInBanca: boolean;
}

export interface CreateTransactionGroupLineData {
  transactionType: string;
  entity1Type: string;
  entity1Id: number;
  entity1Name: string;
  entity1Code: string;
  entity1InitialBalance: number;
  entity1FinalBalance: number;
  entity2Type?: string | null;
  entity2Id?: number | null;
  entity2Name?: string | null;
  entity2Code?: string | null;
  entity2InitialBalance: number;
  entity2FinalBalance: number;
  debit: number;
  credit: number;
  expenseCategory?: string | null;
  notes?: string | null;
  showInBanca: boolean;
}

export interface CreateTransactionGroupData {
  zoneId?: number | null;
  notes?: string | null;
  lines: CreateTransactionGroupLineData[];
}

const getTzOffset = (): string => String(new Date().getTimezoneOffset());

export const getTransactionGroups = async (params?: {
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<TransactionGroupAPI[]> => {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.search) searchParams.set('search', params.search);
  searchParams.set('tzOffset', getTzOffset());

  const query = searchParams.toString();
  return await api.get(`/transaction-groups${query ? `?${query}` : ''}`) as TransactionGroupAPI[];
};

export const getTransactionGroup = async (id: number): Promise<TransactionGroupAPI> => {
  return await api.get(`/transaction-groups/${id}`) as TransactionGroupAPI;
};

export const createTransactionGroup = async (data: CreateTransactionGroupData): Promise<TransactionGroupAPI> => {
  return await api.post('/transaction-groups', data) as TransactionGroupAPI;
};

export const deleteTransactionGroup = async (id: number): Promise<void> => {
  await api.delete(`/transaction-groups/${id}`);
};

export interface TransactionLineReportAPI {
  lineId: number;
  groupId: number;
  groupNumber: string;
  transactionType: string;
  createdAt: string | null;
  createdByName: string | null;
  entity1Name: string;
  entity1Code: string;
  entity2Name: string | null;
  entity2Code: string | null;
  entity1InitialBalance: number;
  entity2InitialBalance: number;
  debit: number;
  credit: number;
  entity1FinalBalance: number;
  entity2FinalBalance: number;
  notes: string | null;
}

export interface TransactionLineFilterOptions {
  entityTypes: string[];
  transactionTypes: string[];
  createdByUsers: string[];
}

export interface EntityOption {
  name: string;
  code: string;
  id: number;
}

export const getTransactionLineFilterOptions = async (): Promise<TransactionLineFilterOptions> => {
  return await api.get('/transaction-groups/lines/filter-options') as TransactionLineFilterOptions;
};

export const getEntitiesByType = async (entityType: string): Promise<EntityOption[]> => {
  return await api.get(`/transaction-groups/lines/entities?entityType=${encodeURIComponent(entityType)}`) as EntityOption[];
};

export const getTransactionLines = async (params?: {
  startDate?: string;
  endDate?: string;
  entityType?: string;
  transactionType?: string;
  entityName?: string;
  createdBy?: string;
  limit?: number;
}): Promise<TransactionLineReportAPI[]> => {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.entityType) searchParams.set('entityType', params.entityType);
  if (params?.transactionType) searchParams.set('transactionType', params.transactionType);
  if (params?.entityName) searchParams.set('entityName', params.entityName);
  if (params?.createdBy) searchParams.set('createdBy', params.createdBy);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  searchParams.set('tzOffset', getTzOffset());

  const query = searchParams.toString();
  return await api.get(`/transaction-groups/lines${query ? `?${query}` : ''}`) as TransactionLineReportAPI[];
};
