import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import { getBettingPools, handleBettingPoolError } from '@/services/bettingPoolService';
import { getAllZones } from '@/services/zoneService';

interface TransformedBettingPool {
  id: number;
  number: number;
  name: string;
  reference: string;
  users: string[];
  isActive: boolean;
  zone: string;
  zoneId: number;
  balance: number;
  accumulatedFall: number;
  loans: number;
  [key: string]: string | number | boolean | string[];
}

interface ZonesMap {
  [key: number]: string;
}

type OrderDirection = 'asc' | 'desc';

interface UseBettingPoolsListReturn {
  bettingPools: TransformedBettingPool[];
  totalBettingPools: number;
  allBettingPoolsCount: number;
  loading: boolean;
  error: string | null;
  availableZones: string[];
  selectedZones: string[];
  handleZoneChange: (zones: string[]) => void;
  searchText: string;
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  orderBy: string;
  order: OrderDirection;
  handleRequestSort: (property: string) => void;
  handleRefresh: () => void;
}

/**
 * Custom hook for managing betting pools list state and operations
 * Handles loading, filtering, pagination, and sorting
 */
const useBettingPoolsList = (): UseBettingPoolsListReturn => {
  // Data state
  const [bettingPools, setBettingPools] = useState<TransformedBettingPool[]>([]);
  const [_zonesMap, setZonesMap] = useState<ZonesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchText, setSearchText] = useState<string>('');
  const [selectedZones, setSelectedZones] = useState<string[]>(['all']);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState<string>('number');
  const [order, setOrder] = useState<OrderDirection>('asc');

  /**
   * Load initial data (zones and betting pools)
   * ⚡ OPTIMIZED: Parallel API calls for faster loading
   */
  const loadInitialData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // ⚡ Performance tracking
      const startTime = performance.now();
      console.log('[START] Loading betting pools list...');

      // ⚡ OPTIMIZATION: Load zones and betting pools in parallel
      const [zonesResponse, response] = await Promise.all([
        getAllZones(),
        getBettingPools({
          page: 1,
          pageSize: 1000 // Load all betting pools for client-side filtering
        })
      ]) as [
        { success: boolean; data?: Array<{ zoneId: number; name: string }> },
        { items?: Array<{
          bettingPoolId: number;
          branchCode?: string;
          bettingPoolCode?: string;
          bettingPoolName?: string;
          reference?: string;
          username?: string;
          isActive: boolean;
          zoneName?: string;
          zoneId: number;
        }> }
      ];

      // Process zones response
      const zMap: ZonesMap = {};
      if (zonesResponse.success && zonesResponse.data) {
        // Create map of zoneId -> zoneName
        zonesResponse.data.forEach(zone => {
          zMap[zone.zoneId] = zone.name;
        });
        setZonesMap(zMap);
        console.log(`[SUCCESS] Loaded ${zonesResponse.data.length} zones`);
      }

      // Check if response has items
      if (!response || !response.items || !Array.isArray(response.items)) {
        console.warn('[WARN] No betting pools data received from API');
        setBettingPools([]);
        setLoading(false);
        return;
      }

      console.log(`[SUCCESS] Loaded ${response.items.length} betting pools from API`);

      // Transform API data to component format
      const transformStartTime = performance.now();
      const transformedBettingPools = response.items.map(bettingPool => {
        // Extract numeric part from branchCode (with safe handling)
        const branchCode = bettingPool.branchCode || bettingPool.bettingPoolCode || '';
        const numericCode = branchCode.replace(/\D/g, '');
        const number = parseInt(numericCode) || 0;

        return {
          id: bettingPool.bettingPoolId,
          number: number,
          name: bettingPool.bettingPoolName || '',
          reference: bettingPool.reference || '',
          users: bettingPool.username ? [bettingPool.username] : [],
          isActive: bettingPool.isActive,
          // Use zoneName directly from API response instead of looking up from map
          zone: bettingPool.zoneName || 'Sin zona',
          zoneId: bettingPool.zoneId,
          balance: 0,
          accumulatedFall: 0,
          loans: 0
        };
      });

      const transformTime = (performance.now() - transformStartTime).toFixed(2);
      console.log(`[SUCCESS] Transformed ${transformedBettingPools.length} betting pools in ${transformTime}ms`);

      setBettingPools(transformedBettingPools);

      // ⚡ Total time logging
      const totalTime = (performance.now() - startTime).toFixed(2);
      console.log(`[SUCCESS] Betting pools list loaded successfully in ${totalTime}ms`);

      setLoading(false);
    } catch (err) {
      const errorMessage = handleBettingPoolError(err, 'load data');
      setError(errorMessage);
      console.error('Error loading data:', err);
      setLoading(false);
    }
  }, []);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Get unique zones from betting pools
   */
  const availableZones = useMemo((): string[] => {
    const uniqueZones = [...new Set(bettingPools.map(b => b.zone))];
    return uniqueZones.sort();
  }, [bettingPools]);

  /**
   * Filter betting pools by search text and selected zones
   */
  const filteredBettingPools = useMemo((): TransformedBettingPool[] => {
    return bettingPools.filter(pool => {
      // Zone filter
      const matchesZone = selectedZones.includes('all') || selectedZones.includes(pool.zone);

      // Search filter
      const searchLower = searchText.toLowerCase();
      const matchesSearch = searchText === '' ||
        pool.number.toString().includes(searchLower) ||
        pool.name.toLowerCase().includes(searchLower) ||
        pool.reference.toLowerCase().includes(searchLower) ||
        pool.zone.toLowerCase().includes(searchLower);

      return matchesZone && matchesSearch;
    });
  }, [bettingPools, selectedZones, searchText]);

  /**
   * Sort betting pools
   */
  const sortedBettingPools = useMemo((): TransformedBettingPool[] => {
    const sorted = [...filteredBettingPools];

    sorted.sort((a, b) => {
      let aValue: string | number | boolean | string[] = a[orderBy];
      let bValue: string | number | boolean | string[] = b[orderBy];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        if (order === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (order === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }

      return 0;
    });

    return sorted;
  }, [filteredBettingPools, orderBy, order]);

  /**
   * Paginate betting pools
   */
  const paginatedBettingPools = useMemo((): TransformedBettingPool[] => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedBettingPools.slice(start, end);
  }, [sortedBettingPools, page, rowsPerPage]);

  /**
   * Handle search change
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(event.target.value);
    setPage(0);
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = (): void => {
    setSearchText('');
    setPage(0);
  };

  /**
   * Handle zone filter change
   */
  const handleZoneChange = (zones: string[]): void => {
    setSelectedZones(zones);
    setPage(0);
  };

  /**
   * Handle page change
   */
  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Handle sort request
   */
  const handleRequestSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Refresh data
   */
  const handleRefresh = (): void => {
    loadInitialData();
  };

  return {
    // Data
    bettingPools: paginatedBettingPools,
    totalBettingPools: sortedBettingPools.length,
    allBettingPoolsCount: bettingPools.length,
    loading,
    error,

    // Zones
    availableZones,
    selectedZones,
    handleZoneChange,

    // Search
    searchText,
    handleSearchChange,
    handleClearSearch,

    // Pagination
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,

    // Sorting
    orderBy,
    order,
    handleRequestSort,

    // Actions
    handleRefresh,
  };
};

export default useBettingPoolsList;
