/**
 * TicketMonitoring Component
 *
 * Main ticket monitoring view with filters, table, and detail panel.
 * Refactored to use useTicketMonitoring hook for state management.
 */

import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  TableSortLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTicketMonitoring } from './hooks/useTicketMonitoring';
import { STYLES, COLUMN_WIDTHS, COMPACT_INPUT_STYLE, IOSSwitch } from './constants';
import { TicketRow, TicketDetailPanel, StatusToggle, TotalsPanel } from './components';
import { MultiSelectSearch } from '@/components/common';
import { placeholderForBetType } from './numberPlaceholder';
import { useTableSort } from '@/utils/useTableSort';
import type { MappedTicket } from '@services/ticketService';

// ============================================================================
// Constants
// ============================================================================

// Each table column: an i18n key + the sort field on MappedTicket. `null` sort
// means the column isn't sortable (the icons column and "Acciones").
// "Fecha" sorts by raw timestamp so the user gets chronological order
// instead of alphabetical formatted strings.
const TABLE_COLUMNS: Array<{ key: string; sortKey: keyof MappedTicket | 'rawCreatedAt' | null }> = [
  { key: 'common.number', sortKey: 'numero' },
  { key: '', sortKey: null },
  { key: 'common.date', sortKey: 'rawCreatedAt' },
  { key: 'common.user', sortKey: 'usuario' },
  { key: 'common.amount', sortKey: 'monto' },
  { key: 'common.prize', sortKey: 'premio' },
  { key: 'tickets.anomalies.cancellationDate', sortKey: 'fechaCancelacion' },
  { key: 'common.status', sortKey: 'estado' },
  { key: 'common.actions', sortKey: null },
];

// ============================================================================
// Main Component
// ============================================================================

const TicketMonitoring: FC = () => {
  const { t } = useTranslation();
  const {
    fecha,
    banca,
    bancas,
    loteria,
    loterias,
    tipoJugada,
    tiposJugada,
    numero,
    pendientesPago,
    soloGanadores,
    zonas,
    zonasList,
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
    handleZonasChange,
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

  // Client-side sort on top of whatever the API returns.
  const { sortedData: sortedTickets, getSortProps } = useTableSort<MappedTicket, string>(
    filteredTickets,
    (row, key) => (row as unknown as Record<string, string | number>)[key],
    { sortBy: 'rawCreatedAt', sortOrder: 'desc' },
  );

  // Render table content
  const renderTableContent = useMemo(() => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={STYLES.loadingCell}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              {t('common.loading')}
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (sortedTickets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={STYLES.emptyCell}>
            {t('common.showingEntries', { shown: 0, total: 0 })}
          </TableCell>
        </TableRow>
      );
    }

    return sortedTickets.map((ticket) => (
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
  }, [isLoading, sortedTickets, selectedTicket?.id, handleRowClick, handlePrintTicket, handleSendTicket, handleCancelTicket, t]);

  return (
    <Paper elevation={3} sx={{ minHeight: 'calc(100vh - 96px)' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" align="center" sx={STYLES.title}>
          {t('tickets.monitoring.title')}
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
              {t('common.date')}
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
              {t('common.bettingPool')}
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
              {t('common.draw')}
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
              sx={{ width: 220 }}
            />
          </Box>
          {!isCompactView && (
            <>
              <Box>
                <Typography variant="caption" sx={STYLES.filterLabel}>
                  {t('tickets.plays.playType')}
                </Typography>
                <Autocomplete
                  options={tiposJugada}
                  getOptionLabel={(o) => o.name || ''}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
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
                  {t('common.number')}
                </Typography>
                <TextField
                  value={numero}
                  onChange={handleNumeroChange}
                  size="small"
                  placeholder={placeholderForBetType(tipoJugada?.code, tipoJugada?.numberLength)}
                  sx={{ width: 200, ...COMPACT_INPUT_STYLE }}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Row 2: Zonas, Filter button, and toggles */}
        <Box sx={{ ...STYLES.filtersRow, mb: 1, alignItems: 'center' }}>
          <Box sx={{ width: 220 }}>
            <Typography variant="caption" sx={STYLES.filterLabel}>
              {t('common.zones')}
            </Typography>
            <MultiSelectSearch
              label=""
              selectAllLabel={t('common.all')}
              options={zonasList.map((z) => ({ id: z.id, label: z.name }))}
              selectedIds={zonas}
              onChange={handleZonasChange}
              minWidth={220}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', pt: 2.5 }}>
            <Button
              variant="contained"
              onClick={handleFilterClick}
              disabled={isLoading || isInitialLoad}
              sx={{ ...STYLES.filterButton, py: 0.6, fontSize: '0.8rem' }}
            >
              {isLoading ? t('common.loading') : t('common.filter')}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: '42px', pt: 2.5 }}>
            <FormControlLabel
              control={<IOSSwitch checked={pendientesPago} onChange={handlePendientesPagoChange} />}
              label={<Typography variant="body2" sx={{ ml: 1 }}>{t('tickets.monitoring.pendingPayment')}</Typography>}
              sx={{ mr: 1 }}
            />
            <FormControlLabel
              control={<IOSSwitch checked={soloGanadores} onChange={handleSoloGanadoresChange} />}
              label={<Typography variant="body2" sx={{ ml: 1 }}>{t('ticketStatus.winner')}</Typography>}
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
              placeholder={t('common.filterQuick')}
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
                      {TABLE_COLUMNS.map((col, idx) => {
                        const label = col.key ? t(col.key) : '';
                        const isActions = col.key === 'common.actions';
                        return (
                          <TableCell
                            key={col.key || `col-${idx}`}
                            align={isActions ? 'center' : 'left'}
                            sx={{
                              ...STYLES.tableHeaderCell,
                              width: COLUMN_WIDTHS[col.key] || 'auto',
                            }}
                          >
                            {col.sortKey ? (
                              <TableSortLabel {...getSortProps(col.sortKey as string)}>
                                {label}
                              </TableSortLabel>
                            ) : (
                              label
                            )}
                          </TableCell>
                        );
                      })}
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
