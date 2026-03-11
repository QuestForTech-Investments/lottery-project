import { api } from './api';

export interface LoanAPI {
  loanId: number;
  loanNumber: string;
  entityType: string;
  entityId: number;
  entityName: string;
  entityCode: string;
  principalAmount: number;
  interestRate: number;
  installmentAmount: number;
  frequency: string;
  paymentDay: number | null;
  startDate: string;
  totalPaid: number;
  remainingBalance: number;
  status: string;
  notes: string | null;
  createdAt: string;
  createdByName: string | null;
  payments?: LoanPaymentAPI[];
  paymentCount?: number;
}

export interface LoanPaymentAPI {
  paymentId: number;
  loanId: number;
  paymentDate: string;
  amountPaid: number;
  notes: string | null;
  createdAt: string;
  createdByName: string | null;
}

export interface CreateLoanData {
  entityType: string;
  entityId: number;
  entityName: string;
  entityCode: string;
  principalAmount: number;
  installmentAmount: number;
  frequency: string;
  paymentDay?: number | null;
  startDate: string;
  interestRate: number;
  notes?: string;
}

export interface CreateLoanPaymentData {
  amountPaid: number;
  notes?: string;
}

export const getLoans = async (params?: {
  status?: string;
  zoneId?: number;
  search?: string;
  limit?: number;
}): Promise<LoanAPI[]> => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.zoneId) query.set('zoneId', String(params.zoneId));
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return api.get(`/loans${qs ? `?${qs}` : ''}`);
};

export const getLoan = async (id: number): Promise<LoanAPI> => {
  return api.get(`/loans/${id}`);
};

export const createLoan = async (data: CreateLoanData): Promise<LoanAPI> => {
  return api.post('/loans', data);
};

export const createLoanPayment = async (loanId: number, data: CreateLoanPaymentData): Promise<LoanPaymentAPI> => {
  return api.post(`/loans/${loanId}/payments`, data);
};

export interface UpdateLoanData {
  installmentAmount?: number;
  frequency?: string;
  paymentDay?: number | null;
  interestRate?: number;
  notes?: string;
}

export const updateLoan = async (id: number, data: UpdateLoanData): Promise<void> => {
  return api.put(`/loans/${id}`, data);
};

export const cancelLoan = async (id: number): Promise<void> => {
  return api.delete(`/loans/${id}`);
};
