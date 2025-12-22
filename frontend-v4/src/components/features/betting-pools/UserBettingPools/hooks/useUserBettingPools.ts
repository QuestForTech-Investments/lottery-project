import { useState, useEffect, useMemo, useCallback, type ChangeEvent, type MouseEvent } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import api from '@services/api';

interface BettingPoolFromApi {
  bettingPoolId: number;
  bettingPoolCode: string;
  bettingPoolName: string;
  zoneId: number;
  zoneName: string | null;
  username: string | null;
  reference: string | null;
  isActive: boolean;
}

interface ZoneFromApi {
  zoneId: number;
  zoneName: string;
}

interface User {
  id: string;
  bettingPoolId: number;
  bettingPool: string;
  reference: string;
  requiresPasswordChange: boolean;
  zone: string;
  userId?: number;
}

interface UseUserBettingPoolsReturn {
  users: User[];
  totalUsers: number;
  zones: string[];
  availableZones: string[];
  selectedZones: string[];
  searchText: string;
  page: number;
  rowsPerPage: number;
  passwordModalOpen: boolean;
  selectedUsername: string;
  loading: boolean;
  error: string | null;
  handleZoneChange: (event: SelectChangeEvent<string[]>) => void;
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  handleChangePage: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordClick: (username: string) => void;
  handleClosePasswordModal: () => void;
  refreshData: () => void;
}

/**
 * Custom hook for managing UserBettingPools state and logic
 * Fetches real data from the API
 */
const useUserBettingPools = (): UseUserBettingPoolsReturn => {
  // State for API data
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [selectedUsername, setSelectedUsername] = useState<string>('');

  /**
   * Fetch betting pools and zones from API
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch betting pools - get all with large page size
      const bettingPoolsResponse = await api.get<{
        items: BettingPoolFromApi[];
        totalCount: number;
      }>('/betting-pools?pageSize=1000');

      // Fetch zones
      const zonesResponse = await api.get<ZoneFromApi[]>('/zones');

      // Transform betting pools to users format
      // Show all betting pools - use username if available, otherwise bettingPoolCode
      const bettingPools = bettingPoolsResponse?.items || [];
      const transformedUsers: User[] = bettingPools
        .filter(bp => bp.isActive) // Only show active betting pools
        .map(bp => ({
          id: bp.username || bp.bettingPoolCode,
          bettingPoolId: bp.bettingPoolId,
          bettingPool: bp.bettingPoolName,
          reference: bp.reference || '',
          requiresPasswordChange: false, // TODO: Add this field to API if needed
          zone: bp.zoneName || 'Sin zona',
        }));

      setAllUsers(transformedUsers);

      // Extract unique zones from betting pools
      const uniqueZones = Array.from(
        new Set(
          bettingPools
            .map(bp => bp.zoneName)
            .filter((z): z is string => z !== null && z !== undefined)
        )
      ).sort();

      setZones(uniqueZones);

      // Select all zones by default
      setSelectedZones(uniqueZones);

    } catch (err) {
      console.error('Error fetching betting pool users:', err);
      setError('Error al cargar los usuarios de bancas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered users based on zones and search
  const filteredUsers = useMemo((): User[] => {
    return allUsers.filter(user => {
      const matchesZone = selectedZones.length === 0 || selectedZones.includes(user.zone);
      const matchesSearch = !searchText ||
        user.id.toLowerCase().includes(searchText.toLowerCase()) ||
        user.bettingPool.toLowerCase().includes(searchText.toLowerCase()) ||
        user.reference.toLowerCase().includes(searchText.toLowerCase());

      return matchesZone && matchesSearch;
    });
  }, [allUsers, selectedZones, searchText]);

  // Paginated users
  const paginatedUsers = useMemo((): User[] => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  /**
   * Handle zone selection change
   */
  const handleZoneChange = (event: SelectChangeEvent<string[]>): void => {
    const {
      target: { value },
    } = event;

    // Handle "all" selection
    if ((value as string[]).includes('all')) {
      if (selectedZones.length === zones.length) {
        setSelectedZones([]);
      } else {
        setSelectedZones([...zones]);
      }
    } else {
      setSelectedZones(typeof value === 'string' ? value.split(',') : value);
    }
    setPage(0); // Reset to first page when filter changes
  };

  /**
   * Handle search text change
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(event.target.value);
    setPage(0); // Reset to first page when search changes
  };

  /**
   * Handle clear search
   */
  const handleClearSearch = (): void => {
    setSearchText('');
    setPage(0);
  };

  /**
   * Handle page change
   */
  const handleChangePage = (_event: MouseEvent<HTMLButtonElement> | null, newPage: number): void => {
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
   * Handle password change action
   */
  const handlePasswordClick = (username: string): void => {
    setSelectedUsername(username);
    setPasswordModalOpen(true);
  };

  /**
   * Handle close password modal
   */
  const handleClosePasswordModal = (): void => {
    setPasswordModalOpen(false);
    setSelectedUsername('');
  };

  return {
    // Data
    users: paginatedUsers,
    totalUsers: filteredUsers.length,
    zones,
    availableZones: zones,

    // State
    selectedZones,
    searchText,
    page,
    rowsPerPage,
    passwordModalOpen,
    selectedUsername,
    loading,
    error,

    // Handlers
    handleZoneChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
    refreshData: fetchData,
  };
};

export default useUserBettingPools;
