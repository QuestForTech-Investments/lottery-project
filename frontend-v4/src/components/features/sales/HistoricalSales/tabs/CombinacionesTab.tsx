import { memo, type FC, useMemo, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  DateRangePicker,
  ZoneMultiSelect,
  SearchInput,
  DataTable,
  type Column,
  type Zone,
} from '@/components/common';

const SELECT_ALL = -1;

const applySelectAllToggle = (
  raw: number[] | string,
  current: number[],
  all: number[],
): number[] => {
  const arr = typeof raw === 'string' ? [] : raw;
  if (arr.includes(SELECT_ALL)) {
    return current.length === all.length ? [] : all.slice();
  }
  return arr;
};

const coloredCurrency = (v: unknown): ReactNode => {
  const n = v as number;
  const color = n > 0 ? '#2e7d32' : n < 0 ? '#c62828' : '#1565c0';
  return <span style={{ color, fontWeight: 600 }}>{formatCurrency(n)}</span>;
};

const prettyBetTypeName = (raw: string | null | undefined): string => {
  if (!raw) return '';
  return raw
    .replace(/^Cash3\b/i, 'Pick3')
    .replace(/^Play4\b/i, 'Pick4')
    .replace(/^Directo\b/i, 'Quiniela');
};

interface CombinacionData {
  combinacion: string;
  tipoApuesta: string;
  lineas: number;
  totalVendido: number;
  comisiones: number;
  comisiones2: number;
  premios: number;
  balances: number;
}

interface AggRow {
  tipoApuesta: string;
  lineas: number;
  totalVendido: number;
  comisiones: number;
  comisiones2: number;
  premios: number;
  balances: number;
}

interface DrawOption {
  drawId: number;
  drawName: string;
}

interface BancaOption {
  id: number;
  name: string;
  code: string;
}

