import api from './api';

export interface SalesBenefitItem {
  date: string;
  label: string;
  ventas: number;
  beneficio: number;
}

export interface BancaBalanceItem {
  bettingPoolId: number;
  code: string;
  name: string;
  reference?: string | null;
  balance: number;
}

export interface BancaDaysWithoutSalesItem {
  bettingPoolId: number;
  code: string;
  name: string;
  reference?: string | null;
  daysWithoutSales: number;
  balance: number;
  lastSaleDate?: string | null;
}

export const getSalesBenefitChart = async (days = 7): Promise<SalesBenefitItem[]> => {
  return await api.get(`/dashboard/sales-benefit-chart?days=${days}`) as SalesBenefitItem[] || [];
};

export interface SalesByLotteryItem {
  lotteryId: number;
  name: string;
  ventas: number;
  premios: number;
  tickets: number;
}

export const getSalesByLottery = async (): Promise<SalesByLotteryItem[]> => {
  return await api.get(`/dashboard/sales-by-lottery`) as SalesByLotteryItem[] || [];
};

export const getTopPositiveBancas = async (limit = 10): Promise<BancaBalanceItem[]> => {
  return await api.get(`/dashboard/top-positive-bancas?limit=${limit}`) as BancaBalanceItem[] || [];
};

export const getTopNegativeBancas = async (limit = 10): Promise<BancaBalanceItem[]> => {
  return await api.get(`/dashboard/top-negative-bancas?limit=${limit}`) as BancaBalanceItem[] || [];
};

export const getBancasWithoutSales = async (limit = 10): Promise<BancaDaysWithoutSalesItem[]> => {
  return await api.get(`/dashboard/bancas-without-sales?limit=${limit}`) as BancaDaysWithoutSalesItem[] || [];
};
