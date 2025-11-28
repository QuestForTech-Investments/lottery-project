/**
 * Zone Types
 * TypeScript definitions for Zones module
 */

export interface Zone {
  zoneId: number
  name: string
  code?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface GetZonesParams {
  isActive?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}
