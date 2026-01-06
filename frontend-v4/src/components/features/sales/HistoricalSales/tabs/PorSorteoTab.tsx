import { memo, type FC, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  DateRangePicker,
  ZoneMultiSelect,
  SearchInput,
  DataTable,
  type Column,
  type Zone,
} from '@/components/common';

// Types
interface SorteoData {
  sorteo: string;
  venta: number;
  premios: number;
  comisiones: number;
  neto: number;
}

interface PorSorteoTabProps {
  fechaInicial: string;
  fechaFinal: string;
  zonas: Zone[];
  zonasList: Zone[];
  sorteoData: SorteoData[];
  filtroRapido: string;
  loading: boolean;
  setFechaInicial: (date: string) => void;
  setFechaFinal: (date: string) => void;
  setZonas: (zones: Zone[]) => void;
  setFiltroRapido: (value: string) => void;
  onSearch: () => void;
}

/**
 * Por Sorteo tab for HistoricalSales
 */
export const PorSorteoTab: FC<PorSorteoTabProps> = memo(({
  fechaInicial,
  fechaFinal,
  zonas,
  zonasList,
  sorteoData,
  filtroRapido,
  loading,
  setFechaInicial,
  setFechaFinal,
  setZonas,
  setFiltroRapido,
  onSearch,
}) => {
  // Calculate totals
  const totals = useMemo(() => {
    return sorteoData.reduce(
      (acc, d) => ({
        venta: acc.venta + d.venta,
        premios: acc.premios + d.premios,
        comisiones: acc.comisiones + d.comisiones,
        neto: acc.neto + d.neto,
      }),
      { venta: 0, premios: 0, comisiones: 0, neto: 0 }
    );
  }, [sorteoData]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!filtroRapido) return sorteoData;
    const term = filtroRapido.toLowerCase();
    return sorteoData.filter((d) => d.sorteo?.toLowerCase().includes(term));
  }, [sorteoData, filtroRapido]);

  // Table columns
  const columns: Column<SorteoData>[] = useMemo(
    () => [
      { id: 'sorteo', label: 'Sorteo' },
      { id: 'venta', label: 'Total Vendido', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: 'Total premios', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: 'Total comisiones', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'neto', label: 'Total neto', align: 'right', format: (v) => formatCurrency(v as number) },
    ],
    []
  );

  return (
    <>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.75rem' }}>
        Ventas por sorteo
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

      {/* Action button */}
      <Box sx={{ mb: 3 }}>
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
      </Box>

      {/* Total display */}
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
        Total neto:{' '}
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

      {sorteoData.length === 0 && (
        <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.25rem' }}>
          No hay entradas para la fecha elegida
        </Typography>
      )}

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <SearchInput value={filtroRapido} onChange={setFiltroRapido} placeholder="Filtrado rápido" />
      </Box>

      {/* Data table */}
      <DataTable<SorteoData>
        columns={columns}
        data={filteredData}
        totals={totals}
        emptyMessage="No hay entradas disponibles"
      />

      <Typography variant="body2" sx={{ mt: 2 }}>
        Mostrando {filteredData.length} de {sorteoData.length} entradas
      </Typography>
    </>
  );
});

PorSorteoTab.displayName = 'PorSorteoTab';

export default PorSorteoTab;
