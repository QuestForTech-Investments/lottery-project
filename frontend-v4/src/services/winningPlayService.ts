/**
 * Winning Plays Service
 * Handles API calls for winning plays (jugadas ganadoras)
 */

import api from './api'

// Types
export interface WinningPlay {
  lineId: number;
  ticketId: number;
  ticketCode: string;
  betTypeName: string;
  betTypeCode: string;
  betNumber: string;
  salesAmount: number;
  prizeAmount: number;
  total: number;
  drawId: number;
  drawName: string;
  drawDate: string;
  drawTime: string;
  winningPosition?: number;
  resultNumber?: string;
  bettingPoolId: number;
  bettingPoolName: string;
  zoneId?: number;
  zoneName?: string;
  createdAt: string;
  isPaid: boolean;
  paidAt?: string;
}

export interface WinningPlaysFilter {
  startDate: string;
  endDate: string;
  drawId?: number;
  zoneIds?: number[];
  bettingPoolId?: number;
  isPaid?: boolean;
  page?: number;
  pageSize?: number;
}

export interface WinningPlaysResponse {
  items: WinningPlay[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  totalSales: number;
  totalPrizes: number;
  grandTotal: number;
}

export interface DrawParam {
  drawId: number;
  lotteryId: number;
  lotteryName: string;
  lotteryCode?: string;
  drawDate: string;
  drawTime: string;
  cutoffTime?: string;
  isActive: boolean;
  isClosed: boolean;
  imageUrl?: string;
}

export interface ZoneParam {
  zoneId: number;
  name: string;
  code?: string;
  isActive: boolean;
}

export interface WinningPlaysParams {
  draws: DrawParam[];
  zones: ZoneParam[];
}

/**
 * Get filter parameters for winning plays (draws and zones)
 */
export const getWinningPlaysParams = async (): Promise<WinningPlaysParams> => {
  const response = await api.get('/winning-plays/params') as WinningPlaysParams
  return response
}

/**
 * Get winning plays with filters
 */
export const getWinningPlays = async (filter: WinningPlaysFilter): Promise<WinningPlaysResponse> => {
  const queryParams = new URLSearchParams()

  queryParams.append('startDate', filter.startDate)
  queryParams.append('endDate', filter.endDate)

  if (filter.drawId) {
    queryParams.append('drawId', String(filter.drawId))
  }

  if (filter.zoneIds && filter.zoneIds.length > 0) {
    queryParams.append('zoneIds', filter.zoneIds.join(','))
  }

  if (filter.bettingPoolId) {
    queryParams.append('bettingPoolId', String(filter.bettingPoolId))
  }

  if (filter.isPaid !== undefined) {
    queryParams.append('isPaid', String(filter.isPaid))
  }

  if (filter.page) {
    queryParams.append('page', String(filter.page))
  }

  if (filter.pageSize) {
    queryParams.append('pageSize', String(filter.pageSize))
  }

  const response = await api.get(`/winning-plays?${queryParams.toString()}`) as WinningPlaysResponse

  return response
}
