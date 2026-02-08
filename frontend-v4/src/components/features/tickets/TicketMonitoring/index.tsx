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
  Autocomplete,
  FormControlLabel,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from '@mui/material';

import { BET_TYPES, ZONES, TICKET_TABLE_HEADERS } from '@constants/index';
import { useTicketMonitoring } from './hooks/useTicketMonitoring';
import { STYLES, COLUMN_WIDTHS, COMPACT_INPUT_STYLE, IOSSwitch } from './constants';
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
        isSelected={selectedTicket?.id === ticket.id}
        onRowClick={handleRowClick}
        onPrint={handlePrintTicket}
        onSend={handleSendTicket}
        onCancel={handleCancelTicket}
      />
    ));
  }, [isLoading, filteredTickets, selectedTicket?.id, handleRowClick, handlePrintTicket, handleSendTicket, handleCancelTicket]);

  return (
    <Paper elevation={3} sx={{ minHeight: 'calc(100vh - 96px)' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" align="center" sx={STYLES.title}>
          Monitor de tickets
        </Typography>

        {error && (
          <Alert severity="error" sx={STYLES.alertMargin} onClose={handleErrorClose}>
            {error}
          </Alert>
        )}

        {/* Filters Section - Row 1: All inputs and toggles */}
        <Box sx={STYLES.filtersRow}>
          <Box>
            <Typography variant="caption" sx={STYLES.filterLabel}>
              Fecha
            </Typography>
            <TextField
              type="date"
              value={fecha}
              onChange={handleFechaChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ width: 200, ...COMPACT_INPUT_STYLE }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={STYLES.filterLabel}>
              Banca
            </Typography>
            <Autocomplete
              options={bancas}
              getOptionLabel={(o) => (o.name ? `${o.name} (${o.code || ''})` : '')}
              value={banca}
              onChange={handleBancaChange}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={COMPACT_INPUT_STYLE} />
              )}
              sx={{ width: 280 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={STYLES.filterLabel}>
              Lotería
            </Typography>
            <Autocomplete
              options={loterias}
              getOptionLabel={(o) => o.name || ''}
              value={loteria}
              onChange={handleLoteriaChange}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={COMPACT_INPUT_STYLE} />
              )}
              sx={{ width: 200 }}
            />
          </Box>
          {!isCompactView && (
            <>
              <Box>
                <Typography variant="caption" sx={STYLES.filterLabel}>
                  Tipo jugada
                </Typography>
                <Autocomplete
                  options={TIPOS_JUGADA}
                  getOptionLabel={(o) => o.name || ''}
                  value={tipoJugada}
                  onChange={handleTipoJugadaChange}
                  renderInput={(params) => (
                    <TextField {...params} size="small" sx={COMPACT_INPUT_STYLE} />
                  )}
                  sx={{ width: 200 }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={STYLES.filterLabel}>
                  Número
                </Typography>
                <TextField
                  value={numero}
                  onChange={handleNumeroChange}
                  size="small"
                  sx={{ width: 200, ...COMPACT_INPUT_STYLE }}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Row 2: Zonas, Filter button, and toggles */}
        <Box sx={{ ...STYLES.filtersRow, mb: 1, alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" sx={STYLES.filterLabel}>
              Zonas
            </Typography>
            <Autocomplete
              options={ZONAS}
              getOptionLabel={(o) => o.name || ''}
              value={zona}
              onChange={handleZonaChange}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={COMPACT_INPUT_STYLE} />
              )}
              sx={{ width: 200 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', pt: 2.5 }}>
            <Button
              variant="contained"
              onClick={handleFilterClick}
              disabled={isLoading || isInitialLoad}
              sx={{ ...STYLES.filterButton, py: 0.6, fontSize: '0.8rem' }}
            >
              {isLoading ? 'Cargando...' : 'Filtrar'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: '42px', pt: 2.5 }}>
            <FormControlLabel
              control={<IOSSwitch checked={pendientesPago} onChange={handlePendientesPagoChange} />}
              label={<Typography variant="body2" sx={{ ml: 1 }}>Pend. pago</Typography>}
              sx={{ mr: 1 }}
            />
            <FormControlLabel
              control={<IOSSwitch checked={soloGanadores} onChange={handleSoloGanadoresChange} />}
              label={<Typography variant="body2" sx={{ ml: 1 }}>Ganadores</Typography>}
              sx={{ ml: '5px' }}
            />
          </Box>
        </Box>


        {/* Status Toggle Buttons */}
        <StatusToggle
          filtroEstado={filtroEstado}
          counts={counts}
          onFilterChange={handleFiltroEstadoChange}
        />

        {/* Totals Panel */}
        <TotalsPanel totals={totals} />

        {/* Table and Detail Panel side by side */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* Left: Quick Search and Table */}
          <Box sx={{ flexShrink: 0 }}>
            {/* Quick Search */}
            <TextField
              placeholder="Filtro rapido"
              value={filtroRapido}
              onChange={handleFiltroRapidoChange}
              size="small"
              sx={{ ...STYLES.quickSearch, mt: '-30px', mb: 1, position: 'relative', zIndex: 1 }}
            />

            {/* Tickets Table */}
            <Box sx={{ height: isCompactView ? 400 : 'calc(100vh - 380px)', mt: '-11px' }}>
              <TableContainer component={Paper} variant="outlined" sx={{ ...STYLES.tableContainer, height: '100%', overflow: 'auto' }}>
                <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead sx={STYLES.tableHeader}>
                    <TableRow>
                      {TABLE_HEADERS.map((h) => (
                        <TableCell
                          key={h}
                          align={h === 'Acciones' ? 'center' : 'left'}
                          sx={{
                            ...STYLES.tableHeaderCell,
                            width: COLUMN_WIDTHS[h] || 'auto',
                                                      }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>{renderTableContent}</TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* Right: Ticket Detail Panel */}
          {selectedTicket && (
            <Box sx={{ flexGrow: 1, minWidth: 350, position: 'sticky', top: 16, mt: '10px' }}>
              <TicketDetailPanel ticket={selectedTicket} onClose={handleCloseDetail} />
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default TicketMonitoring;
