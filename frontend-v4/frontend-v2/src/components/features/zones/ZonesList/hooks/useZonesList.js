import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllZones } from '@/services/zoneService';

/**
 * Custom hook for managing zones list state and operations
 * Handles loading, filtering, pagination, and sorting
 */
const useZonesList = () => {
  // Data state
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState('zoneName');
  const [order, setOrder] = useState('asc');

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
      });

      if (response.success && response.data) {
        setZones(response.data);
      } else {
        setZones([]);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al cargar las zonas');
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
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase();
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
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setPage(0);
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    setSearchText('');
    setPage(0);
  };

  /**
   * Handle active filter toggle
   */
  const handleActiveFilterToggle = () => {
    setShowActiveOnly(!showActiveOnly);
    setPage(0);
  };

  /**
   * Handle page change
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Handle sort request
   */
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Refresh data
   */
  const handleRefresh = () => {
    loadZones();
  };

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
