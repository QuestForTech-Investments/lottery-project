import { useState, useMemo, useCallback, useEffect, type ChangeEvent, type MouseEvent } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import api from '../../../../../services/api';

interface Zone {
  id: number;
  zoneId: number;
  name: string;
  zoneName: string;
}

interface SessionLog {
  id: number;
  banca: string;
  usuario: string;
  primeraWeb: string;
  ultimaWeb: string;
  primeraCelular: string;
  ultimaCelular: string;
  primeraApp: string;
  ultimaApp: string;
}

interface IpCollision {
  ipAddress: string;
  sessions: SessionLog[];
  sessionCount: number;
}

interface LoginSessionsResponse {
  bancas: SessionLog[];
  colisiones: IpCollision[];
  totalRecords: number;
  page: number;
  pageSize: number;
}

interface FilteredData {
  bancas: SessionLog[];
  colisiones: SessionLog[];
}

type TabValue = 'bancas' | 'colision';

/**
 * Custom hook for managing UserSessions state and logic
 */
const useUserSessions = () => {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  const getTodayDate = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // State for zones (loaded from API)
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  // State for sessions data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State - Default to today's date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [dateError, setDateError] = useState<string>('');
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('bancas');
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [filteredData, setFilteredData] = useState<FilteredData>({ bancas: [], colisiones: [] });
  const [hasFiltered, setHasFiltered] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  /**
   * Load zones on mount
   */
  useEffect(() => {
    const loadZones = async () => {
      try {
        setZonesLoading(true);
        const response = await api.get<{ items?: Zone[] } | Zone[]>('/zones');
        // Handle both paginated and array responses
        const zonesList = Array.isArray(response) ? response : (response?.items || []);
        // Normalize the zones data
        const normalizedZones = zonesList.map((z: Zone) => ({
          id: z.zoneId || z.id,
          zoneId: z.zoneId || z.id,
          name: z.zoneName || z.name,
          zoneName: z.zoneName || z.name,
        }));
        setZones(normalizedZones);
      } catch (err) {
        console.error('Error loading zones:', err);
        // Set empty array on error but don't block the UI
        setZones([]);
      } finally {
        setZonesLoading(false);
      }
    };

    loadZones();
  }, []);

  /**
   * Handle date change with validation
   */
  const handleDateChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    const today = getTodayDate();

    if (newDate > today) {
      setDateError('La fecha no puede ser futura');
      setSelectedDate('');
    } else {
      setDateError('');
      setSelectedDate(newDate);
    }
  }, []);

  /**
   * Handle zone selection change
   */
  const handleZoneChange = useCallback((event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',').map(Number) : value);
  }, []);

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when switching tabs
  }, []);

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
   * Fetch login sessions from API
   */
  const fetchLoginSessions = useCallback(async () => {
    if (!selectedDate) {
      setDateError('Debe seleccionar una fecha');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('date', selectedDate);
      if (selectedZones.length > 0) {
        params.append('zoneIds', selectedZones.join(','));
      }
      if (searchText) {
        params.append('searchText', searchText);
      }
      params.append('page', String(page + 1)); // API uses 1-based pagination
      params.append('pageSize', String(rowsPerPage));

      const response = await api.get<LoginSessionsResponse>(`/login-sessions?${params.toString()}`);

      if (response) {
        // Flatten collision sessions for display
        const collisionSessions: SessionLog[] = response.colisiones?.flatMap(c => c.sessions) || [];

        setFilteredData({
          bancas: response.bancas || [],
          colisiones: collisionSessions,
        });
        setTotalRecords(response.totalRecords || 0);
      } else {
        setFilteredData({ bancas: [], colisiones: [] });
        setTotalRecords(0);
      }

      setHasFiltered(true);
    } catch (err) {
      console.error('Error fetching login sessions:', err);
      setError('Error al cargar las sesiones de inicio');
      setFilteredData({ bancas: [], colisiones: [] });
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedZones, searchText, page, rowsPerPage]);

  /**
   * Auto-load today's sessions on mount
   */
  useEffect(() => {
    if (!initialLoadDone && selectedDate) {
      setInitialLoadDone(true);
      fetchLoginSessions();
    }
  }, [initialLoadDone, selectedDate, fetchLoginSessions]);

  /**
   * Handle filter button click
   */
  const handleFilter = useCallback(() => {
    setPage(0); // Reset to first page
    fetchLoginSessions();
  }, [fetchLoginSessions]);

  /**
   * Get current tab data with search filter applied
   */
  const currentTabData = useMemo(() => {
    const data = activeTab === 'bancas' ? filteredData.bancas : filteredData.colisiones;

    if (!searchText) {
      return data;
    }

    return data.filter(log =>
      log.banca.toLowerCase().includes(searchText.toLowerCase()) ||
      log.usuario.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [activeTab, filteredData, searchText]);

  /**
   * Get paginated data for current tab
   * Note: Since we're doing server-side pagination, this just returns the current data
   */
  const paginatedData = useMemo(() => {
    return currentTabData;
  }, [currentTabData]);

  return {
    // Data
    zones,
    currentTabData: paginatedData,
    totalRecords,

    // Loading states
    loading,
    zonesLoading,
    error,

    // State
    selectedDate,
    dateError,
    selectedZones,
    activeTab,
    searchText,
    page,
    rowsPerPage,
    hasFiltered,

    // Derived
    getTodayDate,

    // Handlers
    handleDateChange,
    handleZoneChange,
    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilter,
  };
};

export default useUserSessions;
