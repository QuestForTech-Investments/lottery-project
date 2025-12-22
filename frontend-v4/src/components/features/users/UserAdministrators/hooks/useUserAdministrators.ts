import { useState, useEffect, useMemo, useCallback, type ChangeEvent, type MouseEvent } from 'react';
import api from '@services/api';

interface UserFromApi {
  userId: number;
  username: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  roleId: number | null;
  roleName: string | null;
  commissionRate: number;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string;
}

interface Administrator {
  userId: number;
  username: string;
  fullName: string | null;
  email: string | null;
  requiereCambio: boolean;
  tieneRestablecimiento: boolean;
}

interface UseUserAdministratorsReturn {
  administradores: Administrator[];
  totalAdministradores: number;
  searchText: string;
  page: number;
  rowsPerPage: number;
  passwordModalOpen: boolean;
  selectedUsername: string;
  selectedUserId: number | null;
  loading: boolean;
  error: string | null;
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  handleChangePage: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordClick: (userId: number, username: string) => void;
  handleClosePasswordModal: () => void;
  handleResetPassword: (username: string) => void;
  refreshData: () => void;
}

/**
 * Custom hook for managing UserAdministrators state and logic
 * Fetches real data from the API
 */
const useUserAdministrators = (): UseUserAdministratorsReturn => {
  // State for API data
  const [allAdministradores, setAllAdministradores] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  /**
   * Fetch users from API
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all users with large page size
      const response = await api.get<{
        items: UserFromApi[];
        totalCount: number;
      }>('/users?pageSize=1000');

      // Transform users to administrators format
      const users = response?.items || [];
      const transformedAdmins: Administrator[] = users
        .filter(user => user.isActive) // Only show active users
        .map(user => ({
          userId: user.userId,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          requiereCambio: false, // TODO: Add this field to API if needed
          tieneRestablecimiento: false, // TODO: Add this field to API if needed
        }));

      setAllAdministradores(transformedAdmins);
    } catch (err) {
      console.error('Error fetching administrators:', err);
      setError('Error al cargar los administradores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered administradores based on search
  const filteredAdministradores = useMemo((): Administrator[] => {
    return allAdministradores.filter(admin => {
      const matchesSearch = !searchText ||
        admin.username.toLowerCase().includes(searchText.toLowerCase()) ||
        (admin.fullName?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
        (admin.email?.toLowerCase().includes(searchText.toLowerCase()) ?? false);

      return matchesSearch;
    });
  }, [allAdministradores, searchText]);

  // Paginated administradores
  const paginatedAdministradores = useMemo((): Administrator[] => {
    const startIndex = page * rowsPerPage;
    return filteredAdministradores.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAdministradores, page, rowsPerPage]);

  /**
   * Handle search text change
   */
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0); // Reset to first page when search changes
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
   * Handle password change action
   */
  const handlePasswordClick = useCallback((userId: number, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setPasswordModalOpen(true);
  }, []);

  /**
   * Handle close password modal
   */
  const handleClosePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    setSelectedUsername('');
    setSelectedUserId(null);
  }, []);

  /**
   * Handle reset password action
   */
  const handleResetPassword = useCallback((username: string) => {
    alert(`Restablecer contraseña para ${username}`);
    // TODO: Call API to reset password
  }, []);

  return {
    // Data
    administradores: paginatedAdministradores,
    totalAdministradores: filteredAdministradores.length,

    // State
    searchText,
    page,
    rowsPerPage,
    passwordModalOpen,
    selectedUsername,
    selectedUserId,
    loading,
    error,

    // Handlers
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
    handleResetPassword,
    refreshData: fetchData,
  };
};

export default useUserAdministrators;
