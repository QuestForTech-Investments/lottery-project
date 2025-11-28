import React, { memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Toolbar,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import useUserBlockedSessions from './hooks/useUserBlockedSessions';

/**
 * UserBlockedSessionsMUI Component
 * Modern Material-UI version of UserBlockedSessions
 */
const UserBlockedSessionsMUI = () => {
  const {
    currentTabData,
    totalRecords,
    activeTab,
    searchText,
    page,
    rowsPerPage,
    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleUnlock,
  } = useUserBlockedSessions();

  const isIPTab = activeTab === 'ip';

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
            Sesiones Bloqueadas
          </Typography>
        </Toolbar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Por Contraseña" value="contrasena" />
            <Tab label="Por Pin" value="pin" />
            <Tab label="Direcciones IP" value="ip" />
          </Tabs>
        </Box>

        {/* Search Filter */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            placeholder="Filtrado rápido..."
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
                  <strong>{isIPTab ? 'Dirección IP' : 'Usuario'}</strong>
                </TableCell>
                <TableCell>
                  <strong>Bloqueado en</strong>
                </TableCell>
                <TableCell>
                  <strong>
                    {isIPTab ? 'Usuario durante el bloqueo' : 'IP durante el bloqueo'}
                  </strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Desbloquear</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTabData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No hay entradas disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentTabData.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <TableCell>
                      {isIPTab ? item.ip : item.usuario}
                    </TableCell>
                    <TableCell>{item.bloqueadoEn}</TableCell>
                    <TableCell>
                      {isIPTab ? item.usuario : item.ip}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<LockOpenIcon />}
                        onClick={() => handleUnlock(item)}
                      >
                        Desbloquear
                      </Button>
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
            labelRowsPerPage="Entradas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `Mostrando ${from}-${to} de ${count !== -1 ? count : `más de ${to}`} entradas`
            }
          />
        )}

        {/* Show info even when empty */}
        {currentTabData.length === 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando 0 de 0 entradas
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default memo(UserBlockedSessionsMUI);
