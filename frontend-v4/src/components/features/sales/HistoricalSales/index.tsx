/**
 * HistoricalSales Component
 *
 * Refactored component with modular architecture.
 * - Types extracted to ./types.ts
 * - State/logic extracted to ./hooks/useHistoricalSales.ts
 * - Tab components in ./tabs/
 */

import React, { memo } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  CircularProgress
} from '@mui/material';
import { useHistoricalSales } from './hooks/useHistoricalSales';
import { BancasTab, PorSorteoTab, CombinacionesTab, PorZonaTab } from './tabs';
import type { Zona } from './types';

const HistoricalSales: React.FC = () => {
  const {
    mainTab,
    setMainTab,
    fechaInicial,
    fechaFinal,
    zonas,
    grupo,
    filterType,
    filtroRapido,
    loading,
    setFechaInicial,
    setFechaFinal,
    setZonas,
    setGrupo,
    setFilterType,
    setFiltroRapido,
    zonasList,
    gruposList,
    bancasData,
    sorteoData,
    combinacionesData,
    zonasData,
    totals,
    handleSearch,
  } = useHistoricalSales();

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
            combinacionesData={combinacionesData.map(d => ({
              combinacion: d.combinacion,
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
            <Tab label="General" />
            <Tab label="Por sorteo" />
            <Tab label="Combinaciones" />
            <Tab label="Por zona" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {mainTab === 0 && (
            <GeneralTabHeader
              fechaInicial={fechaInicial}
              fechaFinal={fechaFinal}
              zonas={zonas}
              zonasList={zonasList}
              grupo={grupo}
              gruposList={gruposList}
              loading={loading}
              onFechaInicialChange={setFechaInicial}
              onFechaFinalChange={setFechaFinal}
              onZonasChange={setZonas}
              onGrupoChange={setGrupo}
              onSearch={handleSearch}
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
  grupo: string | number;
  gruposList: Array<{ id: number; name: string }>;
  loading: boolean;
  onFechaInicialChange: (date: string) => void;
  onFechaFinalChange: (date: string) => void;
  onZonasChange: (zonas: Zona[]) => void;
  onGrupoChange: (grupo: string | number) => void;
  onSearch: () => void;
}

const GeneralTabHeader = memo<GeneralTabHeaderProps>(({
  fechaInicial,
  fechaFinal,
  zonas,
  zonasList,
  grupo,
  gruposList,
  loading,
  onFechaInicialChange,
  onFechaFinalChange,
  onZonasChange,
  onGrupoChange,
  onSearch,
}) => {
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
        Reportes
      </Typography>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Fecha inicial"
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
            label="Fecha final"
            value={fechaFinal}
            onChange={(e) => onFechaFinalChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            multiple
            options={zonasList}
            getOptionLabel={(o) => o.name || ''}
            value={zonas}
            onChange={(_, v) => onZonasChange(v)}
            renderTags={() => null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Zonas"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: zonas.length > 0 ? (
                    <InputAdornment position="start" sx={{ ml: 1 }}>
                      {zonas.length === 1 ? zonas[0].name : `${zonas.length} seleccionadas`}
                    </InputAdornment>
                  ) : null
                }}
                placeholder={zonas.length === 0 ? "Seleccione" : ""}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Grupo</InputLabel>
            <Select
              value={grupo}
              label="Grupo"
              onChange={(e) => onGrupoChange(e.target.value)}
            >
              <MenuItem value="">Seleccione</MenuItem>
              {gruposList.map(g => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
          Ver ventas
        </Button>
        <Button variant="contained" size="small" sx={buttonStyles}>
          CSV
        </Button>
        <Button variant="contained" size="small" sx={buttonStyles}>
          PDF
        </Button>
      </Stack>
    </>
  );
});

GeneralTabHeader.displayName = 'GeneralTabHeader';

export default memo(HistoricalSales);
