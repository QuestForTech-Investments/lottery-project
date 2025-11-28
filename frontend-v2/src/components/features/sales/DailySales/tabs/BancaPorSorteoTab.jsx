import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { getAllDraws } from '@services/drawService';
import { getSalesByBettingPoolAndDraw } from '@services/salesReportService';

const BancaPorSorteoTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }) => {
  console.log('🎯 BancaPorSorteoTab mounted');

  const [loading, setLoading] = useState(false);
  const [draws, setDraws] = useState([]);
  const [selectedDrawIds, setSelectedDrawIds] = useState([]);
  const [endDate, setEndDate] = useState(selectedDate);
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);

  // Load draws on mount
  useEffect(() => {
    loadDraws();
  }, []);

  const loadDraws = async () => {
    try {
      console.log('🎯 Loading draws...');
      const result = await getAllDraws({ loadAll: true, isActive: true });
      const drawsData = result?.data || [];
      console.log('🎯 Loaded draws:', drawsData.length);
      setDraws(drawsData);

      // Select all draws by default
      const allDrawIds = drawsData.map(d => d.drawId);
      setSelectedDrawIds(allDrawIds);
    } catch (err) {
      console.error('🎯 Error loading draws:', err);
      setError('Error al cargar los sorteos');
    }
  };

  const handleDrawChange = (event) => {
    const value = event.target.value;
    setSelectedDrawIds(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  const handleViewSales = async () => {
    if (!selectedDate || !endDate) {
      setError('Debe seleccionar fechas de inicio y fin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🎯 Fetching sales data...');
      const result = await getSalesByBettingPoolAndDraw({
        startDate: selectedDate,
        endDate: endDate,
        drawIds: selectedDrawIds.length > 0 ? selectedDrawIds : null,
        zoneIds: selectedZones.length > 0 ? selectedZones : null
      });

      console.log('🎯 Sales data received:', result);
      setSalesData(result.data);
      setIsMockData(result.isMockData || false);
    } catch (err) {
      console.error('🎯 Error fetching sales:', err);
      setError('Error al cargar los datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getNetColor = (value) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'text.primary';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Montos por sorteo y banca
        </Typography>

        {/* Mock Data Warning */}
        {isMockData && salesData && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Mostrando datos de prueba. La API no está disponible temporalmente.
            Ver <code>/docs/API_SALES_REPORTS.md</code> para más información.
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Fecha inicial
            </Typography>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ width: 200 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Fecha final
            </Typography>
            <TextField
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ width: 200 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Sorteos
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Select
                multiple
                value={selectedDrawIds}
                onChange={handleDrawChange}
                input={<OutlinedInput />}
                renderValue={(selected) => `${selected.length} seleccionadas`}
              >
                {draws.map((draw) => (
                  <MenuItem key={draw.drawId} value={draw.drawId}>
                    <Checkbox checked={selectedDrawIds.indexOf(draw.drawId) > -1} />
                    <ListItemText
                      primary={draw.drawName || draw.lotteryName}
                      secondary={draw.drawTime ? `${draw.drawTime.substring(0, 5)}` : null}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Zonas
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Select
                multiple
                value={selectedZones}
                onChange={handleZoneChange}
                input={<OutlinedInput />}
                renderValue={(selected) => `${selected.length} seleccionadas`}
              >
                {zones.map((zone) => (
                  <MenuItem key={zone.zoneId || zone.id} value={zone.zoneId || zone.id}>
                    <Checkbox checked={selectedZones.indexOf(zone.zoneId || zone.id) > -1} />
                    <ListItemText primary={zone.zoneName || zone.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Action Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleViewSales}
            disabled={loading}
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              borderRadius: '30px',
              px: 4,
              py: 1.2,
              textTransform: 'uppercase',
              fontWeight: 500,
              color: 'white'
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Ver ventas'}
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {salesData && (
          <>
            {/* Total Neto */}
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
              Total neto:{' '}
              <Box
                component="span"
                sx={{
                  color: getNetColor(salesData.totalNet),
                  fontWeight: 600
                }}
              >
                {formatCurrency(salesData.totalNet)}
              </Box>
            </Typography>

            {/* Results Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Ref.</TableCell>
                    <TableCell>Banca</TableCell>
                    <TableCell align="right">Total Vendido</TableCell>
                    <TableCell align="right">Total premios</TableCell>
                    <TableCell align="right">Total comisiones</TableCell>
                    <TableCell align="right">Total neto</TableCell>
                  </TableRow>
                  {/* Totals Row */}
                  {salesData.summary && (
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell colSpan={2}><strong>Totales</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(salesData.summary.totalSold)}</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(salesData.summary.totalPrizes)}</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(salesData.summary.totalCommissions)}</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(salesData.summary.totalNet)}</strong></TableCell>
                    </TableRow>
                  )}
                </TableHead>
                <TableBody>
                  {salesData.bettingPools && salesData.bettingPools.length > 0 ? (
                    salesData.bettingPools.map((pool) => (
                      <TableRow key={pool.bettingPoolId} hover>
                        <TableCell>{pool.bettingPoolName}</TableCell>
                        <TableCell>{pool.bettingPoolCode}</TableCell>
                        <TableCell align="right">{formatCurrency(pool.totalSold)}</TableCell>
                        <TableCell align="right">{formatCurrency(pool.totalPrizes)}</TableCell>
                        <TableCell align="right">{formatCurrency(pool.totalCommissions)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: getNetColor(pool.totalNet), fontWeight: 500 }}
                        >
                          {formatCurrency(pool.totalNet)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay entradas para el sorteo y la fecha elegidos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Entry Counter */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              Mostrando {salesData.bettingPools?.length || 0} de {salesData.totalCount || 0} entradas
            </Typography>
          </>
        )}

        {/* No Data Message */}
        {!loading && !salesData && !error && (
          <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mt: 4 }}>
            Seleccione los filtros y haga clic en "Ver ventas" para cargar los datos
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default BancaPorSorteoTab;
