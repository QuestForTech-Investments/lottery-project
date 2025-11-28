/**
 * Zone Management Service
 * Handles all zone-related API calls
 */

import api from './api/client'
import type { Zone, GetZonesParams, ApiResponse } from '@/types/zone'

/**
 * Get all zones
 * GET /api/zones
 * @param params - Query parameters
 * @returns Zones list
 */
export const getAllZones = async (params: GetZonesParams = {}): Promise<ApiResponse<Zone[]>> => {
  const queryParams = new URLSearchParams()

  if (params.isActive !== undefined) {
    queryParams.append('isActive', params.isActive.toString())
  }

  const query = queryParams.toString()
  const response = await api.get<Zone[]>(`/zones${query ? `?${query}` : ''}`)

  return {
    success: true,
    data: Array.isArray(response) ? response : [],
  }
}

/**
 * Get zone by ID
 * GET /api/zones/{id}
 * @param zoneId - Zone ID
 * @returns Zone details
 */
export const getZoneById = async (zoneId: number): Promise<ApiResponse<Zone>> => {
  const response = await api.get<Zone>(`/zones/${zoneId}`)
  return {
    success: true,
    data: response,
  }
}

export default {
  getAllZones,
  getZoneById,
}
