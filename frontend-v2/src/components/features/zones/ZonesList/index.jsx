import React, { useState } from 'react';
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

/**
 * ZonesListMUI Component
 * Modern Material-UI version for Zones Management
 */
const ZonesListMUI = () => {
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  /**
   * Handle edit zone
   */
  const handleEdit = (zoneId) => {
    navigate(`/zones/edit/${zoneId}`);
  };

  /**
   * Handle delete zone
   */
  const handleDeleteClick = (zone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!zoneToDelete) return;

    try {
      await deactivateZone(zoneToDelete.zoneId);
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
      handleRefresh();
    } catch (err) {
      console.error('Error deleting zone:', err);
      alert(`Error al eliminar la zona: ${err.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setZoneToDelete(null);
  };

  /**
   * Handle create new zone
   */
  const handleCreateNew = () => {
    navigate('/zones/new');
  };

  /**
   * Create sort handler for table columns
   */
  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  /**
   * Table columns configuration
   */
  const columns = [
    { id: 'zoneId', label: 'ID', sortable: true, align: 'left' },
    { id: 'zoneName', label: 'Nombre', sortable: true, align: 'left' },
    { id: 'description', label: 'Descripción', sortable: true, align: 'left' },
    { id: 'isActive', label: 'Activa', sortable: true, align: 'center' },
    { id: 'actions', label: 'Acciones', sortable: false, align: 'center' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h1">
              Gestión de Zonas
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
            >
              Nueva Zona
            </Button>
          </Box>
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

        {/* Toolbar with filters and search */}
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          {/* Active Filter */}
          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={handleActiveFilterToggle}
                size="small"
              />
            }
            label="Solo activas"
          />

          {/* Search */}
          <TextField
            placeholder="Buscar por nombre, descripción o ID..."
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
                {totalZones} de {allZonesCount} zonas
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
                Cargando zonas...
              </Typography>
            </Box>
          </Box>
        )}

        {/* Table */}
        {!loading && (
          <>
            <TableContainer>
              <Table size="small">
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
                  {zones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchText || showActiveOnly
                            ? 'No se encontraron zonas que coincidan con los filtros'
                            : 'No hay zonas disponibles'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    zones.map((zone) => (
                      <TableRow
                        key={zone.zoneId}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Chip
                            label={zone.zoneId}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {zone.zoneName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {zone.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={zone.isActive ? 'Activa' : 'Inactiva'}
                            size="small"
                            color={zone.isActive ? 'success' : 'default'}
                            variant={zone.isActive ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar zona">
                            <IconButton
                              size="small"
                              sx={{ color: '#51BCDA' }}
                              onClick={() => handleEdit(zone.zoneId)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar zona">
                            <IconButton
                              size="small"
                              sx={{ color: '#FF7043', ml: 1 }}
                              onClick={() => handleDeleteClick(zone)}
                            >
                              <DeleteIcon fontSize="small" />
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
            {zones.length > 0 && (
              <TablePagination
                component="div"
                count={totalZones}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 20, label: '20' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 0, label: 'Todos' }
                ]}
                labelRowsPerPage="Entradas por página:"
                labelDisplayedRows={({ from, to, count }) => {
                  // When showing all entries
                  if (rowsPerPage === 0 || rowsPerPage === -1) {
                    return `Mostrando ${count} ${count === 1 ? 'entrada' : 'entradas'}`;
                  }
                  return `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`;
                }}
                sx={{
                  '& .MuiTablePagination-select': {
                    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '14px',
                    padding: '4px 28px 4px 8px',
                    border: '1.15px solid rgb(206, 212, 218)',
                    borderRadius: '4px',
                    transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                  },
                  '& .MuiTablePagination-selectLabel': {
                    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                  },
                  '& .MuiTablePagination-displayedRows': {
                    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '14px',
                  }
                }}
              />
            )}
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Eliminar Zona</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la zona "{zoneToDelete?.zoneName}"?
            Esta acción desactivará la zona en el sistema.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/**
 * Memoize ZonesListMUI to prevent unnecessary re-renders
 */
export default React.memo(ZonesListMUI);
