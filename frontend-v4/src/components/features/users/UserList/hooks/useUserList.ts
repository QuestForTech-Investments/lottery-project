import { useState, useEffect, useCallback, useMemo, type ChangeEvent, type MouseEvent } from 'react';
import { userService } from '@/services';
import * as logger from '@/utils/logger';
import type { User, SortOrder, UserSortField, ApiResponse } from '@/types/user';

interface ApiError {
  message: string;
}

// Extend User type to allow indexing
type UserWithIndex = User & Record<string, unknown>;

/**
 * Custom hook for managing user list state and operations
 * Handles loading, filtering, pagination, and sorting
 */
const useUserList = () => {
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchText, setSearchText] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState<UserSortField>('userId');
  const [order, setOrder] = useState<SortOrder>('asc');

  /**
   * Load users from API
   */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('USER_LIST_MUI', 'Loading users from API...');

      const response = await userService.getAllUsers({
        page: 1,
        pageSize: 1000 // Get all users for client-side filtering/pagination
      }) as ApiResponse<User[]>;

      if (response.success && response.data) {
        setUsers(response.data);
        logger.success('USER_LIST_MUI', `✅ Loaded ${response.data.length} users`);
      } else {
        setError('No se pudieron cargar los usuarios');
        logger.warning('USER_LIST_MUI', 'API response success=false');
      }
    } catch (err) {
      const error = err as ApiError;
      setError('Error al cargar usuarios: ' + error.message);
      logger.error('USER_LIST_MUI', 'Failed to load users', { error: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load and auto-reload on window focus
   */
  useEffect(() => {
    loadUsers();

    const handleFocus = () => {
      logger.info('USER_LIST_MUI', 'Page focused, reloading users...');
      loadUsers();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadUsers]);

  /**
   * Filter users based on search text
   */
  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) {
      return users;
    }

    const searchLower = searchText.toLowerCase();
    return users.filter(user => {
      const searchableText = `${user.username} ${user.fullName || ''} ${user.email || ''} ${user.userId}`.toLowerCase();
      return searchableText.includes(searchLower);
    });
  }, [users, searchText]);

  /**
   * Sort users
   */
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];

    sorted.sort((a, b) => {
      let aValue: string | number = (a as UserWithIndex)[orderBy] as string | number;
      let bValue: string | number = (b as UserWithIndex)[orderBy] as string | number;

      // Handle different data types
      if (orderBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [filteredUsers, orderBy, order]);

  /**
   * Paginate users
   */
  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedUsers.slice(start, end);
  }, [sortedUsers, page, rowsPerPage]);

  /**
   * Handle search text change
   */
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0); // Reset to first page on search
  }, []);

  /**
   * Handle clear search
   */
  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setPage(0);
  }, []);

  /**
   * Handle page change
   */
  const handleChangePage = useCallback((_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
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
  const handleRequestSort = useCallback((property: UserSortField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  /**
   * Refresh users list
   */
  const handleRefresh = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    // Data
    users: paginatedUsers,
    totalUsers: sortedUsers.length,
    allUsersCount: users.length,
    loading,
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
