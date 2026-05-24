import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
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
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  type SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import useBettingPoolsList from './hooks/useBettingPoolsList';
import TempCredentialDialog from '@components/modals/TempCredentialDialog';
import ConfirmActionDialog from '@components/modals/ConfirmActionDialog';
import * as userService from '@services/userService';
import { handleApiError } from '@utils/index';
import { formatCurrency } from '@/utils/formatCurrency';
import { updateAccumulatedFall } from '@/services/caidaService';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface BettingPoolUserApi {
  userId: number;
  username: string;
}

interface TableColumn {
  id: string;
  label: string;
  sortable: boolean;
  align: 'left' | 'right' | 'center';
}

/**
 * BancasListMUI Component
 * Modern Material-UI version of BancasList
 */
const BancasListMUI: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    bettingPools,
    totalBettingPools,
    allBettingPoolsCount,
    loading,
    error,
    availableZones,
    selectedZones,
    handleZoneChange,
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
  } = useBettingPoolsList();

  const { hasPermission } = useUserPermissions();
  const canEditCaida = hasPermission('EDIT_ACCUMULATED_FALL');

  // Temp credential dialog state
  const [tempDialog, setTempDialog] = useState<{ open: boolean; username: string; password: string }>({
    open: false,
    username: '',
    password: '',
  });
  const [confirmTarget, setConfirmTarget] = useState<{ poolId: number; username: string } | null>(null);
  const [generatingPassword, setGeneratingPassword] = useState<boolean>(false);

  // Caída acumulada modal state
  const [caidaModal, setCaidaModal] = useState<{ open: boolean; poolId: number; poolName: string; currentValue: number }>({ open: false, poolId: 0, poolName: '', currentValue: 0 });
  const [caidaNewValue, setCaidaNewValue] = useState<string>('');
  const [caidaSaving, setCaidaSaving] = useState(false);
  const [caidaError, setCaidaError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleOpenCaidaModal = (poolId: number, poolName: string, currentValue: number | null): void => {
    setCaidaModal({ open: true, poolId, poolName, currentValue: currentValue ?? 0 });
    setCaidaNewValue('');
    setCaidaError('');
  };

  const handleSaveCaida = async (): Promise<void> => {
    const val = parseFloat(caidaNewValue);
    if (isNaN(val)) { setCaidaError(t('bettingPoolsAdmin.enterValidValue')); return; }
    if (val > 0) { setCaidaError(t('bettingPoolsAdmin.accumulatedFallMustBeNegative')); return; }

    setCaidaSaving(true);
    try {
      await updateAccumulatedFall(caidaModal.poolId, val);
      setCaidaModal({ open: false, poolId: 0, poolName: '', currentValue: 0 });
      setSnackbar({ open: true, message: t('bettingPoolsAdmin.accumulatedFallUpdated') });
      handleRefresh();
    } catch {
      setCaidaError(t('bettingPoolsAdmin.accumulatedFallUpdateError'));
    } finally {
      setCaidaSaving(false);
    }
  };

  /**
   * Handle edit betting pool
   */
  const handleEdit = (bettingPoolId: number): void => {
    navigate(`/betting-pools/edit/${bettingPoolId}`);
  };

  /**
   * Generate a fresh temp password for a banca user.
   * Looks up the userId by username via the betting-pool's user list, then calls the API.
   */
  const handleConfirmGenerate = async (): Promise<void> => {
    if (!confirmTarget) return;
    setGeneratingPassword(true);
    try {
      const poolUsers = await api.get<BettingPoolUserApi[]>(`/betting-pools/${confirmTarget.poolId}/users`);
      const match = (poolUsers || []).find(
        u => u.username.toLowerCase() === confirmTarget.username.toLowerCase()
      );
      if (!match) {
        alert(t('bettingPoolsAdmin.userNotFoundInPool'));
        setConfirmTarget(null);
        return;
      }
      const res = await userService.generateTempPassword(match.userId);
      setTempDialog({ open: true, username: res.username, password: res.temporaryPassword });
      setConfirmTarget(null);
    } catch (err) {
      alert(handleApiError(err) || t('bettingPoolsAdmin.couldNotGenerateTempPassword'));
      setConfirmTarget(null);
    } finally {
      setGeneratingPassword(false);
    }
  };

  /**
   * Handle toggle active status
   */
  const handleToggleActive = useCallback(async (bettingPoolId: number): Promise<void> => {
    const pool = bettingPools.find(p => p.id === bettingPoolId);
    if (!pool) return;
    try {
      await api.put(`/betting-pools/${bettingPoolId}`, { isActive: !pool.isActive });
      handleRefresh();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  }, [bettingPools, handleRefresh]);

  /**
   * Create sort handler for table columns
   */
  const createSortHandler = (property: string) => (): void => {
    handleRequestSort(property);
  };

  /**
   * Table columns configuration
   */
  const columns: TableColumn[] = [
    { id: 'number', label: t('bettingPoolsAdmin.tableNumber'), sortable: true, align: 'left' },
    { id: 'name', label: t('bettingPoolsAdmin.tableName'), sortable: true, align: 'left' },
    { id: 'reference', label: t('bettingPoolsAdmin.tableReference'), sortable: true, align: 'left' },
    { id: 'users', label: t('bettingPoolsAdmin.tableUsers'), sortable: true, align: 'left' },
    { id: 'isActive', label: t('bettingPoolsAdmin.tableActive'), sortable: true, align: 'center' },
    { id: 'zone', label: t('bettingPoolsAdmin.tableZone'), sortable: true, align: 'left' },
    { id: 'balance', label: t('bettingPoolsAdmin.tableBalance'), sortable: true, align: 'right' },
    { id: 'accumulatedFall', label: t('bettingPoolsAdmin.tableAccumulatedFall'), sortable: true, align: 'right' },
    { id: 'loans', label: t('bettingPoolsAdmin.tableLoans'), sortable: true, align: 'right' },
    { id: 'actions', label: t('bettingPoolsAdmin.tableActions'), sortable: false, align: 'center' },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: { xs: 1.5, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, m: 0 }}>
            {t('bettingPoolsAdmin.listTitle')}
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

        {/* Toolbar with filters and search */}
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', px: { xs: 1.5, sm: 3 } }}>
          {/* Zone Filter */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>{t('common.zones')}</InputLabel>
            <Select
              multiple
              value={selectedZones}
              onChange={(e: SelectChangeEvent<string[]>) => handleZoneChange(e.target.value as string[])}
              input={<OutlinedInput label={t('common.zones')} />}
              renderValue={(selected) => {
                if (selected.includes('all')) {
                  return t('bettingPoolsAdmin.selectedCount', { count: availableZones.length });
                }
                return t('bettingPoolsAdmin.selectedCount', { count: selected.length });
              }}
            >
              <MenuItem value="all">
                <Checkbox checked={selectedZones.includes('all')} />
                <ListItemText primary={t('common.all')} />
              </MenuItem>
              {availableZones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  <Checkbox checked={selectedZones.includes(zone)} />
                  <ListItemText primary={zone} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search */}
          <TextField
            placeholder={t('bettingPoolsAdmin.quickSearchPlaceholder')}
            value={searchText}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 300 }, flexGrow: 1, maxWidth: 500 }}
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
                {t('bettingPoolsAdmin.countOfTotal', { shown: totalBettingPools, total: allBettingPoolsCount })}
              </Typography>
            )}
            <Tooltip title={t('bettingPoolsAdmin.refreshList')}>
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
                {t('bettingPoolsAdmin.loadingBettingPools')}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Table */}
        {!loading && (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: 600, sm: 'auto' } }}>
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
                            onClick={createSortHandler(column.id)}
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
                  {bettingPools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchText || selectedZones.length > 1
                            ? t('bettingPoolsAdmin.noBettingPoolsMatch')
                            : t('bettingPoolsAdmin.noBettingPoolsAvailable')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bettingPools.map((pool) => (
                      <TableRow
                        key={pool.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{pool.number}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {pool.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {pool.reference}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {pool.users.length > 0 ? (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {pool.users.map((user, idx) => (
                                <Chip
                                  key={idx}
                                  label={user.toUpperCase()}
                                  size="small"
                                  onClick={() => setConfirmTarget({ poolId: pool.id, username: user })}
                                  icon={<KeyIcon />}
                                  sx={{ cursor: 'pointer' }}
                                  title={t('bettingPoolsAdmin.generateTempPassword')}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {t('bettingPoolsAdmin.noUsers')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={pool.isActive}
                            onChange={() => handleToggleActive(pool.id)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={pool.zone}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              color: pool.balance > 0 ? '#2e7d32' : pool.balance < 0 ? '#c62828' : '#1565c0',
                              fontWeight: 600
                            }}
                          >
                            {formatCurrency(pool.balance)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          onClick={canEditCaida ? () => handleOpenCaidaModal(pool.id, pool.name, pool.accumulatedFall) : undefined}
                          sx={canEditCaida ? { cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } } : {}}
                        >
                          {pool.accumulatedFall === null ? (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              color={pool.accumulatedFall >= 0 ? 'success.main' : 'error.main'}
                              sx={{}}
                            >
                              {formatCurrency(pool.accumulatedFall)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(pool.loans)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={t('bettingPoolsAdmin.editBettingPool')}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(pool.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {bettingPools.length > 0 && (
              <TablePagination
                component="div"
                count={totalBettingPools}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100, 200, { value: -1, label: t('bettingPoolsAdmin.rowsAll') }]}
                labelRowsPerPage={t('bettingPoolsAdmin.rowsLabel')}
                labelDisplayedRows={({ from, to, count }) =>
                  rowsPerPage === -1
                    ? t('bettingPoolsAdmin.totalRecords', { total: count })
                    : count !== -1
                      ? t('bettingPoolsAdmin.fromToOfTotal', { from, to, total: count })
                      : t('bettingPoolsAdmin.fromToMoreThan', { from, to })
                }
              />
            )}
          </>
        )}
      </Paper>

      <ConfirmActionDialog
        isOpen={!!confirmTarget}
        title={t('bettingPoolsAdmin.confirmGeneratePasswordTitle')}
        message={t('bettingPoolsAdmin.confirmGeneratePasswordMessage', { username: confirmTarget?.username.toUpperCase() ?? '' })}
        confirmLabel={t('bettingPoolsAdmin.generate')}
        severity="warning"
        loading={generatingPassword}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setConfirmTarget(null)}
      />

      <TempCredentialDialog
        isOpen={tempDialog.open}
        username={tempDialog.username.toUpperCase()}
        password={tempDialog.password}
        onClose={() => setTempDialog({ open: false, username: '', password: '' })}
      />

      {/* Edit Caída Acumulada Modal */}
      <Dialog
        open={caidaModal.open}
        onClose={() => setCaidaModal({ open: false, poolId: 0, poolName: '', currentValue: 0 })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>{t('bettingPoolsAdmin.editAccumulatedFallTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {caidaModal.poolName}
          </Typography>

          <TextField
            label={t('bettingPoolsAdmin.currentAccumulatedFall')}
            value={formatCurrency(caidaModal.currentValue)}
            fullWidth
            size="small"
            disabled
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            label={t('bettingPoolsAdmin.newAccumulatedFall')}
            type="number"
            value={caidaNewValue}
            onChange={(e) => { setCaidaNewValue(e.target.value); setCaidaError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCaida(); }}
            fullWidth
            size="small"
            autoFocus
            error={!!caidaError}
            helperText={caidaError || t('bettingPoolsAdmin.accumulatedFallHelper')}
            inputProps={{ max: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCaidaModal({ open: false, poolId: 0, poolName: '', currentValue: 0 })}
            sx={{ color: '#666' }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSaveCaida}
            disabled={caidaSaving || !caidaNewValue}
            variant="contained"
            sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b8bb' } }}
          >
            {caidaSaving ? t('common.saving') : t('bettingPoolsAdmin.ok')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

/**
 * Memoize BancasListMUI to prevent unnecessary re-renders
 * Component only re-renders when bancas data or filters change
 * Important: Bancas have complex rows (chips, switches, currency formatting)
 */
export default React.memo(BancasListMUI);
