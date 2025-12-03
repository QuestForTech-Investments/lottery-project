/**
 * Play Monitoring Service
 * Handles play summary API calls for monitoring bet numbers
 */

import api from './api'

// Types
export interface PlaySummaryParams {
  drawId: number;
  date: string;
  zoneIds?: number[];
  bettingPoolId?: number;
}

export interface PlaySummary {
  betNumber: string;
  salesAmount: number;
  limitAmount: number;
  availableAmount: number;
  percentage: number;
}

export interface PlaySummaryResponse {
  items: PlaySummary[];
  totalNumbers: number;
  totalSales: number;
  drawName?: string;
  date: string;
}

/**
 * Get play summary (sales by bet number) for a specific draw and date
 */
export const getPlaysSummary = async (params: PlaySummaryParams): Promise<PlaySummaryResponse> => {
  const queryParams = new URLSearchParams()

  queryParams.append('drawId', String(params.drawId))
  queryParams.append('date', params.date)

  if (params.zoneIds && params.zoneIds.length > 0) {
    queryParams.append('zoneIds', params.zoneIds.join(','))
  }

  if (params.bettingPoolId) {
    queryParams.append('bettingPoolId', String(params.bettingPoolId))
  }

  const response = await api.get(`/tickets/plays/summary?${queryParams.toString()}`) as PlaySummaryResponse

  return response
}