interface CombinacionesTabProps {
  fechaInicial: string;
  fechaFinal: string;
  zonas: Zone[];
  zonasList: Zone[];
  drawsList: DrawOption[];
  bancasList: BancaOption[];
  selectedDraws: number[];
  selectedBancas: number[];
  setSelectedDraws: (ids: number[]) => void;
  setSelectedBancas: (ids: number[]) => void;
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
  drawsList,
  bancasList,
  selectedDraws,
  selectedBancas,
  setSelectedDraws,
  setSelectedBancas,
  combinacionesData,
  filtroRapido,
  loading,
  setFechaInicial,
  setFechaFinal,
  setZonas,
  setFiltroRapido,
  onSearch,
}) => {
  // Filter rows by search term against pretty bet type name.
  const filteredData = useMemo(() => {
    if (!filtroRapido) return combinacionesData;
    const term = filtroRapido.toLowerCase();
    return combinacionesData.filter((d) =>
      prettyBetTypeName(d.tipoApuesta).toLowerCase().includes(term),
    );
  }, [combinacionesData, filtroRapido]);

  // Aggregate rows by bet type name and sum metrics.
  const groupedData = useMemo<AggRow[]>(() => {
    const map = new Map<string, AggRow>();
    for (const row of filteredData) {
      const key = row.tipoApuesta || '';
      const existing = map.get(key);
      if (existing) {
        existing.lineas += row.lineas;
        existing.totalVendido += row.totalVendido;
        existing.comisiones += row.comisiones;
        existing.comisiones2 += row.comisiones2;
        existing.premios += row.premios;
        existing.balances += row.balances;
      } else {
        map.set(key, {
          tipoApuesta: row.tipoApuesta,
          lineas: row.lineas,
          totalVendido: row.totalVendido,
          comisiones: row.comisiones,
          comisiones2: row.comisiones2,
          premios: row.premios,
          balances: row.balances,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      prettyBetTypeName(a.tipoApuesta).localeCompare(prettyBetTypeName(b.tipoApuesta)),
    );
  }, [filteredData]);

  // Totals across aggregated rows.
  const totals = useMemo(() => {
    return groupedData.reduce(
      (acc, d) => ({
        totalVendido: acc.totalVendido + d.totalVendido,
        comisiones: acc.comisiones + d.comisiones,
        comisiones2: acc.comisiones2 + d.comisiones2,
        premios: acc.premios + d.premios,
        balances: acc.balances + d.balances,
      }),
      { totalVendido: 0, comisiones: 0, comisiones2: 0, premios: 0, balances: 0 },
    );
  }, [groupedData]);

  const columns: Column<AggRow>[] = useMemo(
    () => [
      {
        id: 'tipoApuesta',
        label: 'Tipo de jugada',
        format: (_v, row) => `${prettyBetTypeName(row.tipoApuesta)} (${row.lineas})`,
      },
      { id: 'totalVendido', label: 'Total Vendido', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: 'Total comisiones', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones2', label: 'Total comisiones 2', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: 'Total premios', align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'balances', label: 'Balances', align: 'right', format: coloredCurrency },
    ],
    [],
  );

  const handleDrawChange = (event: SelectChangeEvent<number[]>) => {
    setSelectedDraws(applySelectAllToggle(
      event.target.value as number[] | string,
      selectedDraws,
      drawsList.map(d => d.drawId),
    ));
  };

  const handleBancaChange = (event: SelectChangeEvent<number[]>) => {
    setSelectedBancas(applySelectAllToggle(
      event.target.value as number[] | string,
      selectedBancas,
      bancasList.map(b => b.id),
    ));
  };

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

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
            Sorteos
          </Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              multiple
              value={selectedDraws}
              onChange={handleDrawChange}
              input={<OutlinedInput />}
              MenuProps={{
                disableAutoFocusItem: true,
                PaperProps: { sx: { maxHeight: 360 } },
              }}
              renderValue={(selected) =>
                selected.length === 0
                  ? 'Seleccione'
                  : selected.length === drawsList.length && drawsList.length > 0
                    ? 'Todos'
                    : `${selected.length} seleccionados`
              }
              displayEmpty
            >
              <MenuItem value={SELECT_ALL}>
                <Checkbox
                  checked={drawsList.length > 0 && selectedDraws.length === drawsList.length}
                  indeterminate={selectedDraws.length > 0 && selectedDraws.length < drawsList.length}
                />
                <ListItemText primary="Todos" />
              </MenuItem>
              {drawsList.map((draw) => (
                <MenuItem key={draw.drawId} value={draw.drawId}>
                  <Checkbox checked={selectedDraws.indexOf(draw.drawId) > -1} />
                  <ListItemText primary={draw.drawName || `Draw ${draw.drawId}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <ZoneMultiSelect
          zones={zonasList}
          selectedZoneIds={zonas.map((z) => z.id)}
          onChange={(ids) => setZonas(zonasList.filter((z) => ids.includes(z.id)))}
        />

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
            Bancas
          </Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              multiple
              value={selectedBancas}
              onChange={handleBancaChange}
              input={<OutlinedInput />}
              MenuProps={{
                disableAutoFocusItem: true,
                PaperProps: { sx: { maxHeight: 360 } },
              }}
              renderValue={(selected) => {
                if (selected.length === 0) return 'Todas';
                if (selected.length === bancasList.length && bancasList.length > 0) return 'Todas';
                if (selected.length === 1) {
                  const banca = bancasList.find(b => b.id === selected[0]);
                  return banca?.name || '1 seleccionada';
                }
                return `${selected.length} seleccionadas`;
              }}
              displayEmpty
            >
              <MenuItem value={SELECT_ALL}>
                <Checkbox
                  checked={bancasList.length > 0 && selectedBancas.length === bancasList.length}
                  indeterminate={selectedBancas.length > 0 && selectedBancas.length < bancasList.length}
                />
                <ListItemText primary="Todas" />
              </MenuItem>
              {bancasList.map((banca) => (
                <MenuItem key={banca.id} value={banca.id}>
                  <Checkbox checked={selectedBancas.indexOf(banca.id) > -1} />
                  <ListItemText primary={`${banca.code} - ${banca.name}`} />
                </MenuItem>
              ))}
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
      <DataTable<AggRow>
        columns={columns}
        data={groupedData}
        totals={totals}
        emptyMessage="No hay entradas disponibles"
      />

      <Typography variant="body2" sx={{ mt: 2 }}>
        Mostrando {groupedData.length} tipo(s) de jugada
      </Typography>
    </>
  );
});

CombinacionesTab.displayName = 'CombinacionesTab';

export default CombinacionesTab;
