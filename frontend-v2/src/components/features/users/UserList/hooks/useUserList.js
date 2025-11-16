import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '@/services';
import * as logger from '@/utils/logger';

/**
 * Custom hook for managing user list state and operations
 * Handles loading, filtering, pagination, and sorting
 */
const useUserList = () => {
  // Data state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchText, setSearchText] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting state
  const [orderBy, setOrderBy] = useState('userId');
  const [order, setOrder] = useState('asc');

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
      });

      console.log('🔵 V2 - getAllUsers RESPONSE:', response);
      console.log('🔵 V2 - Response.success:', response.success);
      console.log('🔵 V2 - Response.data:', response.data);
      console.log('🔵 V2 - Response.data length:', response.data?.length);

      if (response.success && response.data) {
        setUsers(response.data);
        console.log('🔵 V2 - Users set to state:', response.data.length, 'users');
        logger.success('USER_LIST_MUI', `✅ Loaded ${response.data.length} users`);
      } else {
        console.error('🔴 V2 - Failed to load users. Response:', response);
        setError('No se pudieron cargar los usuarios');
        logger.warning('USER_LIST_MUI', 'API response success=false');
      }
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
      logger.error('USER_LIST_MUI', 'Failed to load users', { error: err.message });
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
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle different data types
      if (orderBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
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
  const handleSearchChange = (event) => {
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
   * Refresh users list
   */
  const handleRefresh = () => {
    loadUsers();
  };

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
