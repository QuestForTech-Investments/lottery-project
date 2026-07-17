import { memo, type FC, useMemo, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { formatCurrency } from '@/utils/formatCurrency';
import { exportToCsv, exportToPdf, type ExportColumn } from '@/utils/exportTable';

const coloredCurrency = (v: unknown): ReactNode => {
  const n = v as number;
  const color = n > 0 ? '#2e7d32' : n < 0 ? '#c62828' : '#1565c0';
  return <span style={{ color, fontWeight: 600 }}>{formatCurrency(n)}</span>;
};

const greenIfPositive = (v: unknown): ReactNode => {
  const n = v as number;
  return <span style={{ color: n > 0 ? '#2e7d32' : 'inherit' }}>{formatCurrency(n)}</span>;
};
import {
  DateRangePicker,
  ZoneMultiSelect,
  SearchInput,
  FilterToggleGroup,
  DataTable,
  type Column,
  type Zone,
  type FilterOption,
} from '@/components/common';

// Types
interface ZonaData {
  nombre: string;
  p: number;
  l: number;
  w: number;
  total: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  caida: number;
  final: number;
  balance: number;
}

interface PorZonaTabProps {
  fechaInicial: string;
  fechaFinal: string;
  zonas: Zone[];
  zonasList: Zone[];
  zonasData: ZonaData[];
  filterType: string;
  filtroRapido: string;
  loading: boolean;
  setFechaInicial: (date: string) => void;
  setFechaFinal: (date: string) => void;
  setZonas: (zones: Zone[]) => void;
  setFilterType: (type: string) => void;
  setFiltroRapido: (value: string) => void;
  onSearch: () => void;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'todos', label: 'common.all' },
  { value: 'con-ventas', label: 'sales.filters.withSales' },
  { value: 'con-premios', label: 'sales.filters.withPrizes' },
  { value: 'tickets-pendientes', label: 'sales.filters.pendingTickets' },
];

/**
 * Por Zona tab for HistoricalSales
 * Demonstrates usage of reusable components
 */
