import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Grid, Autocomplete, Button, Stack,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  CircularProgress
} from '@mui/material';
import api from '@services/api';
import { BancasTab, PorSorteoTab, CombinacionesTab, PorZonaTab } from './tabs';

interface Zona {
  id: number;
  zoneId?: number;
  name: string;
  zoneName?: string;
}

interface Grupo {
  id: number;
  name: string;
}

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

interface SorteoData {
  sorteo: string;
  tickets: number;
  lineas: number;
  ganadores: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
}

interface CombinacionData {
  combinacion: string;
  sorteo: string;
  tipoApuesta: string;
  lineas: number;
  totalVendido: number;
  comisiones: number;
  comisiones2: number;
  premios: number;
  balances: number;
}

interface ZonaData {
  zona?: string;
  nombre?: string;
  bancasActivas?: number;
  tickets?: number;
  lineas?: number;
  venta: number;
  comisiones: number;
  descuentos: number;
  premios: number;
  neto: number;
  p?: number;
  l?: number;
  w?: number;
  total?: number;
  caida?: number;
  final?: number;
  balance?: number;
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

// API Response interfaces
interface BettingPoolSalesDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawSalesDto {
  drawId: number;
  drawName: string;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawSalesResponse {
  draws: DrawSalesDto[];
  summary: { totalSold: number; totalPrizes: number; totalCommissions: number; totalNet: number };
}

interface CombinationSalesDto {
  betNumber: string;
  drawName: string;
  betTypeName: string;
  lineCount: number;
  totalSold: number;
  totalCommissions: number;
  totalPrizes: number;
  balance: number;
}

interface CombinationSalesResponse {
  combinations: CombinationSalesDto[];
  summary: { totalSold: number; totalPrizes: number; totalCommissions: number; totalNet: number };
}

interface ZoneSalesDto {
  zoneId: number;
  zoneName: string;
  bettingPoolCount: number;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalDiscounts: number;
  totalNet: number;
  fall: number;
  final: number;
  balance: number;
}

interface ZoneSalesResponse {
  zones: ZoneSalesDto[];
  summary: { totalSold: number; totalPrizes: number; totalCommissions: number; totalNet: number };
}

const HistoricalSales = (): React.ReactElement => {
  const [mainTab, setMainTab] = useState<number>(0);
  const [fechaInicial, setFechaInicial] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaFinal, setFechaFinal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [grupo, setGrupo] = useState<string | number>('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Data for different tabs
  const [bancasData, setBancasData] = useState<BancaData[]>([]);
  const [sorteoData, setSorteoData] = useState<SorteoData[]>([]);
  const [combinacionesData, setCombinacionesData] = useState<CombinacionData[]>([]);
  const [zonasData, setZonasData] = useState<ZonaData[]>([]);

  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [gruposList, setGruposList] = useState<Grupo[]>([]);
  const [totals, setTotals] = useState<Totals>({ tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, gastos: 0, final: 0 });


  // Load zones on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await api.get<{ items?: Zona[] } | Zona[]>('/zones');
        const zonesArray = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Zona[] || []);

        const normalizedZones = zonesArray.map((z: Zona) => ({
          id: z.zoneId || z.id,
          name: z.zoneName || z.name
        }));
        setZonasList(normalizedZones);
        setZonas(normalizedZones); // Select all by default
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    loadZones();
  }, []);

