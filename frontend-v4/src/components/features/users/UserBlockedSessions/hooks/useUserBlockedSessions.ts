import { useState, useMemo, useCallback, type ChangeEvent, type MouseEvent } from 'react';

interface BlockedItem {
  id: number;
  usuario: string;
  bloqueadoEn: string;
  ip: string;
}

type TabValue = 'contrasena' | 'pin' | 'ip';

/**
 * Custom hook for managing UserBlockedSessions state and logic
 */
const useUserBlockedSessions = () => {
  // Mock data for blocked by password
  const bloqueadosPorContrasena = [
    {
      id: 1,
      usuario: 'juan.perez',
      bloqueadoEn: '2025-10-19 10:30:00',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      usuario: 'maria.garcia',
      bloqueadoEn: '2025-10-19 11:15:00',
      ip: '192.168.1.101',
    },
  ];

  // Mock data for blocked by PIN
  const bloqueadosPorPin = [
    {
      id: 1,
      usuario: 'carlos.lopez',
      bloqueadoEn: '2025-10-19 09:45:00',
      ip: '192.168.1.102',
    },
  ];

  // Mock data for blocked IPs
  const bloqueadosIP = [
    {
      id: 1,
      ip: '192.168.1.200',
      bloqueadoEn: '2025-10-19 08:00:00',
      usuario: 'admin',
    },
    {
      id: 2,
      ip: '10.0.0.50',
      bloqueadoEn: '2025-10-19 12:30:00',
      usuario: 'guest',
    },
  ];

  // State
  const [activeTab, setActiveTab] = useState<TabValue>('contrasena');
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  /**
   * Get current tab data based on active tab
   */
  const getCurrentTabData = useCallback(() => {
    switch (activeTab) {
      case 'contrasena':
        return bloqueadosPorContrasena;
      case 'pin':
        return bloqueadosPorPin;
      case 'ip':
        return bloqueadosIP;
      default:
        return [];
    }
  }, [activeTab]);

  /**
   * Get filtered data based on search text
   */
  const filteredData = useMemo(() => {
    const data = getCurrentTabData();

    if (!searchText) {
      return data;
    }

    const searchLower = searchText.toLowerCase();
    return data.filter(item => {
      if (activeTab === 'ip') {
        return (
          item.ip.toLowerCase().includes(searchLower) ||
          item.usuario.toLowerCase().includes(searchLower) ||
          item.bloqueadoEn.toLowerCase().includes(searchLower)
        );
      } else {
        return (
          item.usuario.toLowerCase().includes(searchLower) ||
          item.ip.toLowerCase().includes(searchLower) ||
          item.bloqueadoEn.toLowerCase().includes(searchLower)
        );
      }
    });
  }, [activeTab, searchText, getCurrentTabData]);

  /**
   * Get paginated data
   */
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when switching tabs
    setSearchText(''); // Clear search when switching tabs
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
   * Handle unlock action
   */
  const handleUnlock = useCallback((item: BlockedItem) => {
    const identifier = activeTab === 'ip' ? item.ip : item.usuario;
    alert(`Desbloquear ${identifier}`);
    // TODO: Call API to unlock the user/IP
  }, [activeTab]);

  return {
    // Data
    currentTabData: paginatedData,
    totalRecords: filteredData.length,

    // State
    activeTab,
    searchText,
    page,
    rowsPerPage,

    // Handlers
    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleUnlock,
  };
};

export default useUserBlockedSessions;
