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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import useBettingPoolsList from './hooks/useBettingPoolsList';
import PasswordModal from '@components/modals/PasswordModal';

/**
 * BancasListMUI Component
 * Modern Material-UI version of BancasList
 */
const BancasListMUI = () => {
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

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');

  /**
   * Handle edit betting pool
   */
  const handleEdit = (bettingPoolId) => {
    navigate(`/betting-pools/edit/${bettingPoolId}`);
  };

  /**
   * Handle change password
   */
  const handlePassword = (username) => {
    setSelectedUsername(username);
    setIsPasswordModalOpen(true);
  };

  /**
   * Handle close password modal
   */
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUsername('');
  };

  /**
   * Handle toggle active status
   */
  const handleToggleActive = (bettingPoolId) => {
    console.log(`Toggle active status for betting pool ${bettingPoolId}`);
    // TODO: Implement API call to update betting pool status
  };

  /**
   * Create sort handler for table columns
   */
  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  /**
   * Table columns configuration
   */
  const columns = [
    { id: 'number', label: 'Número', sortable: true, align: 'left' },
    { id: 'name', label: 'Nombre', sortable: true, align: 'left' },
    { id: 'reference', label: 'Referencia', sortable: true, align: 'left' },
    { id: 'users', label: 'Usuarios', sortable: false, align: 'left' },
    { id: 'isActive', label: 'Activa', sortable: true, align: 'center' },
    { id: 'zone', label: 'Zona', sortable: true, align: 'left' },
    { id: 'balance', label: 'Balance', sortable: true, align: 'right' },
    { id: 'accumulatedFall', label: 'Caída Acumulada', sortable: true, align: 'right' },
    { id: 'loans', label: 'Préstamos', sortable: true, align: 'right' },
    { id: 'actions', label: 'Acciones', sortable: false, align: 'center' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Lista de Bancas
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

        {/* Toolbar with filters and search */}
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          {/* Zone Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Zonas</InputLabel>
            <Select
              multiple
              value={selectedZones}
              onChange={(e) => handleZoneChange(e.target.value)}
              input={<OutlinedInput label="Zonas" />}
              renderValue={(selected) => {
                if (selected.includes('all')) {
                  return `${availableZones.length} seleccionadas`;
                }
                return `${selected.length} seleccionadas`;
              }}
            >
              <MenuItem value="all">
                <Checkbox checked={selectedZones.includes('all')} />
                <ListItemText primary="Todas" />
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
            placeholder="Búsqueda rápida..."
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
                {totalBettingPools} de {allBettingPoolsCount} pools
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
                Cargando bancas...
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
                  {bettingPools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchText || selectedZones.length > 1
                            ? 'No se encontraron betting pools que coincidan con los filtros'
                            : 'No hay betting pools disponibles'}
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
                                  label={user}
                                  size="small"
                                  onClick={() => handlePassword(user)}
                                  icon={<KeyIcon />}
                                  sx={{ cursor: 'pointer' }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sin usuarios
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
                            color={pool.balance >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(pool.balance)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {pool.accumulatedFall === null ? (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              color={pool.accumulatedFall >= 0 ? 'success.main' : 'error.main'}
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
                          <Tooltip title="Editar betting pool">
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
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            )}
          </>
        )}
      </Paper>

      {/* Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        username={selectedUsername}
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
