import { useState, useMemo, useCallback, type ChangeEvent, type MouseEvent } from 'react';

interface Administrator {
  username: string;
  requiereCambio: boolean;
  tieneRestablecimiento: boolean;
}

/**
 * Custom hook for managing UserAdministrators state and logic
 */
const useUserAdministrators = () => {
  // Mock data - In a real app, this would come from an API
  const administradores = [
    { username: 'la', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'juanpaulino', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'jose', requiereCambio: false, tieneRestablecimiento: true },
    { username: 'cecilia', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'dl', requiereCambio: true, tieneRestablecimiento: false },
    { username: 'rg', requiereCambio: true, tieneRestablecimiento: false },
    { username: 'gf', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'jm', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'sairy', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'ag', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'yd', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'daysi', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'afj', requiereCambio: false, tieneRestablecimiento: true },
    { username: 'wandy', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'cintia', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'felix', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'oliver', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'cb', requiereCambio: false, tieneRestablecimiento: false },
    { username: 'bola', requiereCambio: false, tieneRestablecimiento: true },
    { username: 'genesis', requiereCambio: true, tieneRestablecimiento: false },
  ];

  // State
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [selectedUsername, setSelectedUsername] = useState<string>('');

  // Filtered administradores based on search
  const filteredAdministradores = useMemo(() => {
    return administradores.filter(admin =>
      admin.username.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  // Paginated administradores
  const paginatedAdministradores = useMemo(() => {
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
  const handlePasswordClick = useCallback((username: string) => {
    setSelectedUsername(username);
    setPasswordModalOpen(true);
  }, []);

  /**
   * Handle close password modal
   */
  const handleClosePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    setSelectedUsername('');
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

    // Handlers
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
    handleResetPassword,
  };
};

export default useUserAdministrators;
