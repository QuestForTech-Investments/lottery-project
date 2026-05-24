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
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import useZonesList from './hooks/useZonesList';
import { deactivateZone } from '@/services/zoneService';

interface Zone {
  zoneId: number;
  zoneName: string;
  description?: string;
  isActive: boolean;
}

interface Column {
  id: string;
  label: string;
  sortable: boolean;
  align: 'left' | 'center' | 'right';
}

/**
 * ZonesListMUI Component
 * Modern Material-UI version for Zones Management
 */
const ZonesListMUI = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    zones,
    totalZones,
    allZonesCount,
    loading,
    error,
    searchText,
    handleSearchChange,
    handleClearSearch,
    showActiveOnly,
    handleActiveFilterToggle,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    orderBy,
    order,
    handleRequestSort,
    handleRefresh,
  } = useZonesList();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

  const handleEdit = useCallback((zoneId: number) => {
    navigate(`/zones/edit/${zoneId}`);
  }, [navigate]);

  const handleDeleteClick = useCallback((zone: Zone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!zoneToDelete) return;

    try {
      await deactivateZone(zoneToDelete.zoneId);
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
      handleRefresh();
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting zone:', err);
      alert(t('zonesAdmin.deleteError', { message: error.message }));
    }
  }, [zoneToDelete, handleRefresh, t]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setZoneToDelete(null);
  }, []);

  const handleCreateNew = useCallback(() => {
    navigate('/zones/new');
  }, [navigate]);

  const createSortHandler = useCallback((property: string) => () => {
    handleRequestSort(property);
  }, [handleRequestSort]);

  const columns: Column[] = [
    { id: 'zoneId', label: t('zonesAdmin.id'), sortable: true, align: 'left' },
    { id: 'zoneName', label: t('zonesAdmin.name'), sortable: true, align: 'left' },
    { id: 'description', label: t('zonesAdmin.description'), sortable: true, align: 'left' },
    { id: 'isActive', label: t('zonesAdmin.isActive'), sortable: true, align: 'center' },
    { id: 'actions', label: t('zonesAdmin.actions'), sortable: false, align: 'center' },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Paper elevation={3}>
        <Box sx={{ p: { xs: 1.5, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h5" component="h1" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{t('zonesAdmin.listTitle')}</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew} sx={{ whiteSpace: 'nowrap' }}>{t('zonesAdmin.newZone')}</Button>
          </Box>
        </Box>

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={handleRefresh} startIcon={<RefreshIcon />}>{t('sales.retry')}</Button>}>
              {error}
            </Alert>
          </Box>
        )}

        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', px: { xs: 1.5, sm: 3 } }}>
          <FormControlLabel control={<Switch checked={showActiveOnly} onChange={handleActiveFilterToggle} size="small" />} label={t('zonesAdmin.activeOnly')} />
          <TextField
            placeholder={t('zonesAdmin.searchPlaceholder')}
            value={searchText}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 300 }, flexGrow: 1, maxWidth: 500 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              endAdornment: searchText && <InputAdornment position="end"><IconButton size="small" onClick={handleClearSearch} edge="end"><ClearIcon /></IconButton></InputAdornment>,
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {!loading && <Typography variant="body2" color="text.secondary">{t('zonesAdmin.countOfTotal', { shown: totalZones, total: allZonesCount })}</Typography>}
            <Tooltip title={t('zonesAdmin.refreshTooltip')}><span><IconButton onClick={handleRefresh} disabled={loading} color="primary"><RefreshIcon /></IconButton></span></Tooltip>
          </Box>
        </Toolbar>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{t('zonesAdmin.loadingZones')}</Typography>
            </Box>
          </Box>
        )}

        {!loading && (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: 500, sm: 'auto' } }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align} sortDirection={orderBy === column.id ? order : false}>
                        {column.sortable ? (
                          <TableSortLabel active={orderBy === column.id} direction={orderBy === column.id ? order : 'asc'} onClick={createSortHandler(column.id)}>{column.label}</TableSortLabel>
                        ) : column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {zones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">{searchText || showActiveOnly ? t('zonesAdmin.noZonesFound') : t('zonesAdmin.noZonesAvailable')}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    zones.map((zone) => (
                      <TableRow key={zone.zoneId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell><Chip label={zone.zoneId} size="small" color="primary" variant="outlined" /></TableCell>
                        <TableCell><Typography variant="body2" fontWeight="medium">{zone.zoneName}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{zone.description || '-'}</Typography></TableCell>
                        <TableCell align="center"><Chip label={zone.isActive ? t('zonesAdmin.active') : t('zonesAdmin.inactive')} size="small" color={zone.isActive ? 'success' : 'default'} variant={zone.isActive ? 'filled' : 'outlined'} /></TableCell>
                        <TableCell align="center">
                          <Tooltip title={t('zonesAdmin.editZone')}><IconButton size="small" sx={{ color: '#51BCDA' }} onClick={() => handleEdit(zone.zoneId)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title={t('zonesAdmin.deleteZone')}><IconButton size="small" sx={{ color: '#FF7043', ml: 1 }} onClick={() => handleDeleteClick(zone)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {zones.length > 0 && (
              <TablePagination
                component="div"
                count={totalZones}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 20, label: '20' }, { value: 50, label: '50' }, { value: 100, label: '100' }, { value: 0, label: t('common.all') }]}
                labelRowsPerPage={t('balances.entriesPerPage')}
                labelDisplayedRows={({ from, to, count }) => rowsPerPage === 0 || rowsPerPage === -1 ? t('zonesAdmin.showingEntries', { count }) : `${from}-${to} ${t('common.of')} ${count !== -1 ? count : `${t('zonesAdmin.moreThan', { count: to })}`}`}
              />
            )}
          </>
        )}
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t('zonesAdmin.deleteDialogTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('zonesAdmin.deleteConfirmation', { name: zoneToDelete?.zoneName ?? '' })}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">{t('common.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(ZonesListMUI);
