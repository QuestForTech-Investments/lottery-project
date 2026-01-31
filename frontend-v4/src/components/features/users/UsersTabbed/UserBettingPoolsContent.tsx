import React, { useState, memo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import {
  Clear as ClearIcon,
  VpnKey as KeyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useUserBettingPools from '../../betting-pools/UserBettingPools/hooks/useUserBettingPools';

/**
 * UserBettingPoolsContent Component
 * Content for Bancas tab - matches original Vue.js design
 */
const UserBettingPoolsContent: React.FC = () => {
  const navigate = useNavigate();
  const {
    users,
    totalUsers,
    searchText,
    passwordModalOpen,
    selectedUsername,
    loading,
    error,
    handleSearchChange,
    handleClearSearch,
    handlePasswordClick,
    handleClosePasswordModal,
  } = useUserBettingPools();

  // Local state for quick filter
  const [quickFilter, setQuickFilter] = useState<string>('');

  // Local state for password change
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  /**
   * Filter users based on both filters
   */
  const filteredUsers = users.filter(user => {
    const matchesUserFilter = !searchText ||
      user.id.toLowerCase().includes(searchText.toLowerCase()) ||
      user.bettingPool.toLowerCase().includes(searchText.toLowerCase());
    const matchesQuickFilter = !quickFilter ||
      user.id.toLowerCase().includes(quickFilter.toLowerCase()) ||
      user.bettingPool.toLowerCase().includes(quickFilter.toLowerCase());
    return matchesUserFilter && matchesQuickFilter;
  });

  /**
   * Handle save password
   */
  const handleSavePassword = (): void => {
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      // TODO: Call API to update password
      setNewPassword('');
      setConfirmPassword('');
      handleClosePasswordModal();
    } else {
      alert('Las contraseñas no coinciden o son muy cortas (mínimo 6 caracteres)');
    }
  };

  /**
   * Handle close modal and reset password fields
   */
  const handleClose = (): void => {
    setNewPassword('');
    setConfirmPassword('');
    handleClosePasswordModal();
  };

  /**
   * Handle edit betting pool click
   */
  const handleEditBettingPoolClick = (bettingPoolId: number) => {
    navigate(`/betting-pools/${bettingPoolId}/edit`);
  };

  /**
   * Handle edit user click
   */
  const handleEditUserClick = (userId: number) => {
    navigate(`/users/edit/${userId}`);
  };

  return (
    <>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Filters - Two fields like original */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Filtrado por usuario"
            value={searchText}
            onChange={handleSearchChange}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            placeholder="Filtro rapido"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              endAdornment: quickFilter && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuickFilter('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Table - Columns: Usuario, Banca, Número, Acciones */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#e3e3e3' }}>
              <TableCell>
                <strong>Usuario</strong>
              </TableCell>
              <TableCell>
                <strong>Banca</strong>
              </TableCell>
              <TableCell>
                <strong>Número</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Acciones</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando usuarios...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No se encontraron usuarios
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleEditBettingPoolClick(user.bettingPoolId)}
                      sx={{ color: '#8b5cf6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {user.bettingPool}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleEditBettingPoolClick(user.bettingPoolId)}
                      sx={{ color: '#8b5cf6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {user.bettingPoolId}
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePasswordClick(user.id)}
                        title="Cambiar contraseña"
                        sx={{
                          color: '#6366f1',
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' },
                        }}
                      >
                        <KeyIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUserClick(user.userId || 0)}
                        title="Editar usuario"
                        sx={{
                          color: '#6366f1',
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer with count */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {filteredUsers.length} entradas
        </Typography>
      </Box>

      {/* Password Change Dialog */}
      <Dialog open={passwordModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar Contraseña - Usuario {selectedUsername}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Mínimo 6 caracteres"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={newPassword !== confirmPassword && confirmPassword !== ''}
              helperText={
                newPassword !== confirmPassword && confirmPassword !== ''
                  ? 'Las contraseñas no coinciden'
                  : ''
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSavePassword}
            variant="contained"
            disabled={
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              newPassword.length < 6
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(UserBettingPoolsContent);
