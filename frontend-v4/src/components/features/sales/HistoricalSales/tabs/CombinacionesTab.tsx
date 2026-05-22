import { memo, type FC, useMemo, type ReactNode, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
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

// Generic typeahead option shape used by the multi-selects below.
interface OptionItem {
  id: number;
  label: string;
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
  const { t } = useTranslation();
  // Filter rows by search term against pretty bet type name.
  const filteredData = useMemo(() => {
    if (!filtroRapido) return combinacionesData;
    const term = filtroRapido.toLowerCase();
    return combinacionesData.filter((d) =>
      prettyBetTypeName(d.tipoApuesta).toLowerCase().includes(term),
    );
  }, [combinacionesData, filtroRapido]);

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
        label: t('sales.playType'),
        format: (_v, row) => `${prettyBetTypeName(row.tipoApuesta)} (${row.lineas})`,
      },
      { id: 'totalVendido', label: t('sales.totalSold'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones', label: t('sales.totalCommissions'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'comisiones2', label: t('sales.totalCommissions2'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'premios', label: t('sales.totalPrizes'), align: 'right', format: (v) => formatCurrency(v as number) },
      { id: 'balances', label: t('sales.balances'), align: 'right', format: coloredCurrency },
    ],
    [t],
  );

  // Build typeahead option lists with a synthetic "Todos/Todas" entry on top.
  const drawOptions: OptionItem[] = useMemo(
    () => [{ id: SELECT_ALL, label: t('common.all') }, ...drawsList.map((d) => ({ id: d.drawId, label: d.drawName || `Draw ${d.drawId}` }))],
    [drawsList, t],
  );
  const bancaOptions: OptionItem[] = useMemo(
    () => [{ id: SELECT_ALL, label: t('common.all') }, ...bancasList.map((b) => ({ id: b.id, label: `${b.code} - ${b.name}` }))],
    [bancasList, t],
  );

  const drawValues: OptionItem[] = useMemo(
    () => drawOptions.filter((o) => o.id !== SELECT_ALL && selectedDraws.includes(o.id)),
    [drawOptions, selectedDraws],
  );
  const bancaValues: OptionItem[] = useMemo(
    () => bancaOptions.filter((o) => o.id !== SELECT_ALL && selectedBancas.includes(o.id)),
    [bancaOptions, selectedBancas],
  );

  const handleDrawChange = (_e: SyntheticEvent, value: OptionItem[]) => {
    if (value.some((v) => v.id === SELECT_ALL)) {
      setSelectedDraws(selectedDraws.length === drawsList.length ? [] : drawsList.map((d) => d.drawId));
      return;
    }
    setSelectedDraws(value.map((v) => v.id));
  };

  const handleBancaChange = (_e: SyntheticEvent, value: OptionItem[]) => {
    if (value.some((v) => v.id === SELECT_ALL)) {
      setSelectedBancas(selectedBancas.length === bancasList.length ? [] : bancasList.map((b) => b.id));
      return;
    }
    setSelectedBancas(value.map((v) => v.id));
  };

  const drawSummary =
    drawValues.length === 0
      ? ''
      : drawValues.length === drawsList.length && drawsList.length > 0
        ? t('common.all')
        : drawValues.length === 1
          ? drawValues[0].label
          : t('balances.selectedCount', { count: drawValues.length });

  const bancaSummary =
    bancaValues.length === 0
      ? ''
      : bancaValues.length === bancasList.length && bancasList.length > 0
        ? t('common.all')
        : bancaValues.length === 1
          ? bancaValues[0].label
          : t('balances.selectedCount', { count: bancaValues.length });

  return (
    <>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.75rem' }}>
        {t('sales.tabs.combinaciones')}
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
            {t('common.draws')}
          </Typography>
          <Autocomplete
            multiple
            disableCloseOnSelect
            size="small"
            sx={{ minWidth: 220 }}
            options={drawOptions}
            value={drawValues}
            onChange={handleDrawChange}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderTags={() => null}
            ListboxProps={{ style: { maxHeight: 360 } }}
            renderOption={(props, option, { selected }) => {
              if (option.id === SELECT_ALL) {
                const allSelected = drawsList.length > 0 && selectedDraws.length === drawsList.length;
                const indeterminate = selectedDraws.length > 0 && selectedDraws.length < drawsList.length;
                return (
                  <li {...props} key="__all_draws__">
                    <Checkbox
                      size="small"
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      checked={allSelected}
                      indeterminate={indeterminate}
                      sx={{ mr: 1 }}
                    />
                    {option.label}
                  </li>
                );
              }
              return (
                <li {...props} key={option.id}>
                  <Checkbox
                    size="small"
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    checked={selected}
                    sx={{ mr: 1 }}
                  />
                  {option.label}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={drawValues.length === 0 ? t('common.select') : ''}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: drawSummary ? (
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      {drawSummary}
                    </InputAdornment>
                  ) : null,
                }}
              />
            )}
          />
        </Box>

        <ZoneMultiSelect
          zones={zonasList}
          selectedZoneIds={zonas.map((z) => z.id)}
          onChange={(ids) => setZonas(zonasList.filter((z) => ids.includes(z.id)))}
        />

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
            {t('common.bettingPools')}
          </Typography>
          <Autocomplete
            multiple
            disableCloseOnSelect
            size="small"
            sx={{ minWidth: 220 }}
            options={bancaOptions}
            value={bancaValues}
            onChange={handleBancaChange}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderTags={() => null}
            ListboxProps={{ style: { maxHeight: 360 } }}
            renderOption={(props, option, { selected }) => {
              if (option.id === SELECT_ALL) {
                const allSelected = bancasList.length > 0 && selectedBancas.length === bancasList.length;
                const indeterminate = selectedBancas.length > 0 && selectedBancas.length < bancasList.length;
                return (
                  <li {...props} key="__all_bancas__">
                    <Checkbox
                      size="small"
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      checked={allSelected}
                      indeterminate={indeterminate}
                      sx={{ mr: 1 }}
                    />
                    {option.label}
                  </li>
                );
              }
              return (
                <li {...props} key={option.id}>
                  <Checkbox
                    size="small"
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    checked={selected}
                    sx={{ mr: 1 }}
                  />
                  {option.label}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={bancaValues.length === 0 ? t('common.select') : ''}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: bancaSummary ? (
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      {bancaSummary}
                    </InputAdornment>
                  ) : null,
                }}
              />
            )}
          />
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
          {loading ? <CircularProgress size={16} color="inherit" /> : t('transactions.viewSales')}
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <SearchInput value={filtroRapido} onChange={setFiltroRapido} placeholder={t('common.filterQuick')} />
      </Box>

      {/* Data table */}
      <DataTable<AggRow>
        columns={columns}
        data={groupedData}
        totals={totals}
        emptyMessage={t('common.noEntries')}
      />

      <Typography variant="body2" sx={{ mt: 2 }}>
        {t('sales.showingPlayTypes', { count: groupedData.length })}
      </Typography>
    </>
  );
});

CombinacionesTab.displayName = 'CombinacionesTab';

export default CombinacionesTab;
