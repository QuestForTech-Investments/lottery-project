/**
 * HistoricalSales Component
 *
 * Refactored component with modular architecture.
 * - Types extracted to ./types.ts
 * - State/logic extracted to ./hooks/useHistoricalSales.ts
 * - Tab components in ./tabs/
 */

import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack,
  Tabs, Tab, InputAdornment,
  CircularProgress
} from '@mui/material';
import { useHistoricalSales } from './hooks/useHistoricalSales';
import { BancasTab, PorSorteoTab, CombinacionesTab, PorZonaTab } from './tabs';
import type { Zona } from './types';
import { exportToCsv, exportToPdf, type ExportColumn } from '@/utils/exportTable';
import { formatCurrency } from '@/utils/formatCurrency';

const HistoricalSales: React.FC = () => {
  const { t } = useTranslation();
  const {
    mainTab,
    setMainTab,
    fechaInicial,
    fechaFinal,
    zonas,
    filterType,
    filtroRapido,
    loading,
    setFechaInicial,
    setFechaFinal,
    setZonas,
    setFilterType,
    setFiltroRapido,
    zonasList,
    drawsList,
    bancasList,
    selectedDraws,
    selectedBancas,
    setSelectedDraws,
    setSelectedBancas,
    bancasData,
    sorteoData,
    combinacionesData,
    zonasData,
    totals,
    handleSearch,
  } = useHistoricalSales();

  // Export columns mirror the BancaData shape used in the General tab.
  const exportColumns = useMemo<ExportColumn<Record<string, unknown>>[]>(() => {
    const moneyKeys = new Set(['venta', 'comisiones', 'descuentos', 'premios', 'neto', 'caida', 'gastos', 'final']);
    return [
      { key: 'ref', label: t('sales.ref'), align: 'left' as const },
      { key: 'codigo', label: t('common.code'), align: 'left' as const },
      { key: 'tickets', label: t('common.tickets'), align: 'right' as const },
      { key: 'venta', label: t('sales.venta'), align: 'right' as const },
      { key: 'comisiones', label: t('sales.comisiones'), align: 'right' as const },
      { key: 'descuentos', label: t('sales.descuentos'), align: 'right' as const },
      { key: 'premios', label: t('sales.premios'), align: 'right' as const },
      { key: 'neto', label: t('sales.neto'), align: 'right' as const },
      { key: 'caida', label: t('sales.caida'), align: 'right' as const },
      { key: 'gastos', label: t('sales.gastos'), align: 'right' as const },
      { key: 'final', label: t('sales.final'), align: 'right' as const },
    ].map(c => ({
      ...c,
      getValue: moneyKeys.has(c.key)
        ? (row: Record<string, unknown>) => formatCurrency(Number(row[c.key] ?? 0))
        : undefined,
    }));
  }, [t]);

  const totalsAsRow = useMemo<Record<string, unknown>>(
    () => ({ ref: t('balances.totals'), codigo: '', ...totals }),
    [totals, t],
  );

  const handleExportCsv = useCallback(() => {
    if (bancasData.length === 0) {
      alert(t('sales.noDataToExport'));
      return;
    }
    exportToCsv(
      bancasData as unknown as Record<string, unknown>[],
      exportColumns,
      `historico-ventas-${fechaInicial}_${fechaFinal}`,
      totalsAsRow,
    );
  }, [bancasData, exportColumns, fechaInicial, fechaFinal, totalsAsRow, t]);

  const handleExportPdf = useCallback(() => {
    if (bancasData.length === 0) {
      alert(t('sales.noDataToExport'));
      return;
    }
    exportToPdf(
      bancasData as unknown as Record<string, unknown>[],
      exportColumns,
      t('sales.historyExportTitle', { start: fechaInicial, end: fechaFinal }),
      totalsAsRow,
    );
  }, [bancasData, exportColumns, fechaInicial, fechaFinal, totalsAsRow, t]);

  // Render content based on selected tab
  const renderTabContent = () => {
    switch (mainTab) {
      case 0:
        return (
          <BancasTab
            bancasData={bancasData}
            totals={totals}
            filterType={filterType}
            filtroRapido={filtroRapido}
            setFilterType={setFilterType}
            setFiltroRapido={setFiltroRapido}
          />
        );

      case 1:
        return (
          <PorSorteoTab
            fechaInicial={fechaInicial}
            fechaFinal={fechaFinal}
            zonas={zonas.map(z => ({ id: z.id, name: z.name }))}
            zonasList={zonasList.map(z => ({ id: z.id, name: z.name }))}
            sorteoData={sorteoData.map(d => ({
              sorteo: d.sorteo,
              venta: d.venta,
              premios: d.premios,
              comisiones: d.comisiones,
              neto: d.neto,
              lotteryImageUrl: d.lotteryImageUrl ?? null,
            }))}
            filtroRapido={filtroRapido}
            loading={loading}
            setFechaInicial={setFechaInicial}
            setFechaFinal={setFechaFinal}
            setZonas={(zones) => setZonas(zones as Zona[])}
            setFiltroRapido={setFiltroRapido}
            onSearch={handleSearch}
          />
        );

      case 2:
        return (
          <CombinacionesTab
            fechaInicial={fechaInicial}
            fechaFinal={fechaFinal}
            zonas={zonas.map(z => ({ id: z.id, name: z.name }))}
            zonasList={zonasList.map(z => ({ id: z.id, name: z.name }))}
            drawsList={drawsList}
            bancasList={bancasList}
            selectedDraws={selectedDraws}
            selectedBancas={selectedBancas}
            setSelectedDraws={setSelectedDraws}
            setSelectedBancas={setSelectedBancas}
            combinacionesData={combinacionesData.map(d => ({
              combinacion: d.combinacion,
              tipoApuesta: d.tipoApuesta,
              lineas: d.lineas,
              totalVendido: d.totalVendido,
              comisiones: d.comisiones,
              comisiones2: d.comisiones2,
              premios: d.premios,
              balances: d.balances,
            }))}
            filtroRapido={filtroRapido}
            loading={loading}
            setFechaInicial={setFechaInicial}
            setFechaFinal={setFechaFinal}
            setZonas={(zones) => setZonas(zones as Zona[])}
            setFiltroRapido={setFiltroRapido}
            onSearch={handleSearch}
          />
        );

      case 3:
        return (
          <PorZonaTab
            fechaInicial={fechaInicial}
            fechaFinal={fechaFinal}
            zonas={zonas.map(z => ({ id: z.id, name: z.name }))}
            zonasList={zonasList.map(z => ({ id: z.id, name: z.name }))}
            zonasData={zonasData.map(z => ({
              nombre: z.nombre || z.zona || '',
              p: z.p || 0,
              l: z.l || 0,
              w: z.w || 0,
              total: z.total || 0,
              venta: z.venta,
              comisiones: z.comisiones,
              descuentos: z.descuentos,
              premios: z.premios,
              neto: z.neto,
              caida: z.caida || 0,
              final: z.final || 0,
              balance: z.balance || 0,
            }))}
            filterType={filterType}
            filtroRapido={filtroRapido}
            loading={loading}
            setFechaInicial={setFechaInicial}
            setFechaFinal={setFechaFinal}
            setZonas={(zones) => setZonas(zones as Zona[])}
            setFilterType={setFilterType}
            setFiltroRapido={setFiltroRapido}
            onSearch={handleSearch}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}>
            <Tab label={t('sales.tabs.general')} />
            <Tab label={t('sales.tabs.porSorteo')} />
            <Tab label={t('sales.tabs.combinaciones')} />
            <Tab label={t('sales.tabs.porZona')} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {mainTab === 0 && (
            <GeneralTabHeader
              fechaInicial={fechaInicial}
              fechaFinal={fechaFinal}
              zonas={zonas}
              zonasList={zonasList}
              loading={loading}
              onFechaInicialChange={setFechaInicial}
              onFechaFinalChange={setFechaFinal}
              onZonasChange={setZonas}
              onSearch={handleSearch}
              onExportCsv={handleExportCsv}
              onExportPdf={handleExportPdf}
            />
          )}
          {renderTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

// Helper component for General tab header
interface GeneralTabHeaderProps {
  fechaInicial: string;
  fechaFinal: string;
  zonas: Zona[];
  zonasList: Zona[];
  loading: boolean;
  onFechaInicialChange: (date: string) => void;
  onFechaFinalChange: (date: string) => void;
  onZonasChange: (zonas: Zona[]) => void;
  onSearch: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
}

const GeneralTabHeader = memo<GeneralTabHeaderProps>(({
  fechaInicial,
  fechaFinal,
  zonas,
  zonasList,
  loading,
  onFechaInicialChange,
  onFechaFinalChange,
  onZonasChange,
  onSearch,
  onExportCsv,
  onExportPdf,
}) => {
  const { t } = useTranslation();
  const buttonStyles = {
    borderRadius: '20px',
    px: 2.5,
    py: 0.5,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    fontWeight: 500
  };

  return (
    <>
      <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 2, fontWeight: 400 }}>
        {t('sales.reports')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label={t('common.dateStart')}
            value={fechaInicial}
            onChange={(e) => onFechaInicialChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label={t('common.dateEnd')}
            value={fechaFinal}
            onChange={(e) => onFechaFinalChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            multiple
            // Prepend a synthetic "Todas" entry — clicking it toggles all zones.
            options={[{ id: -1, name: t('common.all') } as Zona, ...zonasList]}
            getOptionLabel={(o) => o.name || ''}
            value={zonas}
            onChange={(_, v) => {
              if (v.some((z) => z.id === -1)) {
                onZonasChange(zonas.length === zonasList.length ? [] : zonasList.slice());
                return;
              }
              onZonasChange(v);
            }}
            renderTags={() => null}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.zones')}
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: zonas.length > 0 ? (
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      {zonas.length === zonasList.length && zonasList.length > 0
                        ? t('common.all')
                        : zonas.length === 1
                          ? zonas[0].name
                          : t('balances.selectedCount', { count: zonas.length })}
                    </InputAdornment>
                  ) : null
                }}
                placeholder={zonas.length === 0 ? t('common.select') : ''}
              />
            )}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          onClick={onSearch}
          disabled={loading}
          size="small"
          sx={buttonStyles}
        >
          {t('transactions.viewSales')}
        </Button>
        <Button variant="contained" onClick={onExportCsv} size="small" sx={buttonStyles}>
          CSV
        </Button>
        <Button variant="contained" onClick={onExportPdf} size="small" sx={buttonStyles}>
          PDF
        </Button>
      </Stack>
    </>
  );
});

GeneralTabHeader.displayName = 'GeneralTabHeader';

export default memo(HistoricalSales);
