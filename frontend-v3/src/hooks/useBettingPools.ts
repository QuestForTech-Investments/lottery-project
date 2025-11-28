/**
 * Betting Pools Hook
 * TanStack Query-based hook for fetching and managing betting pools
 */

import { useQuery } from '@tanstack/react-query'
import { getAllBettingPools } from '@/services/bettingPoolService'
import { getAllZones } from '@/services/zoneService'
import type { GetBettingPoolsParams } from '@/types/bettingPool'

/**
 * Query keys for React Query cache
 */
export const bettingPoolsKeys = {
  all: ['bettingPools'] as const,
  lists: () => [...bettingPoolsKeys.all, 'list'] as const,
  list: (params: GetBettingPoolsParams) => [...bettingPoolsKeys.lists(), params] as const,
  details: () => [...bettingPoolsKeys.all, 'detail'] as const,
  detail: (id: number) => [...bettingPoolsKeys.details(), id] as const,
}

export const zonesKeys = {
  all: ['zones'] as const,
  lists: () => [...zonesKeys.all, 'list'] as const,
}

/**
 * Hook for fetching betting pools list with pagination and filters
 * Uses TanStack Query for automatic caching, loading states, and refetching
 *
 * @param params - Query parameters (page, pageSize, search, zoneId, isActive)
 * @returns Query result with data, loading, error states
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBettingPools({ page: 1, pageSize: 10 })
 * ```
 */
export const useBettingPools = (params: GetBettingPoolsParams = {}) => {
  return useQuery({
    queryKey: bettingPoolsKeys.list(params),
    queryFn: async () => {
      const result = await getAllBettingPools(params)
      return result
    },
    // Stale time: 5 minutes (data is considered fresh for 5min)
    staleTime: 1000 * 60 * 5,
    // Keep unused data in cache for 10 minutes
    gcTime: 1000 * 60 * 10,
    // Retry failed requests once
    retry: 1,
    // Don't refetch on window focus by default (can be enabled per-component)
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for fetching all zones
 * Uses TanStack Query for automatic caching
 *
 * @returns Query result with zones data
 *
 * @example
 * ```tsx
 * const { data: zones, isLoading } = useZones()
 * ```
 */
export const useZones = () => {
  return useQuery({
    queryKey: zonesKeys.lists(),
    queryFn: async () => {
      const result = await getAllZones({ isActive: true })
      return result
    },
    // Zones don't change often - keep fresh for 15 minutes
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  })
}
