import { memo, type FC, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '@/utils/formatCurrency';
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
  { value: 'todos', label: 'Todos' },
  { value: 'con_ventas', label: 'Con ventas' },
  { value: 'con_premios', label: 'Con premios' },
  { value: 'con_tickets_pendientes', label: 'Con tickets pendientes' },
  { value: 'ventas_negativas', label: 'Con ventas netas negativas' },
  { value: 'ventas_positivas', label: 'Con ventas netas positivas' },
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
  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!filtroRapido) return bancasData;
    const term = filtroRapido.toLowerCase();
    return bancasData.filter(
      (d) => d.ref?.toLowerCase().includes(term) || d.codigo?.toLowerCase().includes(term)
    );
  }, [bancasData, filtroRapido]);

  // Table columns
  const columns: Column<BancaData>[] = useMemo(
    () => [
      { id: 'ref', label: 'Ref.' },
      { id: 'codigo', label: 'Código' },
      { id: 'tickets', label: 'Tickets', align: 'right' },
      { id: 'venta', label: 'Venta', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: 'Comisiones', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'descuentos', label: 'Descuentos', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: 'Premios', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'neto', label: 'Neto', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'caida', label: 'Caída', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'gastos', label: 'Gastos', align: 'right', format: (v) => formatCurrency(v as number) },
      {
        id: 'final',
        label: 'Final',
        align: 'right',
        format: (v) => formatCurrency(v as number),
      },
    ],
    []
  );

  return (
    <>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
        Total:{' '}
        <Box
          component="span"
          sx={{
            backgroundColor: '#e0f7fa',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: '#00838f',
          }}
        >
          {formatCurrency(totals.final)}
        </Box>
      </Typography>

      {/* Filter toggle */}
      <Box sx={{ mb: 2 }}>
        <FilterToggleGroup
          options={FILTER_OPTIONS}
          value={filterType}
          onChange={setFilterType}
          label="Filtrar"
        />
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <SearchInput value={filtroRapido} onChange={setFiltroRapido} placeholder="Filtro rapido" />
      </Box>

      {/* Data table */}
      <DataTable<BancaData>
        columns={columns}
        data={filteredData}
        totals={{
          ref: 'Totales',
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
        emptyMessage="No hay datos de bancas disponibles"
      />

      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
        Mostrando {filteredData.length} entradas
      </Typography>
    </>
  );
});

BancasTab.displayName = 'BancasTab';

export default BancasTab;
