import { useState, useMemo, type ChangeEvent, type MouseEvent } from 'react';
import type { SelectChangeEvent } from '@mui/material';

interface User {
  id: string;
  bettingPool: string;
  reference: string;
  requiresPasswordChange: boolean;
  zone: string;
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
  handleZoneChange: (event: SelectChangeEvent<string[]>) => void;
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearSearch: () => void;
  handleChangePage: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordClick: (username: string) => void;
  handleClosePasswordModal: () => void;
}

/**
 * Custom hook for managing UserBettingPools state and logic
 */
const useUserBettingPools = (): UseUserBettingPoolsReturn => {
  // Mock data - In a real app, this would come from an API
  const users = [
    { id: '001', bettingPool: 'LA CENTRAL 01', reference: 'GILBERTO ISLA GORDA TL', requiresPasswordChange: false, zone: 'GRUPO GILBERTO TL' },
    { id: '010', bettingPool: 'LA CENTRAL 10', reference: 'GILBERTO TL', requiresPasswordChange: false, zone: 'GRUPO GILBERTO TL' },
    { id: '016', bettingPool: 'LA CENTRAL 16', reference: 'CHINO TL', requiresPasswordChange: false, zone: 'GRUPO KENDRICK TL' },
    { id: '063', bettingPool: 'LA CENTRAL 63', reference: 'NELL TL', requiresPasswordChange: false, zone: 'GRUPO KENDRICK TL' },
    { id: '101', bettingPool: 'LA CENTRAL 101', reference: 'FELO TL', requiresPasswordChange: false, zone: 'GRUPO GILBERTO TL' },
    { id: '119', bettingPool: 'LA CENTRAL 119', reference: 'EUDDY (GF)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (JHON)' },
    { id: '135', bettingPool: 'LA CENTRAL 135', reference: 'MORENA D (GF)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (JHON)' },
    { id: '150', bettingPool: 'LA CENTRAL 150', reference: 'DANNY (GF)', requiresPasswordChange: false, zone: 'GRUPO GUYANA (OMAR)' },
    { id: '165', bettingPool: 'LA CENTRAL 165', reference: 'MANUELL (GF)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (DANI)' },
    { id: '182', bettingPool: 'LA CENTRAL 182', reference: 'TONA (GF)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (EL GUARDIA)' },
    { id: '185', bettingPool: 'LA CENTRAL 185', reference: 'JUDELAINE (GF)', requiresPasswordChange: true, zone: 'GUYANA (JUDELAINE)' },
    { id: '194', bettingPool: 'LA CENTRAL 194', reference: 'HAITI (GF)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (COGNON)' },
    { id: '198', bettingPool: 'CARIBBEAN 198', reference: 'LISSET (GF)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (ROSA KOUROU)' },
    { id: '201', bettingPool: 'LA CENTRAL 201', reference: 'CLOTILDE (GF)', requiresPasswordChange: false, zone: 'GRUPO GUYANA (JHON)' },
    { id: '203', bettingPool: 'LA CENTRAL 203', reference: 'IVAN (GF)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (OMAR)' },
    { id: '230', bettingPool: 'LA CENTRAL 230', reference: 'YAN (GF)', requiresPasswordChange: false, zone: 'GRUPO GUYANA (DANI)' },
    { id: '254', bettingPool: 'LA CENTRAL 254', reference: 'DENIS (GF)', requiresPasswordChange: false, zone: 'GRUPO GUYANA (EL GUARDIA)' },
    { id: '264', bettingPool: 'CARIBBEAN 264', reference: 'RAFAEL (FR)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (COGNON)' },
    { id: '269', bettingPool: 'LA CENTRAL 269', reference: 'JONATHAN TL', requiresPasswordChange: false, zone: 'GRUPO KENDRICK TL' },
    { id: '279', bettingPool: 'CARIBBEAN 279', reference: 'MIKI(FR)', requiresPasswordChange: true, zone: 'GRUPO GUYANA (ROSA KOUROU)' },
    { id: '300', bettingPool: 'LA CENTRAL 300', reference: 'NATIVIDAD (GF)', requiresPasswordChange: true, zone: 'GUYANA (JUDELAINE)' },
  ];

  const zones = [
    'GRUPO GUYANA (JHON)',
    'GRUPO KENDRICK TL',
    'GRUPO GILBERTO TL',
    'GRUPO GUYANA (OMAR)',
    'GRUPO GUYANA (DANI)',
    'GRUPO GUYANA (EL GUARDIA)',
    'GRUPO GUYANA (COGNON)',
    'GRUPO GUYANA (ROSA KOUROU)',
    'GUYANA (JUDELAINE)',
  ];

  // State
  const [selectedZones, setSelectedZones] = useState<string[]>([...zones]);
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [selectedUsername, setSelectedUsername] = useState<string>('');

  // Filtered users based on zones and search
  const filteredUsers = useMemo((): User[] => {
    return users.filter(user => {
      const matchesZone = selectedZones.length === 0 || selectedZones.includes(user.zone);
      const matchesSearch = !searchText ||
        user.id.toLowerCase().includes(searchText.toLowerCase()) ||
        user.bettingPool.toLowerCase().includes(searchText.toLowerCase()) ||
        user.reference.toLowerCase().includes(searchText.toLowerCase());

      return matchesZone && matchesSearch;
    });
  }, [selectedZones, searchText]);

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

    // Handlers
    handleZoneChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
  };
};

export default useUserBettingPools;
