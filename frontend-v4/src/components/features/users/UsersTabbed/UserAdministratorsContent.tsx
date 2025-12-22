import React, { useState, memo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  VpnKey as KeyIcon,
  Replay as ReplayIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import useUserAdministrators from '../UserAdministrators/hooks/useUserAdministrators';

/**
 * UserAdministratorsContent Component
 * Content for Administrators tab - without Paper wrapper
 */
const UserAdministratorsContent: React.FC = () => {
  const {
    administradores,
    totalAdministradores,
    searchText,
    page,
    rowsPerPage,
    passwordModalOpen,
    selectedUsername,
    loading,
    error,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
    handleResetPassword,
    refreshData,
  } = useUserAdministrators();

  // Local state for password change
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  /**
   * Handle save password
   */
  const handleSavePassword = () => {
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      // TODO: Call API to update password
      console.log('Update password for user:', selectedUsername, 'to:', newPassword);
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
  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    handleClosePasswordModal();
  };

  return (
    <>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Filter */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Búsqueda rápida por nombre de usuario..."
            value={searchText}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={refreshData}
            disabled={loading}
            title="Actualizar datos"
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Nombre de usuario</strong>
              </TableCell>
              <TableCell>
                <strong>Nombre completo</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Requiere cambio de contraseña</strong>
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
                      Cargando administradores...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : administradores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No se encontraron administradores
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              administradores.map((admin) => (
                <TableRow
                  key={admin.userId}
                  sx={{
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.fullName || '-'}</TableCell>
                  <TableCell align="center">
                    {admin.requiereCambio && (
                      <CheckIcon color="success" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handlePasswordClick(admin.userId, admin.username)}
                        title="Cambiar contraseña"
                      >
                        <KeyIcon />
                      </IconButton>
                      {admin.tieneRestablecimiento && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReplayIcon />}
                          onClick={() => handleResetPassword(admin.username)}
                          title="Restablecer contraseña"
                        >
                          Restablecer
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        component="div"
        count={totalAdministradores}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />

      {/* Password Change Dialog */}
      <Dialog open={passwordModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar Contraseña - {selectedUsername}
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

export default memo(UserAdministratorsContent);
