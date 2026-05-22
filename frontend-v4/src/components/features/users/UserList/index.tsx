import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getActiveLocale } from '@/utils/formatters';

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
  const { t } = useTranslation();
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
      alert(handleApiError(err) || t('usersAdmin.tempPasswordError'));
      setConfirmTarget(null);
    } finally {
      setGeneratingFor(null);
    }
  }, [confirmTarget, t]);

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
      alert(handleApiError(err) || t('usersAdmin.deleteUserError'));
      setDeleteTarget(null);
    } finally {
      setDeletingFor(null);
    }
  }, [deleteTarget, handleRefresh, t]);

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
    { id: 'userId', label: t('usersAdmin.userId'), sortable: true, align: 'left' },
    { id: 'username', label: t('usersAdmin.user'), sortable: true, align: 'left' },
    { id: 'isActive', label: t('usersAdmin.status'), sortable: true, align: 'center' },
    { id: 'createdAt', label: t('usersAdmin.createdAt'), sortable: true, align: 'left' },
    { id: 'actions', label: t('usersAdmin.actions'), sortable: false, align: 'center' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            {t('usersAdmin.listTitleFull')}
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
                  {t('sales.retry')}
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
            placeholder={t('usersAdmin.searchPlaceholder')}
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
                {t('usersAdmin.countOfTotal', { shown: totalUsers, total: allUsersCount })}
              </Typography>
            )}
            <Tooltip title={t('usersAdmin.refreshTooltip')}>
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
                {t('usersAdmin.loadingUsers')}
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
                          {searchText ? t('usersAdmin.noUsersFound') : t('usersAdmin.noUsersAvailable')}
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
                            label={user.isActive ? t('usersAdmin.active') : t('usersAdmin.inactive')}
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(getActiveLocale(), {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title={t('usersAdmin.generateTempPassword')}>
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
                            <Tooltip title={t('usersAdmin.editUser')}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(user.userId)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('usersAdmin.deleteUser')}>
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
                labelRowsPerPage={t('usersAdmin.rowsPerPage')}
                labelDisplayedRows={({ from, to, count }) => {
                  const total = count !== -1 ? String(count) : t('zonesAdmin.moreThan', { count: to });
                  return t('usersAdmin.fromTo', { from, to, total });
                }}
              />
            )}
          </>
        )}
      </Paper>

      <ConfirmActionDialog
        isOpen={!!confirmTarget}
        title={t('usersAdmin.tempPasswordTitle')}
        message={t('usersAdmin.tempPasswordMessage', { username: confirmTarget?.username ?? '' })}
        confirmLabel={t('usersAdmin.generate')}
        severity="warning"
        loading={generatingFor !== null}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setConfirmTarget(null)}
      />

      <ConfirmActionDialog
        isOpen={!!deleteTarget}
        title={t('usersAdmin.deleteUser')}
        message={t('usersAdmin.deleteUserMessage', { username: deleteTarget?.username ?? '' })}
        confirmLabel={t('common.delete')}
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
