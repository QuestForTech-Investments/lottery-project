import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert
} from '@mui/material';
import { Refresh, PictureAsPdf, Print } from '@mui/icons-material';
import { getAllDraws } from '../../../../services/drawService';
import { getAllZones } from '../../../../services/zoneService';
import { getBettingPools } from '../../../../services/bettingPoolService';
import { getPlaysSummary, PlaySummary } from '../../../../services/playService';

// Types
interface Draw {
  drawId: number;
  drawName: string;
}

interface Zone {
  zoneId: number;
  zoneName: string;
}

interface BettingPool {
  bettingPoolId: number;
  bettingPoolName: string;
  branchCode?: string;
}

interface PlayData {
  betNumber: string;
  salesAmount: number;
  limitAmount: number;
  availableAmount: number;
  percentage: number;
}

// Primary color from design system
const PRIMARY_COLOR = '#51cbce';
const PRIMARY_HOVER = '#45b8bb';

const PlayMonitoring: React.FC = () => {
  // Filter state
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);

  // Data state
  const [playData, setPlayData] = useState<PlayData[]>([]);
  const [drawsList, setDrawsList] = useState<Draw[]>([]);
  const [zonesList, setZonesList] = useState<Zone[]>([]);
  const [poolsList, setPoolsList] = useState<BettingPool[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoadingFilters(true);
      try {
        // Load draws, zones, and betting pools in parallel
        const [drawsResponse, zonesResponse, poolsResponse] = await Promise.all([
          getAllDraws({ loadAll: true }),
          getAllZones({ pageSize: 1000 }),
          getBettingPools({ pageSize: 1000 })
        ]);

        // Process draws
        if (drawsResponse && 'data' in drawsResponse && Array.isArray(drawsResponse.data)) {
          setDrawsList(drawsResponse.data);
        } else if (drawsResponse && 'items' in drawsResponse && Array.isArray(drawsResponse.items)) {
          setDrawsList(drawsResponse.items as Draw[]);
        }

        // Process zones
        if (zonesResponse && 'data' in zonesResponse && Array.isArray(zonesResponse.data)) {
          setZonesList(zonesResponse.data);
        } else if (zonesResponse && 'items' in zonesResponse && Array.isArray(zonesResponse.items)) {
          setZonesList(zonesResponse.items as Zone[]);
        }

        // Process betting pools
        if (poolsResponse && 'items' in poolsResponse && Array.isArray(poolsResponse.items)) {
          setPoolsList(poolsResponse.items);
        } else if (Array.isArray(poolsResponse)) {
          setPoolsList(poolsResponse);
        }
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Error al cargar las opciones de filtro');
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Fetch play data
  const fetchPlayData = useCallback(async () => {
    if (!selectedDraw) {
      setPlayData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the real API endpoint
      const response = await getPlaysSummary({
        drawId: selectedDraw.drawId,
        date: date,
        zoneIds: selectedZones.length > 0 ? selectedZones.map(z => z.zoneId) : undefined,
        bettingPoolId: selectedPool?.bettingPoolId
      });

      // Transform response items to PlayData format
      const data: PlayData[] = response.items.map((item: PlaySummary) => ({
        betNumber: item.betNumber,
        salesAmount: item.salesAmount,
        limitAmount: item.limitAmount,
        availableAmount: item.availableAmount,
        percentage: item.percentage
      }));

      setPlayData(data);
    } catch (err) {
      console.error('Error fetching play data:', err);
      setError('Error al cargar los datos de jugadas');
      setPlayData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDraw, date, selectedZones, selectedPool]);

  // Handle refresh
  const handleRefresh = () => {
    fetchPlayData();
  };

  // Handle PDF export
  const handlePdfExport = () => {
    // TODO: Implement PDF export
    console.log('PDF export not implemented yet');
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Calculate totals
  const totalSales = playData.reduce((sum, d) => sum + d.salesAmount, 0);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: '#2c2c2c', mb: 4, fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}
          >
            Monitoreo de jugadas
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loadingFilters ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: PRIMARY_COLOR }} />
            </Box>
          ) : (
            <>
              {/* Filter Form */}
              <Box sx={{ mb: 2, maxWidth: 400 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  options={drawsList}
                  getOptionLabel={(option) => option.drawName || ''}
                  value={selectedDraw}
                  onChange={(_, value) => setSelectedDraw(value)}
                  isOptionEqualToValue={(option, value) => option.drawId === value.drawId}
                  renderInput={(params) => (
                    <TextField {...params} label="Sorteos" size="small" placeholder="Seleccione" />
                  )}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  multiple
                  options={zonesList}
                  getOptionLabel={(option) => option.zoneName || ''}
                  value={selectedZones}
                  onChange={(_, value) => setSelectedZones(value)}
                  isOptionEqualToValue={(option, value) => option.zoneId === value.zoneId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Zonas"
                      size="small"
                      placeholder="Seleccione"
                      helperText={selectedZones.length > 0 ? `${selectedZones.length} seleccionadas` : ''}
                    />
                  )}
                />
              </Box>

              <Box sx={{ mb: 3, maxWidth: 400 }}>
                <Autocomplete
                  options={poolsList}
                  getOptionLabel={(option) =>
                    option.branchCode
                      ? `${option.bettingPoolName} (${option.branchCode})`
                      : option.bettingPoolName || ''
                  }
                  value={selectedPool}
                  onChange={(_, value) => setSelectedPool(value)}
                  isOptionEqualToValue={(option, value) => option.bettingPoolId === value.bettingPoolId}
                  renderInput={(params) => (
                    <TextField {...params} label="Banca" size="small" placeholder="Seleccione" />
                  )}
                />
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_HOVER },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Refrescar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdf />}
                  onClick={handlePdfExport}
                  disabled={loading || playData.length === 0}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_HOVER },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  disabled={loading || playData.length === 0}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_HOVER },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Imprimir
                </Button>
              </Stack>

              {/* Loading indicator */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: PRIMARY_COLOR }} />
                </Box>
              )}

              {/* Data display */}
              {!loading && playData.length === 0 ? (
                <Typography variant="h6" sx={{ fontWeight: 400, color: '#666' }}>
                  No hay entradas para el sorteo y la fecha elegidos
                </Typography>
              ) : !loading && playData.length > 0 ? (
                <>
                  {/* Summary */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Paper sx={{ px: 4, py: 2, backgroundColor: '#f5f5f5', textAlign: 'center', width: 'fit-content' }} elevation={0}>
                      <Typography variant="h6" sx={{ color: '#1976d2' }}>
                        Total de números: {playData.length} | Ventas totales: {formatCurrency(totalSales)}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Data Table */}
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {['Número', 'Ventas', 'Límite', 'Disponible', '% Vendido'].map((header) => (
                            <TableCell
                              key={header}
                              sx={{
                                fontWeight: 600,
                                backgroundColor: '#f5f5f5',
                                fontSize: '0.75rem',
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {playData.map((row) => {
                          const pct = row.percentage;
                          return (
                            <TableRow
                              key={row.betNumber}
                              sx={{
                                '&:hover': { backgroundColor: 'action.hover' },
                                backgroundColor:
                                  pct > 80 ? 'error.light' : pct > 50 ? 'warning.light' : 'inherit'
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>{row.betNumber}</TableCell>
                              <TableCell>{formatCurrency(row.salesAmount)}</TableCell>
                              <TableCell>{formatCurrency(row.limitAmount)}</TableCell>
                              <TableCell>{formatCurrency(row.availableAmount)}</TableCell>
                              <TableCell
                                sx={{
                                  color: pct > 80 ? 'error.main' : pct > 50 ? 'warning.main' : 'success.main',
                                  fontWeight: 500
                                }}
                              >
                                {pct.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                </>
              ) : null}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(PlayMonitoring);
