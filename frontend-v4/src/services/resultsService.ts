/**
 * Results Service
 * Handles all API requests related to lottery results
 */

import api from './api'

// Types
export interface ResultDto {
  resultId: number
  drawId: number
  drawName: string
  winningNumber: string
  additionalNumber: string | null
  position: number | null
  resultDate: string
  createdAt: string | null
  createdBy: number | null
  updatedAt: string | null
  approvedAt: string | null
  approvedBy: number | null
  // Parsed numbers for display
  num1: string
  num2: string
  num3: string
  cash3: string
  play4: string
  pick5: string
}

export interface CreateResultDto {
  drawId: number
  winningNumber: string
  additionalNumber?: string | null
  position?: number | null
  resultDate: string
}

export interface ResultLogDto {
  drawName: string
  username: string
  resultDate: string
  createdAt: string | null
  winningNumbers: string
}

export interface DrawForResults {
  drawId: number
  drawName: string
  abbreviation: string
  drawTime: string // Format: "HH:mm:ss" e.g., "10:00:00"
  color?: string   // Draw display color (optional)
}

export interface ExternalResultDto {
  lotteryName: string
  gameName: string
  drawTime: string
  drawDate: string
  winningNumber: string
  additionalNumber: string | null
  numbers: string[]
  source: string
  fetchedAt: string
}

export interface FetchResultsResponse {
  success: boolean
  message: string
  resultsFetched: number
  resultsSaved: number
  ticketsProcessed: number
  winnersFound: number
  errors: string[]
  results: ExternalResultDto[]
}

export interface DrawMapping {
  externalLotteryName: string
  externalGameName: string
  externalDrawTime: string
  internalDrawId: number
  internalDrawName: string
}

/**
 * Get all results for a specific date
 */
export const getResults = async (date?: string, drawId?: number): Promise<ResultDto[]> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (drawId) params.append('drawId', drawId.toString())

  const queryString = params.toString()
  const endpoint = `/results${queryString ? `?${queryString}` : ''}`

  const results = await api.get<ResultDto[]>(endpoint)
  return results || []
}

/**
 * Get a specific result by ID
 */
export const getResult = async (id: number): Promise<ResultDto | null> => {
  return api.get<ResultDto>(`/results/${id}`)
}

/**
 * Get results for a specific draw
 */
export const getResultsByDraw = async (
  drawId: number,
  startDate?: string,
  endDate?: string
): Promise<ResultDto[]> => {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const queryString = params.toString()
  const endpoint = `/results/draw/${drawId}${queryString ? `?${queryString}` : ''}`

  const results = await api.get<ResultDto[]>(endpoint)
  return results || []
}

/**
 * Create or update a result
 */
export const createResult = async (data: CreateResultDto): Promise<ResultDto | null> => {
  return api.post<ResultDto>('/results', data)
}

/**
 * Update a result
 */
export const updateResult = async (id: number, data: CreateResultDto): Promise<ResultDto | null> => {
  return api.put<ResultDto>(`/results/${id}`, data)
}

/**
 * Delete a result
 */
export const deleteResult = async (id: number): Promise<void> => {
  await api.delete(`/results/${id}`)
}

/**
 * Approve a result
 */
export const approveResult = async (id: number): Promise<ResultDto | null> => {
  return api.post<ResultDto>(`/results/${id}/approve`)
}

/**
 * Get result logs
 */
export const getResultLogs = async (date?: string): Promise<ResultLogDto[]> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)

  const queryString = params.toString()
  const endpoint = `/results/logs${queryString ? `?${queryString}` : ''}`

  const logs = await api.get<ResultLogDto[]>(endpoint)
  return logs || []
}

/**
 * Get available draws for results, filtered by date's day of week
 */
export const getDrawsForResults = async (date?: string): Promise<DrawForResults[]> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)

  const queryString = params.toString()
  const endpoint = `/results/draws${queryString ? `?${queryString}` : ''}`

  const draws = await api.get<DrawForResults[]>(endpoint)
  return draws || []
}

/**
 * Fetch external results (trigger external API/scraping)
 */
export const fetchExternalResults = async (date?: string): Promise<FetchResultsResponse | null> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)

  const queryString = params.toString()
  const endpoint = `/external-results/fetch${queryString ? `?${queryString}` : ''}`

  return api.post<FetchResultsResponse>(endpoint)
}

/**
 * Refresh external results via the Results API
 * This is more efficient - only fetches after scheduled draw times when using paid APIs
 */
export const refreshResults = async (date?: string): Promise<FetchResultsResponse | null> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)

  const queryString = params.toString()
  const endpoint = `/results/refresh${queryString ? `?${queryString}` : ''}`

  return api.post<FetchResultsResponse>(endpoint)
}

/**
 * Refresh results for a specific draw
 */
export const refreshResultForDraw = async (drawId: number, date?: string): Promise<FetchResultsResponse | null> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)

  const queryString = params.toString()
  const endpoint = `/results/refresh/${drawId}${queryString ? `?${queryString}` : ''}`

  return api.post<FetchResultsResponse>(endpoint)
}

/**
 * Get configured draw mappings
 */
export const getDrawMappings = async (): Promise<DrawMapping[]> => {
  const mappings = await api.get<DrawMapping[]>('/external-results/mappings')
  return mappings || []
}

/**
 * Process pending tickets against results
 */
export const processTickets = async (date?: string): Promise<{ success: boolean; message: string; winnersFound: number } | null> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)

  const queryString = params.toString()
  const endpoint = `/external-results/process-tickets${queryString ? `?${queryString}` : ''}`

  return api.post<{ success: boolean; message: string; winnersFound: number }>(endpoint)
}

// Default export object with all methods
const resultsService = {
  getResults,
  getResult,
  getResultsByDraw,
  createResult,
  updateResult,
  deleteResult,
  approveResult,
  getResultLogs,
  getDrawsForResults,
  fetchExternalResults,
  refreshResults,
  refreshResultForDraw,
  getDrawMappings,
  processTickets,
}

export default resultsService
