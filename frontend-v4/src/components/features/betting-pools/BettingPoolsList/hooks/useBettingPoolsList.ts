import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import { getBettingPools, handleBettingPoolError } from '@/services/bettingPoolService';
import { getAllZones } from '@/services/zoneService';
import { getLoans } from '@/services/loanService';
import { getCaidaStatus } from '@/services/caidaService';
import api from '@/services/api';
import type { BettingPoolBalanceAPI } from '@/services/balanceService';

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
  accumulatedFall: number | null;
  loans: number;
  [key: string]: string | number | boolean | string[] | null;
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
  const [zonesMap, setZonesMap] = useState<ZonesMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchText, setSearchText] = useState<string>('');
  const [selectedZones, setSelectedZones] = useState<string[]>(['all']);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);

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

      // ⚡ OPTIMIZATION: Load zones, betting pools, loans, caída, and balances in parallel
      const [zonesResponse, response, loansData, caidaData, balancesData] = await Promise.all([
        // Without an explicit pageSize the API defaults to ~20 zones, which
        // truncates the dropdown. 1000 is well above any realistic count.
        getAllZones({ pageSize: 1000 }),
        getBettingPools({
          page: 1,
          pageSize: 1000 // Load all betting pools for client-side filtering
        }),
        getLoans({ status: 'active' }).catch(() => []),
        getCaidaStatus().catch(() => []),
        api.get<BettingPoolBalanceAPI[]>('/balances/betting-pools').catch(() => [])
      ]) as unknown as [
        { success: boolean; data?: Array<{ zoneId: number; name: string }> },
        { items?: Array<{
          bettingPoolId: number;
          branchCode?: string;
          bettingPoolCode?: string;
          bettingPoolName?: string;
          reference?: string;
          users?: string[];
          isActive: boolean;
          zoneName?: string;
          zoneId: number;
          balance?: number;
        }> },
        Array<{ entityId: number; remainingBalance: number }>,
        Array<{ bettingPoolId: number; accumulatedFall: number }>,
        BettingPoolBalanceAPI[]
      ];

      // Build loan totals map by entity
      const loanTotals: Record<number, number> = {};
      if (Array.isArray(loansData)) {
        loansData.forEach(loan => {
          loanTotals[loan.entityId] = (loanTotals[loan.entityId] || 0) + loan.remainingBalance;
        });
      }

      // Build caída acumulada map (only bancas with caída enabled appear)
      const caidaMap = new Map<number, number>();
      if (Array.isArray(caidaData)) {
        caidaData.forEach(item => {
          caidaMap.set(item.bettingPoolId, item.accumulatedFall);
        });
      }

      // Build balances map from snapshot-based balances endpoint
      const balanceMap = new Map<number, number>();
      if (Array.isArray(balancesData)) {
        balancesData.forEach(item => {
          balanceMap.set(item.bettingPoolId, item.balance);
        });
      }

      // Process zones response — the API returns `zoneName`, not `name`.
      // Tolerate either shape so a future rename doesn't silently empty the map.
      const zMap: ZonesMap = {};
      if (zonesResponse.success && zonesResponse.data) {
        zonesResponse.data.forEach((zone) => {
          const z = zone as { zoneId: number; zoneName?: string; name?: string };
          const label = (z.zoneName ?? z.name ?? '').trim();
          if (label) zMap[z.zoneId] = label;
        });
        setZonesMap(zMap);
      }

      // Check if response has items
      if (!response || !response.items || !Array.isArray(response.items)) {
        console.warn('[WARN] No betting pools data received from API');
        setBettingPools([]);
        setLoading(false);
        return;
      }


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
          users: bettingPool.users || [],
          isActive: bettingPool.isActive,
          // Use zoneName directly from API response instead of looking up from map
          zone: bettingPool.zoneName || 'Sin zona',
          zoneId: bettingPool.zoneId,
          balance: balanceMap.get(bettingPool.bettingPoolId) ?? bettingPool.balance ?? 0,
          accumulatedFall: caidaMap.has(bettingPool.bettingPoolId) ? caidaMap.get(bettingPool.bettingPoolId)! : null,
          loans: loanTotals[bettingPool.bettingPoolId] || 0
        };
      });

      const transformTime = (performance.now() - transformStartTime).toFixed(2);

      setBettingPools(transformedBettingPools);

      // ⚡ Total time logging
      const totalTime = (performance.now() - startTime).toFixed(2);

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
   * Full list of zones — comes from the /zones endpoint, plus any zone string
   * that already appears on a banca (covers historical names not in the active
   * list). This way the dropdown shows every zone in the system, not only the
   * ones present on currently-loaded bancas. Blanks are dropped so a zone with
   * an empty name doesn't render an empty row in the dropdown.
   */
  const availableZones = useMemo((): string[] => {
    const fromMap = Object.values(zonesMap);
    const fromBancas = bettingPools.map((b) => b.zone);
    const merged = [...fromMap, ...fromBancas]
      .map((z) => (z ?? '').trim())
      .filter((z) => z.length > 0 && z !== 'Sin zona');
    return Array.from(new Set(merged)).sort();
  }, [zonesMap, bettingPools]);

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
      let aValue: string | number | boolean | string[] | null = a[orderBy];
      let bValue: string | number | boolean | string[] | null = b[orderBy];

      // Arrays (e.g. users) — sort by length so the column orders by count.
      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        return order === 'asc' ? aValue.length - bValue.length : bValue.length - aValue.length;
      }

      // Booleans — true sorts after false in asc.
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        const a01 = aValue ? 1 : 0;
        const b01 = bValue ? 1 : 0;
        return order === 'asc' ? a01 - b01 : b01 - a01;
      }

      // Nulls always sort last regardless of direction.
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

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
    // If rowsPerPage is -1, show all records
    if (rowsPerPage === -1) {
      return sortedBettingPools;
    }
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
