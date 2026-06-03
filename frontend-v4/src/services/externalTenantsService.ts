/**
 * External Tenants service
 *
 * Talks to /api/external-tenants — the backend registry of partner tenants
 * we may proxy reads from (via `can_view_today_sales`) or sync results with
 * (via `share_results`). Used by the "Grupo" dropdown in Ventas del Día
 * and by the ExternalTenantsAdmin page.
 */

import api from './api'

export interface ExternalTenantDto {
  externalTenantId: number
  tenantCode: string
  displayName: string
  apiBaseUrl: string
  logoUrl?: string | null
  sortOrder: number
  isActive: boolean
  canViewTodaySales: boolean
  shareResults: boolean
  /** Last 4 chars of the api_key, eg "…ab12". The real key never leaves the server. */
  apiKeyHint: string
  createdAt: string
  updatedAt?: string | null
}

export interface CreateExternalTenantDto {
  tenantCode: string
  displayName: string
  apiBaseUrl: string
  apiKey: string
  logoUrl?: string | null
  sortOrder?: number
  isActive?: boolean
  canViewTodaySales?: boolean
  shareResults?: boolean
}

export interface UpdateExternalTenantDto {
  displayName: string
  apiBaseUrl: string
  logoUrl?: string | null
  sortOrder?: number
  isActive: boolean
  canViewTodaySales: boolean
  shareResults: boolean
}

export const listExternalTenants = (): Promise<ExternalTenantDto[]> =>
  api.get<ExternalTenantDto[]>('/external-tenants') as unknown as Promise<ExternalTenantDto[]>

export const getExternalTenant = (id: number): Promise<ExternalTenantDto> =>
  api.get<ExternalTenantDto>(`/external-tenants/${id}`) as unknown as Promise<ExternalTenantDto>

export const createExternalTenant = (dto: CreateExternalTenantDto): Promise<ExternalTenantDto> =>
  api.post<ExternalTenantDto>('/external-tenants', dto) as unknown as Promise<ExternalTenantDto>

export const updateExternalTenant = (id: number, dto: UpdateExternalTenantDto): Promise<ExternalTenantDto> =>
  api.put<ExternalTenantDto>(`/external-tenants/${id}`, dto) as unknown as Promise<ExternalTenantDto>

export const deleteExternalTenant = (id: number): Promise<void> =>
  api.delete(`/external-tenants/${id}`) as unknown as Promise<void>

export const rotateExternalTenantKey = (id: number, apiKey: string): Promise<ExternalTenantDto> =>
  api.post<ExternalTenantDto>(`/external-tenants/${id}/rotate-key`, { apiKey }) as unknown as Promise<ExternalTenantDto>

// ─────────────────────────────────────────────────────────────────────
// Proxy shapes — what the partner's /api/public/v1/today-sales* return.
// ─────────────────────────────────────────────────────────────────────

export interface ExternalTodaySalesDto {
  tenantCode: string
  tenantName: string
  date: string
  currency: string
  totalSold: number
  totalPrizes: number
  totalCommissions: number
  totalDiscounts: number
  totalNet: number
  ticketCount: number
}

export interface ExternalTodaySalesByBancaRow {
  bettingPoolId: number
  bettingPoolCode: string
  bettingPoolName: string
  zoneId?: number | null
  zoneName?: string | null
  totalSold: number
  totalPrizes: number
  totalCommissions: number
  totalNet: number
  ticketCount: number
}

export interface ExternalTodaySalesByDrawRow {
  drawId: number
  drawCode: string
  drawName: string
  lotteryCode?: string | null
  lotteryName?: string | null
  totalSold: number
  totalPrizes: number
  totalCommissions: number
  totalNet: number
  ticketCount: number
}

export const getExternalTenantTodaySales = (
  id: number, date?: string,
): Promise<ExternalTodaySalesDto> => {
  const qs = date ? `?date=${date}` : ''
  return api.get<ExternalTodaySalesDto>(`/external-tenants/${id}/today-sales${qs}`) as unknown as Promise<ExternalTodaySalesDto>
}

export const getExternalTenantTodaySalesByBanca = (
  id: number, date?: string,
): Promise<ExternalTodaySalesByBancaRow[]> => {
  const qs = date ? `?date=${date}` : ''
  return api.get<ExternalTodaySalesByBancaRow[]>(`/external-tenants/${id}/today-sales/by-banca${qs}`) as unknown as Promise<ExternalTodaySalesByBancaRow[]>
}

export const getExternalTenantTodaySalesByDraw = (
  id: number, date?: string,
): Promise<ExternalTodaySalesByDrawRow[]> => {
  const qs = date ? `?date=${date}` : ''
  return api.get<ExternalTodaySalesByDrawRow[]>(`/external-tenants/${id}/today-sales/by-draw${qs}`) as unknown as Promise<ExternalTodaySalesByDrawRow[]>
}
