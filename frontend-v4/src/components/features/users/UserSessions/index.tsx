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
                  {zones.map((zone) => (
                    <MenuItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{ height: '56px' }}
              >
                Filtrar
              </Button>
            </Grid>
          </Grid>
        </Box>

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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Banca</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Usuario</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Primera sesión (Web)</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Última sesión (Web)</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Primera sesión (Celular)</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Última sesión (Celular)</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Primera sesión (App)</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Última sesión (App)</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentTabData.length === 0 ? (
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

            {/* Pagination */}
            {currentTabData.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                component="div"
                count={totalRecords}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            )}
          </>
        )}

        {/* Initial state - before filter is applied */}
        {!hasFiltered && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Seleccione una fecha y aplique los filtros para ver los inicios de sesión
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