  // Load sales by betting pool (General tab)
  const loadBancasData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<BettingPoolSalesDto[]>(
        `/reports/sales/by-betting-pool?startDate=${fechaInicial}&endDate=${fechaFinal}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: BancaData[] = (response || []).map(item => ({
        ref: item.bettingPoolName,
        codigo: item.bettingPoolCode,
        tickets: 0,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: 0,
        premios: item.totalPrizes,
        neto: item.totalNet,
        caida: 0,
        gastos: 0,
        final: item.totalNet
      }));

      setBancasData(mapped);

      const newTotals = mapped.reduce((acc, row) => ({
        tickets: acc.tickets + row.tickets,
        venta: acc.venta + row.venta,
        comisiones: acc.comisiones + row.comisiones,
        descuentos: acc.descuentos + row.descuentos,
        premios: acc.premios + row.premios,
        neto: acc.neto + row.neto,
        caida: acc.caida + row.caida,
        gastos: acc.gastos + row.gastos,
        final: acc.final + row.final
      }), { tickets: 0, venta: 0, comisiones: 0, descuentos: 0, premios: 0, neto: 0, caida: 0, gastos: 0, final: 0 });

      setTotals(newTotals);
    } catch (error) {
      console.error('Error loading bancas data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load sales by draw (Por sorteo tab)
  const loadSorteoData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<DrawSalesResponse>(
        `/reports/sales/by-draw?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: SorteoData[] = (response?.draws || []).map(item => ({
        sorteo: item.drawName,
        tickets: item.ticketCount,
        lineas: item.lineCount,
        ganadores: item.winnerCount,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: 0,
        premios: item.totalPrizes,
        neto: item.totalNet
      }));

      setSorteoData(mapped);
    } catch (error) {
      console.error('Error loading sorteo data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load combinations (Combinaciones tab)
  const loadCombinacionesData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<CombinationSalesResponse>(
        `/reports/sales/combinations?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: CombinacionData[] = (response?.combinations || []).map(item => ({
        combinacion: item.betNumber,
        sorteo: item.drawName,
        tipoApuesta: item.betTypeName,
        lineas: item.lineCount,
        totalVendido: item.totalSold,
        comisiones: item.totalCommissions,
        comisiones2: 0,
        premios: item.totalPrizes,
        balances: item.balance
      }));

      setCombinacionesData(mapped);
    } catch (error) {
      console.error('Error loading combinaciones data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load sales by zone (Por zona tab)
  const loadZonasData = async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<ZoneSalesResponse>(
        `/reports/sales/by-zone?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: ZonaData[] = (response?.zones || []).map(item => ({
        nombre: item.zoneName,
        bancasActivas: item.bettingPoolCount,
        tickets: item.ticketCount,
        lineas: item.lineCount,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: item.totalDiscounts,
        premios: item.totalPrizes,
        neto: item.totalNet,
        p: 0,
        l: 0,
        w: item.winnerCount,
        total: item.lineCount,
        caida: item.fall,
        final: item.final,
        balance: item.balance
      }));

      setZonasData(mapped);
    } catch (error) {
      console.error('Error loading zonas data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search based on current tab
  const handleSearch = () => {
    switch (mainTab) {
      case 0:
        loadBancasData();
        break;
      case 1:
        loadSorteoData();
        break;
      case 2:
        loadCombinacionesData();
        break;
      case 3:
        loadZonasData();
        break;
    }
  };

  // Render content based on selected tab
  const renderTabContent = () => {
    switch (mainTab) {
      case 0: // General - Bancas
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

      case 1: // Por sorteo
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

      case 2: // Combinaciones
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

      case 3: // Por zona
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
          <Tabs value={mainTab} onChange={(e, v) => setMainTab(v)}>
            <Tab label="General" />
            <Tab label="Por sorteo" />
            <Tab label="Combinaciones" />
            <Tab label="Por zona" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {mainTab === 0 && (
            <>
              <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 2, fontWeight: 400 }}>
                Reportes
              </Typography>

              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth type="date" label="Fecha inicial" value={fechaInicial}
                    onChange={(e) => setFechaInicial(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth type="date" label="Fecha final" value={fechaFinal}
                    onChange={(e) => setFechaFinal(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
                    onChange={(e, v) => setZonas(v)}
                    renderTags={() => null}
                    renderInput={(params) => (
                      <TextField {...params} label="Zonas" size="small"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: zonas.length > 0 ? (
                            <InputAdornment position="start" sx={{ ml: 1 }}>
                              {zonas.length === 1 ? zonas[0].name : `${zonas.length} seleccionadas`}
                            </InputAdornment>
                          ) : null
                        }}
                        placeholder={zonas.length === 0 ? "Seleccione" : ""} />
                    )} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Grupo</InputLabel>
                    <Select value={grupo} label="Grupo" onChange={(e) => setGrupo(e.target.value)}>
                      <MenuItem value="">Seleccione</MenuItem>
                      {gruposList.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                  onClick={handleSearch}
                  disabled={loading}
                  size="small"
                  sx={{
                    borderRadius: '20px',
                    px: 2.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 500
                  }}
                >
                  Ver ventas
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
                    fontWeight: 500
                  }}
                >
                  CSV
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
                    fontWeight: 500
                  }}
                >
                  PDF
                </Button>
              </Stack>
            </>
          )}

          {renderTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default HistoricalSales;
