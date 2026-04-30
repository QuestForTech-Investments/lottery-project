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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Clear as ClearIcon,
  VpnKey as KeyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useUserAdministrators from '../UserAdministrators/hooks/useUserAdministrators';
import * as userService from '@services/userService';
import TempCredentialDialog from '@components/modals/TempCredentialDialog';
import ConfirmActionDialog from '@components/modals/ConfirmActionDialog';
import { handleApiError } from '@utils/index';

/**
 * UserAdministratorsContent Component
 * Content for Administrators tab - matches original Vue.js design
 */
const UserAdministratorsContent: React.FC = () => {
  const navigate = useNavigate();
  const {
    administradores,
    totalAdministradores,
    searchText,
    loading,
    error,
    handleSearchChange,
    handleClearSearch,
  } = useUserAdministrators();

  const [quickFilter, setQuickFilter] = useState<string>('');

  // Temporary credential dialog state
  const [tempDialog, setTempDialog] = useState<{ open: boolean; username: string; password: string }>({
    open: false,
    username: '',
    password: '',
  });
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ userId: number; username: string } | null>(null);

  const filteredAdministradores = administradores.filter(admin => {
    const matchesUserFilter = !searchText ||
      admin.username.toLowerCase().includes(searchText.toLowerCase());
    const matchesQuickFilter = !quickFilter ||
      admin.username.toLowerCase().includes(quickFilter.toLowerCase());
    return matchesUserFilter && matchesQuickFilter;
  });

  const handleConfirmGenerate = async () => {
    if (!confirmTarget) return;
    const { userId } = confirmTarget;
    setGeneratingFor(userId);
    try {
      const res = await userService.generateTempPassword(userId);
      setTempDialog({ open: true, username: res.username, password: res.temporaryPassword });
      setConfirmTarget(null);
    } catch (err) {
      alert(handleApiError(err) || 'No se pudo generar la clave temporal');
      setConfirmTarget(null);
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleEditClick = (userId: number) => {
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

      {/* Table - Simplified columns like original */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#e3e3e3' }}>
              <TableCell>
                <strong>Usuario</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Acciones</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando administradores...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredAdministradores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No se encontraron administradores
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAdministradores.map((admin) => (
                <TableRow
                  key={admin.userId}
                  sx={{
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <TableCell>{admin.username}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => setConfirmTarget({ userId: admin.userId, username: admin.username })}
                        disabled={generatingFor === admin.userId}
                        title="Generar clave temporal"
                        sx={{
                          color: '#6366f1',
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' },
                        }}
                      >
                        {generatingFor === admin.userId ? <CircularProgress size={16} /> : <KeyIcon fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(admin.userId)}
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
          Mostrando {filteredAdministradores.length} entradas
        </Typography>
      </Box>

      <ConfirmActionDialog
        isOpen={!!confirmTarget}
        title="Generar clave temporal"
        message={`Se generará una nueva clave para "${confirmTarget?.username}". El usuario deberá cambiarla al iniciar sesión y la actual dejará de funcionar.`}
        confirmLabel="Generar"
        severity="warning"
        loading={generatingFor !== null}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setConfirmTarget(null)}
      />

      <TempCredentialDialog
        isOpen={tempDialog.open}
        username={tempDialog.username}
        password={tempDialog.password}
        onClose={() => setTempDialog({ open: false, username: '', password: '' })}
      />
    </>
  );
};

export default memo(UserAdministratorsContent);
