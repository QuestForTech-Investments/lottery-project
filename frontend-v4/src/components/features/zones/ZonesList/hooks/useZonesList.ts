import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import { getAllZones } from '@/services/zoneService';

type SortOrder = 'asc' | 'desc';

interface Zone {
  zoneId: number;
  zoneName: string;
  description?: string;
  isActive: boolean;
}

interface ZonesResponse {
  success: boolean;
  data?: Zone[];
}

interface UseZonesListReturn {
  zones: Zone[];
  totalZones: number;
  allZonesCount: number;
  loading: boolean;
  error: string | null;
  searchText: string;
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  showActiveOnly: boolean;
  handleActiveFilterToggle: () => void;
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  orderBy: string;
  order: SortOrder;
  handleRequestSort: (property: string) => void;
  handleRefresh: () => void;
}

/**
 * Custom hook for managing zones list state and operations
 * Handles loading, filtering, pagination, and sorting
 */
const useZonesList = (): UseZonesListReturn => {
  // Data state
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchText, setSearchText] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState<string>('zoneName');
  const [order, setOrder] = useState<SortOrder>('asc');

  /**
   * Load zones data
   */
  const loadZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllZones({
        page: 1,
        pageSize: 1000 // Load all zones for client-side filtering
      }) as ZonesResponse;

      if (response.success && response.data) {
        setZones(response.data);
      } else {
        setZones([]);
      }

      setLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error al cargar las zonas');
      console.error('Error loading zones:', err);
      setLoading(false);
    }
  }, []);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  /**
   * Filter zones by search text and active status
   */
  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      // Active filter
      const matchesActive = !showActiveOnly || zone.isActive;

      // Search filter
      const searchLower = searchText.toLowerCase();
      const matchesSearch = searchText === '' ||
        zone.zoneName?.toLowerCase().includes(searchLower) ||
        zone.description?.toLowerCase().includes(searchLower) ||
        zone.zoneId?.toString().includes(searchLower);

      return matchesActive && matchesSearch;
    });
  }, [zones, showActiveOnly, searchText]);

  /**
   * Sort zones
   */
  const sortedZones = useMemo(() => {
    const sorted = [...filteredZones];

    sorted.sort((a, b) => {
      let aValue: string | number | boolean = a[orderBy as keyof Zone] as string | number | boolean;
      let bValue: string | number | boolean = b[orderBy as keyof Zone] as string | number | boolean;

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string)?.toLowerCase() || '';
      }

      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [filteredZones, orderBy, order]);

  /**
   * Paginate zones
   * Handle special case: rowsPerPage === 0 or -1 means "show all"
   */
  const paginatedZones = useMemo(() => {
    // If rowsPerPage is 0 or -1, show all zones
    if (rowsPerPage === 0 || rowsPerPage === -1) {
      return sortedZones;
    }

    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedZones.slice(start, end);
  }, [sortedZones, page, rowsPerPage]);

  /**
   * Handle search change
   */
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0);
  }, []);

  /**
   * Handle clear search
   */
  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setPage(0);
  }, []);

  /**
   * Handle active filter toggle
   */
  const handleActiveFilterToggle = useCallback(() => {
    setShowActiveOnly(prev => !prev);
    setPage(0);
  }, []);

  /**
   * Handle page change
   */
  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  /**
   * Handle sort request
   */
  const handleRequestSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  /**
   * Refresh data
   */
  const handleRefresh = useCallback(() => {
    loadZones();
  }, [loadZones]);

  return {
    // Data
    zones: paginatedZones,
    totalZones: sortedZones.length,
    allZonesCount: zones.length,
    loading,
    error,

    // Search
    searchText,
    handleSearchChange,
    handleClearSearch,

    // Filters
    showActiveOnly,
    handleActiveFilterToggle,

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

export default useZonesList;
