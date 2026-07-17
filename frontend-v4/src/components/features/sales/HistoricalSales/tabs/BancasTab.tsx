import { memo, type FC, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '@/utils/formatCurrency';

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
  FilterToggleGroup,
  SearchInput,
  DataTable,
  type Column,
  type FilterOption,
} from '@/components/common';

// Types
interface BancaData {
  ref: string;
  codigo: string;
  tickets: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  caida: number;
  gastos: number;
  final: number;
}

interface Totals {
  tickets: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  caida: number;
  gastos: number;
  final: number;
}

interface BancasTabProps {
  bancasData: BancaData[];
  totals: Totals;
  filterType: string;
  filtroRapido: string;
  setFilterType: (type: string) => void;
  setFiltroRapido: (value: string) => void;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'todos', label: 'common.all' },
  { value: 'con_ventas', label: 'sales.filters.withSales' },
  { value: 'con_premios', label: 'sales.filters.withPrizes' },
  { value: 'con_tickets_pendientes', label: 'sales.filters.pendingTickets' },
  { value: 'ventas_negativas', label: 'sales.filters.negativeNet' },
  { value: 'ventas_positivas', label: 'sales.filters.positiveNet' },
];

/**
 * Bancas tab for HistoricalSales (General tab content)
 */
export const BancasTab: FC<BancasTabProps> = memo(({
  bancasData,
  totals,
  filterType,
  filtroRapido,
  setFilterType,
  setFiltroRapido,
}) => {
  const { t } = useTranslation();
  // Filter data based on type filter and search
  const filteredData = useMemo(() => {
    let result = bancasData;

    // Apply type filter
    switch (filterType) {
      case 'con_ventas':
        result = result.filter(d => d.venta > 0);
        break;
      case 'con_premios':
        result = result.filter(d => d.premios > 0);
        break;
      case 'con_tickets_pendientes':
        result = result.filter(d => d.tickets > 0);
        break;
      case 'ventas_negativas':
        result = result.filter(d => d.neto < 0);
        break;
      case 'ventas_positivas':
        result = result.filter(d => d.neto > 0);
        break;
    }

    // Apply text search
    if (filtroRapido) {
      const term = filtroRapido.toLowerCase();
      result = result.filter(
        (d) => d.ref?.toLowerCase().includes(term) || d.codigo?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [bancasData, filterType, filtroRapido]);

  // Table columns
  const columns: Column<BancaData>[] = useMemo(
    () => [
      { id: 'ref', label: t('sales.ref') },
      { id: 'codigo', label: t('common.code') },
      { id: 'tickets', label: t('common.tickets'), align: 'right' },
      { id: 'venta', label: t('sales.venta'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: t('sales.comisiones'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'descuentos', label: t('sales.descuentos'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: t('sales.premios'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'neto', label: t('sales.neto'), align: 'right', format: coloredCurrency },
      { id: 'caida', label: t('sales.caida'), align: 'right', format: greenIfPositive },
      { id: 'gastos', label: t('sales.gastos'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'final', label: t('sales.final'), align: 'right', format: coloredCurrency },
    ],
    [t]
  );

  return (
    <>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
        {t('common.total')}:{' '}
        <Box
          component="span"
          sx={{
            // Same signal convention as DailySales' headline: green when
            // positive, red when negative, blue at exactly zero.
            backgroundColor: totals.final > 0 ? '#e8f5e9' : totals.final < 0 ? '#ffebee' : '#e3f2fd',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: totals.final > 0 ? '#2e7d32' : totals.final < 0 ? '#c62828' : '#1565c0',
          }}
        >
          {formatCurrency(totals.final)}
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
      <Box sx={{ mb: 2 }}>
        <SearchInput value={filtroRapido} onChange={setFiltroRapido} placeholder={t('common.filterQuick')} />
      </Box>

      {/* Data table */}
      <DataTable<BancaData>
        columns={columns}
        data={filteredData}
        totals={{
          ref: t('balances.totals'),
          codigo: '-',
          tickets: totals.tickets,
          venta: totals.venta,
          comisiones: totals.comisiones,
          descuentos: totals.descuentos,
          premios: totals.premios,
          neto: totals.neto,
          caida: totals.caida,
          gastos: totals.gastos,
          final: totals.final,
        }}
        totalsLabel=""
        emptyMessage={t('sales.noBancasData')}
      />

      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
        {t('sales.showingEntries', { count: filteredData.length })}
      </Typography>
    </>
  );
});

BancasTab.displayName = 'BancasTab';

export default BancasTab;
