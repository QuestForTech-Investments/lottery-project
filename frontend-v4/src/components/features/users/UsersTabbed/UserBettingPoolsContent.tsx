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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  VpnKey as KeyIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import useUserBettingPools from '../../betting-pools/UserBettingPools/hooks/useUserBettingPools';

/**
 * UserBettingPoolsContent Component
 * Content for Bancas tab - without Paper wrapper
 */
const UserBettingPoolsContent: React.FC = () => {
  const {
    users,
    totalUsers,
    zones,
    selectedZones,
    searchText,
    page,
    rowsPerPage,
    passwordModalOpen,
    selectedUsername,
    loading,
    error,
    handleZoneChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
    refreshData,
  } = useUserBettingPools();

  // Local state for password change
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  /**
   * Handle save password
   */
  const handleSavePassword = (): void => {
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
  const handleClose = (): void => {
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

      {/* Filters */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Zone Filter */}
          <FormControl sx={{ minWidth: 300 }} size="small">
            <InputLabel>Zonas</InputLabel>
            <Select
              multiple
              value={selectedZones}
              onChange={handleZoneChange}
              label="Zonas"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === zones.length ? (
                    <Chip size="small" label="Todas las zonas" />
                  ) : (
                    <Chip size="small" label={`${selected.length} seleccionadas`} />
                  )}
                </Box>
              )}
            >
              <MenuItem value="all">
                <Checkbox checked={selectedZones.length === zones.length} />
                <ListItemText primary="Seleccionar todas" />
              </MenuItem>
              {zones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  <Checkbox checked={selectedZones.includes(zone)} />
                  <ListItemText primary={zone} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search Filter */}
          <TextField
            placeholder="Búsqueda rápida..."
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

          {/* Refresh Button */}
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
                <strong>Usuario</strong>
              </TableCell>
              <TableCell>
                <strong>Banca</strong>
              </TableCell>
              <TableCell>
                <strong>Referencia</strong>
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
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando usuarios...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No se encontraron usuarios
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.bettingPool}</TableCell>
                  <TableCell>{user.reference}</TableCell>
                  <TableCell align="center">
                    {user.requiresPasswordChange && (
                      <CheckIcon color="success" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handlePasswordClick(user.id)}
                      title="Cambiar contraseña"
                    >
                      <KeyIcon />
                    </IconButton>
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
        count={totalUsers}
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
