import { useState, useMemo, useCallback, type ChangeEvent, type MouseEvent } from 'react';
import type { SelectChangeEvent } from '@mui/material';

interface Zone {
  id: number;
  name: string;
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

interface FilteredData {
  bancas: SessionLog[];
  colisiones: SessionLog[];
}

type TabValue = 'bancas' | 'colision';

/**
 * Custom hook for managing UserSessions state and logic
 */
const useUserSessions = () => {
  // Mock zones data - In a real app, this would come from an API
  const zones = [
    { id: 1, name: 'Zona 1' },
    { id: 2, name: 'Zona 2' },
    { id: 3, name: 'Zona 3' },
    { id: 4, name: 'Zona 4' },
  ];

  // Mock logs data for Bancas tab
  const logsBancas = [
    {
      id: 1,
      banca: 'Banca Central',
      usuario: 'juan.perez',
      primeraWeb: '2025-01-15 08:30:00',
      ultimaWeb: '2025-01-15 18:45:00',
      primeraCelular: '2025-01-15 09:00:00',
      ultimaCelular: '2025-01-15 17:30:00',
      primeraApp: '2025-01-15 08:45:00',
      ultimaApp: '2025-01-15 18:00:00',
    },
    {
      id: 2,
      banca: 'Banca Norte',
      usuario: 'maria.garcia',
      primeraWeb: '2025-01-15 07:00:00',
      ultimaWeb: '2025-01-15 19:00:00',
      primeraCelular: '',
      ultimaCelular: '',
      primeraApp: '2025-01-15 07:15:00',
      ultimaApp: '2025-01-15 18:30:00',
    },
    {
      id: 3,
      banca: 'Banca Sur',
      usuario: 'carlos.lopez',
      primeraWeb: '2025-01-15 10:00:00',
      ultimaWeb: '2025-01-15 16:00:00',
      primeraCelular: '2025-01-15 10:30:00',
      ultimaCelular: '2025-01-15 15:45:00',
      primeraApp: '',
      ultimaApp: '',
    },
  ];

  // Mock logs data for IP Collision tab
  const logsColisiones = [
    {
      id: 1,
      banca: 'Banca Central',
      usuario: 'juan.perez',
      primeraWeb: '2025-01-15 08:30:00',
      ultimaWeb: '2025-01-15 18:45:00',
      primeraCelular: '2025-01-15 09:00:00',
      ultimaCelular: '2025-01-15 17:30:00',
      primeraApp: '2025-01-15 08:45:00',
      ultimaApp: '2025-01-15 18:00:00',
    },
    {
      id: 2,
      banca: 'Banca Este',
      usuario: 'pedro.rodriguez',
      primeraWeb: '2025-01-15 08:35:00',
      ultimaWeb: '2025-01-15 18:40:00',
      primeraCelular: '2025-01-15 09:05:00',
      ultimaCelular: '2025-01-15 17:25:00',
      primeraApp: '2025-01-15 08:50:00',
      ultimaApp: '2025-01-15 17:55:00',
    },
  ];

  // State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('bancas');
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [filteredData, setFilteredData] = useState<FilteredData>({ bancas: [], colisiones: [] });
  const [hasFiltered, setHasFiltered] = useState<boolean>(false);

  /**
   * Get today's date in YYYY-MM-DD format
   */
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Handle date change with validation
   */
  const handleDateChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    const today = getTodayDate();

    if (newDate > today) {
      setDateError('La fecha no could be futura');
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
   * Handle filter button click
   */
  const handleFilter = useCallback(() => {
    if (!selectedDate) {
      setDateError('Debe seleccionar una fecha');
      return;
    }

    // In a real app, this would call an API with the filters
    // For now, we'll just use the mock data
    setFilteredData({
      bancas: logsBancas,
      colisiones: logsColisiones,
    });
    setHasFiltered(true);
    setPage(0);
  }, [selectedDate]);

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
   */
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return currentTabData.slice(startIndex, startIndex + rowsPerPage);
  }, [currentTabData, page, rowsPerPage]);

  return {
    // Data
    zones,
    currentTabData: paginatedData,
    totalRecords: currentTabData.length,

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
