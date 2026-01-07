/**
 * TicketMonitoring Component
 *
 * Main ticket monitoring view with filters, table, and detail panel.
 * Refactored to use useTicketMonitoring hook for state management.
 */

import { useMemo, type FC } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  Switch,
  FormControlLabel,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from '@mui/material';

import { BET_TYPES, ZONES, TICKET_TABLE_HEADERS } from '@constants/index';
import { useTicketMonitoring } from './hooks/useTicketMonitoring';
import { STYLES } from './constants';
import { TicketRow, TicketDetailPanel, StatusToggle, TotalsPanel } from './components';

// ============================================================================
// Constants
// ============================================================================

const TIPOS_JUGADA = BET_TYPES;
const ZONAS = ZONES;
const TABLE_HEADERS = TICKET_TABLE_HEADERS;

// ============================================================================
// Main Component
// ============================================================================

const TicketMonitoring: FC = () => {
  const {
    fecha,
    banca,
    bancas,
    loteria,
    loterias,
    tipoJugada,
    numero,
    pendientesPago,
    soloGanadores,
    zona,
    filtroEstado,
    filtroRapido,
    filteredTickets,
    totals,
    counts,
    selectedTicket,
    isLoading,
    error,
    isInitialLoad,
    isCompactView,
    handleFechaChange,
    handleBancaChange,
    handleLoteriaChange,
    handleTipoJugadaChange,
    handleZonaChange,
    handleNumeroChange,
    handleFiltroRapidoChange,
    handlePendientesPagoChange,
    handleSoloGanadoresChange,
    handleFiltroEstadoChange,
    handleFilterClick,
    handleRowClick,
    handleCloseDetail,
    handlePrintTicket,
    handleSendTicket,
    handleCancelTicket,
    handleErrorClose,
  } = useTicketMonitoring();

  // Render table content
  const renderTableContent = useMemo(() => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={STYLES.loadingCell}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Cargando tickets...
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredTickets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={STYLES.emptyCell}>
            Mostrando 0 entradas
          </TableCell>
        </TableRow>
      );
    }

    return filteredTickets.map((ticket) => (
      <TicketRow
        key={ticket.id}
        ticket={ticket}
        onRowClick={handleRowClick}
        onPrint={handlePrintTicket}
        onSend={handleSendTicket}
        onCancel={handleCancelTicket}
      />
    ));
  }, [isLoading, filteredTickets, handleRowClick, handlePrintTicket, handleSendTicket, handleCancelTicket]);

  return (
    <Box sx={STYLES.container}>
      <Grid container spacing={2}>
        {/* Left Panel - Filters and Table */}
        <Grid item xs={12} md={selectedTicket ? 6 : 12}>
          <Paper elevation={3}>
            <Box sx={STYLES.content}>
              <Typography variant="h5" align="center" sx={STYLES.title}>
                Monitor de tickets
              </Typography>

              {error && (
                <Alert severity="error" sx={STYLES.alertMargin} onClose={handleErrorClose}>
                  {error}
                </Alert>
              )}

              {/* Filters Section */}
              <Grid container spacing={isCompactView ? 1 : 2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={isCompactView ? 6 : 3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha"
                    value={fecha}
                    onChange={handleFechaChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={isCompactView ? 6 : 3}>
                  <Autocomplete
                    options={bancas}
                    getOptionLabel={(o) => (o.name ? `${o.name} (${o.code || ''})` : '')}
                    value={banca}
                    onChange={handleBancaChange}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Banca" size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={isCompactView ? 6 : 3}>
                  <Autocomplete
                    options={loterias}
                    getOptionLabel={(o) => o.name || ''}
                    value={loteria}
                    onChange={handleLoteriaChange}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Lotería" size="small" />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Extended filters - hidden in compact view */}
              {!isCompactView && (
                <>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        options={TIPOS_JUGADA}
                        getOptionLabel={(o) => o.name || ''}
                        value={tipoJugada}
                        onChange={handleTipoJugadaChange}
                        renderInput={(params) => (
                          <TextField {...params} label="Tipo de jugada" size="small" />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Número"
                        value={numero}
                        onChange={handleNumeroChange}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControlLabel
                        control={<Switch checked={pendientesPago} onChange={handlePendientesPagoChange} />}
                        label={<Typography variant="caption">Pendientes de pago</Typography>}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControlLabel
                        control={<Switch checked={soloGanadores} onChange={handleSoloGanadoresChange} />}
                        label={<Typography variant="caption">Sólo tickets ganadores</Typography>}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        options={ZONAS}
                        getOptionLabel={(o) => o.name || ''}
                        value={zona}
                        onChange={handleZonaChange}
                        renderInput={(params) => (
                          <TextField {...params} label="Zonas" size="small" />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        onClick={handleFilterClick}
                        disabled={isLoading || isInitialLoad}
                        sx={STYLES.filterButton}
                      >
                        {isLoading ? 'Cargando...' : 'Filtrar'}
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Compact filter button */}
              {isCompactView && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleFilterClick}
                    disabled={isLoading || isInitialLoad}
                    sx={STYLES.filterButton}
                  >
                    {isLoading ? 'Cargando...' : 'Filtrar'}
                  </Button>
                </Box>
              )}

              {/* Status Toggle Buttons */}
              <StatusToggle
                filtroEstado={filtroEstado}
                counts={counts}
                onFilterChange={handleFiltroEstadoChange}
              />

              {/* Totals Panel */}
              <TotalsPanel totals={totals} isCompact={isCompactView} />

              {/* Quick Search */}
              <TextField
                fullWidth
                placeholder="Filtro rapido"
                value={filtroRapido}
                onChange={handleFiltroRapidoChange}
                size="small"
                sx={STYLES.quickSearch}
              />

              {/* Tickets Table */}
              <Box sx={{ maxHeight: isCompactView ? 400 : 'none', overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={STYLES.tableHeader}>
                      {TABLE_HEADERS.map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            ...STYLES.tableHeaderCell,
                            ...(h === 'Acciones' && { textAlign: 'center' })
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>{renderTableContent}</TableBody>
                </Table>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Ticket Detail */}
        {selectedTicket && (
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 16 }}>
              <TicketDetailPanel ticket={selectedTicket} onClose={handleCloseDetail} />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TicketMonitoring;