export const PorZonaTab: FC<PorZonaTabProps> = memo(({
  fechaInicial,
  fechaFinal,
  zonas,
  zonasList,
  zonasData,
  filterType,
  filtroRapido,
  loading,
  setFechaInicial,
  setFechaFinal,
  setZonas,
  setFilterType,
  setFiltroRapido,
  onSearch,
}) => {
  const { t } = useTranslation();
  // Calculate totals
  const totals = useMemo(() => {
    return zonasData.reduce(
      (acc, d) => ({
        p: acc.p + (d.p || 0),
        l: acc.l + (d.l || 0),
        w: acc.w + (d.w || 0),
        total: acc.total + (d.total || 0),
        venta: acc.venta + d.venta,
        comisiones: acc.comisiones + d.comisiones,
        descuentos: acc.descuentos + d.descuentos,
        premios: acc.premios + d.premios,
        neto: acc.neto + d.neto,
        caida: acc.caida + (d.caida || 0),
        final: acc.final + (d.final || 0),
        balance: acc.balance + (d.balance || 0),
      }),
      { p: 0, l: 0, w: 0, total: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, final: 0, balance: 0 }
    );
  }, [zonasData]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!filtroRapido) return zonasData;
    const term = filtroRapido.toLowerCase();
    return zonasData.filter((d) => d.nombre?.toLowerCase().includes(term));
  }, [zonasData, filtroRapido]);

  // Export columns (mirror the visible table; money columns get pre-formatted).
  const exportColumns = useMemo<ExportColumn<Record<string, unknown>>[]>(() => {
    const moneyKeys = new Set(['venta', 'comisiones', 'descuentos', 'premios', 'neto', 'caida', 'final', 'balance']);
    return [
      { key: 'nombre', label: t('common.name'), align: 'left' as const },
      { key: 'p', label: t('sales.pendingShort'), align: 'center' as const },
      { key: 'l', label: t('sales.loserShort'), align: 'center' as const },
      { key: 'w', label: t('sales.winnerShort'), align: 'center' as const },
      { key: 'total', label: t('common.total'), align: 'right' as const },
      { key: 'venta', label: t('sales.venta'), align: 'right' as const },
      { key: 'comisiones', label: t('sales.comisiones'), align: 'right' as const },
      { key: 'descuentos', label: t('sales.descuentos'), align: 'right' as const },
      { key: 'premios', label: t('sales.premios'), align: 'right' as const },
      { key: 'neto', label: t('sales.neto'), align: 'right' as const },
      { key: 'caida', label: t('sales.caida'), align: 'right' as const },
      { key: 'final', label: t('sales.final'), align: 'right' as const },
      { key: 'balance', label: t('common.balance'), align: 'right' as const },
    ].map(c => ({
      ...c,
      getValue: moneyKeys.has(c.key)
        ? (row: Record<string, unknown>) => formatCurrency(Number(row[c.key] ?? 0))
        : undefined,
    }));
  }, [t]);

  const totalsAsRow = useMemo<Record<string, unknown>>(
    () => ({ nombre: t('balances.totals'), ...totals }),
    [totals, t],
  );

  const handleExportCsv = useCallback(() => {
    if (filteredData.length === 0) {
      alert(t('sales.noDataToExport'));
      return;
    }
    exportToCsv(
      filteredData as unknown as Record<string, unknown>[],
      exportColumns,
      `ventas-por-zona-${fechaInicial}_${fechaFinal}`,
      totalsAsRow,
    );
  }, [filteredData, exportColumns, fechaInicial, fechaFinal, totalsAsRow, t]);

  const handleExportPdf = useCallback(() => {
    if (filteredData.length === 0) {
      alert(t('sales.noDataToExport'));
      return;
    }
    exportToPdf(
      filteredData as unknown as Record<string, unknown>[],
      exportColumns,
      t('sales.zoneExportTitle', { start: fechaInicial, end: fechaFinal }),
      totalsAsRow,
    );
  }, [filteredData, exportColumns, fechaInicial, fechaFinal, totalsAsRow, t]);

  // Table columns
  const columns: Column<ZonaData>[] = useMemo(
    () => [
      { id: 'nombre', label: t('common.name') },
      { id: 'p', label: t('sales.pendingShort'), align: 'center' },
      { id: 'l', label: t('sales.loserShort'), align: 'center' },
      { id: 'w', label: t('sales.winnerShort'), align: 'center' },
      { id: 'total', label: t('common.total'), align: 'right' },
      { id: 'venta', label: t('sales.venta'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: t('sales.comisiones'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'descuentos', label: t('sales.descuentos'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: t('sales.premios'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'neto', label: t('sales.neto'), align: 'right', format: coloredCurrency },
      { id: 'caida', label: t('sales.caida'), align: 'right', format: greenIfPositive },
      { id: 'final', label: t('sales.final'), align: 'right', format: coloredCurrency },
      { id: 'balance', label: t('common.balance'), align: 'right', format: coloredCurrency },
    ],
    [t]
  );

  return (
    <>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
        {t('common.zones')}
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <DateRangePicker
          startDate={fechaInicial}
          endDate={fechaFinal}
          onStartDateChange={setFechaInicial}
          onEndDateChange={setFechaFinal}
        />

        <ZoneMultiSelect
          zones={zonasList}
          selectedZoneIds={zonas.map((z) => z.id)}
          onChange={(ids) => setZonas(zonasList.filter((z) => ids.includes(z.id)))}
        />
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Button
          variant="contained"
          onClick={onSearch}
          disabled={loading}
          size="small"
          sx={{
            borderRadius: '20px',
            px: 2.5,
            py: 0.5,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : t('transactions.viewSales')}
        </Button>
        <Button
          variant="contained"
          onClick={handleExportCsv}
          size="small"
          sx={{
            borderRadius: '20px',
            px: 2.5,
            py: 0.5,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          CSV
        </Button>
        <Button
          variant="contained"
          onClick={handleExportPdf}
          size="small"
          sx={{
            borderRadius: '20px',
            px: 2.5,
            py: 0.5,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          PDF
        </Button>
      </Box>

      {/* Total display */}
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
        {t('common.total')}:{' '}
        <Box
          component="span"
          sx={{
            // Same signal convention as DailySales' headline: green when
            // positive, red when negative, blue at exactly zero.
            backgroundColor: totals.neto > 0 ? '#e8f5e9' : totals.neto < 0 ? '#ffebee' : '#e3f2fd',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: totals.neto > 0 ? '#2e7d32' : totals.neto < 0 ? '#c62828' : '#1565c0',
          }}
        >
          {formatCurrency(totals.neto)}
        </Box>
      </Typography>

      {/* Filter toggle */}
      <Box sx={{ mb: 2 }}>
        <FilterToggleGroup
          options={FILTER_OPTIONS.map(o => ({ ...o, label: t(o.label) }))}
          value={filterType}
          onChange={setFilterType}
          label={t('common.filter')}
        />
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <SearchInput value={filtroRapido} onChange={setFiltroRapido} placeholder={t('common.filterQuick')} />
      </Box>

      {/* Data table */}
      <DataTable<ZonaData>
        columns={columns}
        data={filteredData}
        totals={totals}
        emptyMessage={t('sales.noZonesData')}
      />

      <Typography variant="body2" sx={{ mt: 2 }}>
        {t('common.showingEntries', { shown: filteredData.length, total: zonasData.length })}
      </Typography>
    </>
  );
});

PorZonaTab.displayName = 'PorZonaTab';

export default PorZonaTab;
