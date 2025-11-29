import React, { useState, memo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Toolbar,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  VpnKey as KeyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import useUserBettingPools from './hooks/useUserBettingPools';

interface _User {
  id: string;
  bettingPool: string;
  reference: string;
  requiresPasswordChange: boolean;
}

/**
 * UserBancasMUI Component
 * Modern Material-UI version of UserBancas
 */
const UserBancasMUI: React.FC = () => {
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
    handleZoneChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handlePasswordClick,
    handleClosePasswordModal,
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
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, py: 2 }}>
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            component="div"
          >
            Lista de Usuarios
          </Typography>
        </Toolbar>

        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Zone Filter */}
            <FormControl sx={{ minWidth: 300 }}>
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No se encontraron usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, _index) => (
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
      </Paper>

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
    </Box>
  );
};

/**
 * Memoize UserBancasMUI to prevent unnecessary re-renders
 * Component only re-renders when usuarios data or filters change
 */
export default memo(UserBancasMUI);
