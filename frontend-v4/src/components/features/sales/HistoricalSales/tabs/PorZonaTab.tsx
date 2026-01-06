import { memo, type FC, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { formatCurrency } from '@/utils/formatCurrency';
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
  { value: 'todos', label: 'Todos' },
  { value: 'con-ventas', label: 'Con ventas' },
  { value: 'con-premios', label: 'Con premios' },
  { value: 'tickets-pendientes', label: 'Con tickets pendientes' },
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

  // Table columns
  const columns: Column<ZonaData>[] = useMemo(
    () => [
      { id: 'nombre', label: 'Nombre' },
      { id: 'p', label: 'P', align: 'center' },
      { id: 'l', label: 'L', align: 'center' },
      { id: 'w', label: 'W', align: 'center' },
      { id: 'total', label: 'Total', align: 'right' },
      { id: 'venta', label: 'Venta', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: 'Comisiones', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'descuentos', label: 'Descuentos', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: 'Premios', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'neto', label: 'Neto', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'caida', label: 'Caída', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'final', label: 'Final', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'balance', label: 'Balance', align: 'right', format: (v) => formatCurrency(v as number) },
    ],
    []
  );

  return (
    <>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
        Zonas
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
          {loading ? <CircularProgress size={16} color="inherit" /> : 'Ver ventas'}
        </Button>
        <Button
          variant="contained"
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
          {formatCurrency(totals.neto)}
        </Box>
      </Typography>

      {/* Filter toggle */}
      <Box sx={{ mb: 2 }}>
        <FilterToggleGroup
          options={FILTER_OPTIONS}
          value={filterType}
          onChange={setFilterType}
          label="Filtros"
        />
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <SearchInput value={filtroRapido} onChange={setFiltroRapido} placeholder="Filtrado rápido" />
      </Box>

      {/* Data table */}
      <DataTable<ZonaData>
        columns={columns}
        data={filteredData}
        totals={totals}
        emptyMessage="No hay datos de zonas disponibles"
      />

      <Typography variant="body2" sx={{ mt: 2 }}>
        Mostrando {filteredData.length} de {zonasData.length} entradas
      </Typography>
    </>
  );
});

PorZonaTab.displayName = 'PorZonaTab';

export default PorZonaTab;
