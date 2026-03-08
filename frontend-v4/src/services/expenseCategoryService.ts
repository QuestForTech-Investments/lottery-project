import api from './api';

export interface ExpenseCategoryAPI {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
  isActive: boolean;
  createdAt: string | null;
}

export interface CreateExpenseCategoryData {
  categoryName: string;
  parentCategoryId?: number | null;
}

export interface UpdateExpenseCategoryData {
  categoryName?: string;
  parentCategoryId?: number | null;
  isActive?: boolean;
}

export const getExpenseCategories = async (params?: {
  search?: string;
  isActive?: boolean;
  parentOnly?: boolean;
}): Promise<ExpenseCategoryAPI[]> => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
  if (params?.parentOnly !== undefined) searchParams.set('parentOnly', String(params.parentOnly));

  const query = searchParams.toString();
  return await api.get(`/expense-categories${query ? `?${query}` : ''}`) as ExpenseCategoryAPI[];
};

export const getExpenseCategory = async (id: number): Promise<ExpenseCategoryAPI> => {
  return await api.get(`/expense-categories/${id}`) as ExpenseCategoryAPI;
};

export const createExpenseCategory = async (data: CreateExpenseCategoryData): Promise<ExpenseCategoryAPI> => {
  return await api.post('/expense-categories', data) as ExpenseCategoryAPI;
};

export const updateExpenseCategory = async (id: number, data: UpdateExpenseCategoryData): Promise<ExpenseCategoryAPI> => {
  return await api.put(`/expense-categories/${id}`, data) as ExpenseCategoryAPI;
};

export const deleteExpenseCategory = async (id: number): Promise<void> => {
  await api.delete(`/expense-categories/${id}`);
};
