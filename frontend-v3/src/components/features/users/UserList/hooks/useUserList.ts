import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import * as logger from '@/utils/logger';

/**
 * User interface
 */
interface User {
  userId: number;
  username: string;
  fullName?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Custom hook for managing user list state and operations
 * Uses React Query for caching, automatic refetching, and optimized server-side pagination
 * Implements debouncing for search to reduce unnecessary API calls
 */
const useUserList = () => {
  // Filter state
  const [searchText, setSearchText] = useState<string>('');

  // Debounce search text to prevent excessive API calls
  // Only triggers search after 500ms of no typing
  const debouncedSearch = useDebouncedValue(searchText, 500);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof User>('userId');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  /**
   * Fetch users with React Query
   * Automatically handles caching, refetching on window focus, and loading states
   * Uses debounced search to reduce server load
   */
  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    // Query key uses debounced search - only changes 500ms after user stops typing
    queryKey: ['users', page, rowsPerPage, debouncedSearch],
    queryFn: async () => {
      logger.info('USER_LIST_MUI', 'Fetching users from API...', {
        search: debouncedSearch,
        page: page + 1,
        pageSize: rowsPerPage
      });

      const response = await userService.getAllUsers({
        page: page + 1, // API uses 1-based indexing
        pageSize: rowsPerPage,
        search: debouncedSearch || undefined, // Server-side search filtering
      });

      console.log('🔵 V3 - getAllUsers RESPONSE:', response);
      console.log('🔵 V3 - Response.success:', response.success);
      console.log('🔵 V3 - Response.data:', response.data);
      console.log('🔵 V3 - Response.pagination:', response.pagination);

      if (response.success && response.data) {
        logger.success('USER_LIST_MUI', `✅ Loaded ${response.data.length} users`);
        return response;
      } else {
        logger.warning('USER_LIST_MUI', 'API response success=false');
        throw new Error('No se pudieron cargar los usuarios');
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
    refetchOnWindowFocus: true, // Auto-refetch when user returns to tab
    retry: 1, // Retry once on failure
  });

  // Extract users and pagination from query data
  const users = queryData?.data || [];
  const totalUsers = queryData?.pagination?.totalCount || 0;

  /**
   * Sort users (client-side sorting for current page)
   * Note: Server-side sorting could be added to API if needed
   */
  const sortedUsers = useMemo(() => {
    const sorted = [...users];

    sorted.sort((a, b) => {
      let aValue: string | number | boolean = a[orderBy];
      let bValue: string | number | boolean = b[orderBy];

      // Handle different data types
      if (orderBy === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [users, orderBy, order]);

  /**
   * Handle search text change
   * Updates immediately in UI, but API call is debounced by 500ms
   * Resets to first page when search changes
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0); // Reset to first page on search
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = () => {
    setSearchText('');
    setPage(0);
  };

  /**
   * Handle page change
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Handle sort request
   */
  const handleRequestSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Refresh users list manually
   * React Query automatically handles refetching on window focus
   */
  const handleRefresh = () => {
    logger.info('USER_LIST_MUI', 'Manual refresh triggered');
    refetch();
  };

  // Convert React Query error to string
  const error = queryError ? String(queryError) : null;

  return {
    // Data
    users: sortedUsers,
    totalUsers, // Total count from server-side pagination
    allUsersCount: totalUsers, // For backward compatibility
    loading: isLoading,
    error,

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

export default useUserList;
