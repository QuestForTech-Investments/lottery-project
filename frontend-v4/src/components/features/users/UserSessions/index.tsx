import React from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Toolbar,
  InputAdornment,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import useUserSessions from './hooks/useUserSessions';

/**
 * UserSessionsMUI Component
 * Modern Material-UI version of UserSessions
 */
const UserSessionsMUI = () => {
  const {
    zones,
    currentTabData,
    totalRecords,
    loading,
    zonesLoading,
    error,
    selectedDate,
    dateError,
    selectedZones,
    activeTab,
    searchText,
    page,
    rowsPerPage,
    hasFiltered,
    getTodayDate,
    handleDateChange,
    handleZoneChange,
    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilter,
  } = useUserSessions();

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
            Inicios de Sesión
          </Typography>
        </Toolbar>

        {/* Filter Section */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha"
                value={selectedDate}
                onChange={handleDateChange}
                error={!!dateError}
                helperText={dateError || 'Seleccione la fecha a consultar'}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: getTodayDate(),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="zone-select-label">Zonas</InputLabel>
                <Select
                  labelId="zone-select-label"
                  multiple
                  value={selectedZones}
                  onChange={handleZoneChange}
                  disabled={zonesLoading}
                  input={<OutlinedInput label="Zonas" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const zone = zones.find(z => z.id === value);
                        return (
                          <Chip
                            key={value}
                            label={zone?.name || value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {zonesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Cargando zonas...
                    </MenuItem>
                  ) : zones.length === 0 ? (
                    <MenuItem disabled>No hay zonas disponibles</MenuItem>
                  ) : (
                    zones.map((zone) => (
                      <MenuItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FilterListIcon />}
                onClick={handleFilter}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? 'Cargando...' : 'Filtrar'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" onClose={() => {}}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Show content only if filter has been applied */}
        {hasFiltered && (
          <>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Bancas" value="bancas" />
                <Tab label="Colisión de IPs" value="colision" />
              </Tabs>
            </Box>

            {/* Search Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                placeholder="Búsqueda rápida por banca o usuario..."
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

            {/* Table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Banca
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Usuario
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Primera sesión (Web)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Última sesión (Web)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Primera sesión (Celular)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Última sesión (Celular)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Primera sesión (App)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Última sesión (App)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    // Loading skeleton rows
                    [...Array(5)].map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        {[...Array(8)].map((_, cellIndex) => (
                          <TableCell key={`skeleton-cell-${cellIndex}`}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : currentTabData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          No hay entradas disponibles
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentTabData.map((log) => (
                      <TableRow
                        key={log.id}
                        sx={{
                          '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                          '&:hover': { bgcolor: 'action.selected' },
                        }}
                      >
                        <TableCell>{log.banca}</TableCell>
                        <TableCell>{log.usuario}</TableCell>
                        <TableCell align="center">
                          {log.primeraWeb || '-'}
                        </TableCell>
                        <TableCell align="center">
                          {log.ultimaWeb || '-'}
                        </TableCell>
                        <TableCell align="center">
                          {log.primeraCelular || '-'}
                        </TableCell>
                        <TableCell align="center">
                          {log.ultimaCelular || '-'}
                        </TableCell>
                        <TableCell align="center">
                          {log.primeraApp || '-'}
                        </TableCell>
                        <TableCell align="center">
                          {log.ultimaApp || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Entry count and Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {currentTabData.length} de {totalRecords} entradas
              </Typography>
              {totalRecords > rowsPerPage && (
                <TablePagination
                  rowsPerPageOptions={[20, 50, 100]}
                  component="div"
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                  }
                  sx={{ '& .MuiTablePagination-toolbar': { minHeight: 40 } }}
                />
              )}
            </Box>
          </>
        )}

        {/* Initial state - before filter is applied */}
        {!hasFiltered && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Cargando sesiones del día...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

/**
 * Memoize UserSessionsMUI to prevent unnecessary re-renders
 * Component only re-renders when session logs data or filters change
 */
export default React.memo(UserSessionsMUI);
