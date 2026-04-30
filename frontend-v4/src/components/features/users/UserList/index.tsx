import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TableSortLabel,
  TextField,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  InputAdornment,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import useUserList from './hooks/useUserList';
import TempCredentialDialog from '@components/modals/TempCredentialDialog';
import ConfirmActionDialog from '@components/modals/ConfirmActionDialog';
import * as userService from '@services/userService';
import { handleApiError } from '@utils/index';
import * as logger from '@/utils/logger';
import type { UserSortField } from '@/types/user';

interface TableColumn {
  id: string;
  label: string;
  sortable: boolean;
  align: 'left' | 'right' | 'center';
}

/**
 * UserListMUI Component
 * Modern Material-UI version of UserList with enhanced UX
 */
const UserListMUI = () => {
  const navigate = useNavigate();
  const {
    users,
    totalUsers,
    allUsersCount,
    loading,
    error,
    searchText,
    handleSearchChange,
    handleClearSearch,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    orderBy,
    order,
    handleRequestSort,
    handleRefresh,
  } = useUserList();

  // Temporary credential dialog state
  const [tempDialog, setTempDialog] = useState<{ open: boolean; username: string; password: string }>({
    open: false,
    username: '',
    password: '',
  });
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ userId: number; username: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ userId: number; username: string } | null>(null);
  const [deletingFor, setDeletingFor] = useState<number | null>(null);

  const handleEdit = useCallback((userId: number) => {
    logger.info('USER_LIST_MUI', `Editing user ID: ${userId}`);
    navigate(`/users/edit/${userId}`);
  }, [navigate]);

  const handleConfirmGenerate = useCallback(async () => {
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
  }, [confirmTarget]);

  const handleCloseTempDialog = useCallback(() => {
    setTempDialog({ open: false, username: '', password: '' });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { userId } = deleteTarget;
    setDeletingFor(userId);
    try {
      await userService.deactivateUser(userId);
      setDeleteTarget(null);
      handleRefresh();
    } catch (err) {
      alert(handleApiError(err) || 'No se pudo eliminar el usuario');
      setDeleteTarget(null);
    } finally {
      setDeletingFor(null);
    }
  }, [deleteTarget, handleRefresh]);

  /**
   * Create sort handler for table columns
   * useCallback: Prevents recreation on every render
   */
  const createSortHandler = useCallback((property: UserSortField) => () => {
    handleRequestSort(property);
  }, [handleRequestSort]);

  /**
   * Table columns configuration
   */
  const columns: TableColumn[] = [
    { id: 'userId', label: 'ID', sortable: true, align: 'left' },
    { id: 'username', label: 'Usuario', sortable: true, align: 'left' },
    { id: 'isActive', label: 'Estado', sortable: true, align: 'center' },
    { id: 'createdAt', label: 'Fecha Creación', sortable: true, align: 'left' },
    { id: 'actions', label: 'Acciones', sortable: false, align: 'center' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Lista de Usuarios
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                >
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Toolbar with search and actions */}
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por usuario, nombre o email..."
            value={searchText}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: 300, flexGrow: 1, maxWidth: 500 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {!loading && (
              <Typography variant="body2" color="text.secondary">
                {totalUsers} de {allUsersCount} usuarios
              </Typography>
            )}
            <Tooltip title="Actualizar lista">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading}
                  color="primary"
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Cargando usuarios desde la API...
              </Typography>
            </Box>
          </Box>
        )}

        {/* Table */}
        {!loading && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sortDirection={orderBy === column.id ? order : false}
                      >
                        {column.sortable ? (
                          <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={createSortHandler(column.id as UserSortField)}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchText ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios disponibles'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.userId}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {user.username}
                          </Typography>
                          {user.fullName && (
                            <Typography variant="caption" color="text.secondary">
                              {user.fullName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={user.isActive ? 'Activo' : 'Inactivo'}
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Generar clave temporal">
                              <span>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  disabled={generatingFor === user.userId}
                                  onClick={() => setConfirmTarget({ userId: user.userId, username: user.username })}
                                >
                                  <KeyIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Editar usuario">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(user.userId)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar usuario">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={deletingFor === user.userId}
                                  onClick={() => setDeleteTarget({ userId: user.userId, username: user.username })}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {users.length > 0 && (
              <TablePagination
                component="div"
                count={totalUsers}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            )}
          </>
        )}
      </Paper>

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

      <ConfirmActionDialog
        isOpen={!!deleteTarget}
        title="Eliminar usuario"
        message={`¿Eliminar al usuario "${deleteTarget?.username}"? El usuario será desactivado y no podrá acceder al sistema.`}
        confirmLabel="Eliminar"
        severity="danger"
        loading={deletingFor !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <TempCredentialDialog
        isOpen={tempDialog.open}
        username={tempDialog.username}
        password={tempDialog.password}
        onClose={handleCloseTempDialog}
      />
    </Box>
  );
};

/**
 * Memoize UserListMUI to prevent unnecessary re-renders
 * Component only re-renders when users data or filters change
 */
export default React.memo(UserListMUI);
