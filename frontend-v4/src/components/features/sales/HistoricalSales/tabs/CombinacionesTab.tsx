import { memo, type FC, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress, FormControl, Select, MenuItem } from '@mui/material';
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
interface CombinacionData {
  combinacion: string;
  totalVendido: number;
  comisiones: number;
  comisiones2: number;
  premios: number;
  balances: number;
}

interface CombinacionesTabProps {
  fechaInicial: string;
  fechaFinal: string;
  zonas: Zone[];
  zonasList: Zone[];
  combinacionesData: CombinacionData[];
  filtroRapido: string;
  loading: boolean;
  setFechaInicial: (date: string) => void;
  setFechaFinal: (date: string) => void;
  setZonas: (zones: Zone[]) => void;
  setFiltroRapido: (value: string) => void;
  onSearch: () => void;
}

/**
 * Combinaciones tab for HistoricalSales
 */
export const CombinacionesTab: FC<CombinacionesTabProps> = memo(({
  fechaInicial,
  fechaFinal,
  zonas,
  zonasList,
  combinacionesData,
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
    return combinacionesData.reduce(
      (acc, d) => ({
        totalVendido: acc.totalVendido + d.totalVendido,
        comisiones: acc.comisiones + d.comisiones,
        comisiones2: acc.comisiones2 + d.comisiones2,
        premios: acc.premios + d.premios,
        balances: acc.balances + d.balances,
      }),
      { totalVendido: 0, comisiones: 0, comisiones2: 0, premios: 0, balances: 0 }
    );
  }, [combinacionesData]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!filtroRapido) return combinacionesData;
    const term = filtroRapido.toLowerCase();
    return combinacionesData.filter((d) => d.combinacion?.toLowerCase().includes(term));
  }, [combinacionesData, filtroRapido]);

  // Table columns
  const columns: Column<CombinacionData>[] = useMemo(
    () => [
      { id: 'combinacion', label: 'Combinación' },
      { id: 'totalVendido', label: 'Total Vendido', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: 'Total comisiones', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones2', label: 'Total comisiones 2', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: 'Total premios', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'balances', label: 'Balances', align: 'right', format: (v) => formatCurrency(v as number) },
    ],
    []
  );

  return (
    <>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.75rem' }}>
        Combinaciones
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <DateRangePicker
          startDate={fechaInicial}
          endDate={fechaFinal}
          onStartDateChange={setFechaInicial}
          onEndDateChange={setFechaFinal}
        />

        {/* Sorteos dropdown placeholder */}
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
            Sorteos
          </Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              multiple
              value={[]}
              renderValue={(selected) => selected.length === 0 ? 'Seleccione' : `${selected.length} seleccionadas`}
              displayEmpty
            >
              <MenuItem value={1}>Sorteo 1</MenuItem>
              <MenuItem value={2}>Sorteo 2</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <ZoneMultiSelect
          zones={zonasList}
          selectedZoneIds={zonas.map((z) => z.id)}
          onChange={(ids) => setZonas(zonasList.filter((z) => ids.includes(z.id)))}
        />

        {/* Bancas dropdown placeholder */}
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
            Bancas
          </Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select value="" displayEmpty>
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value={1}>Banca 1</MenuItem>
              <MenuItem value={2}>Banca 2</MenuItem>
            </Select>
          </FormControl>
        </Box>
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

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <SearchInput value={filtroRapido} onChange={setFiltroRapido} placeholder="Filtrado rápido" />
      </Box>

      {/* Data table */}
      <DataTable<CombinacionData>
        columns={columns}
        data={filteredData}
        totals={totals}
        emptyMessage="No hay entradas disponibles"
      />

      <Typography variant="body2" sx={{ mt: 2 }}>
        Mostrando {filteredData.length} de {combinacionesData.length} entradas
      </Typography>
    </>
  );
});

CombinacionesTab.displayName = 'CombinacionesTab';

export default CombinacionesTab;
