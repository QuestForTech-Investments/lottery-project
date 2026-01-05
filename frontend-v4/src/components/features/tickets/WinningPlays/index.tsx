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
import { FilterList, PictureAsPdf } from '@mui/icons-material';
import {
  getWinningPlaysParams,
  getWinningPlays,
  WinningPlay,
  DrawParam,
  ZoneParam
} from '../../../../services/winningPlayService';

// Primary color from design system
const PRIMARY_COLOR = '#51cbce';
const PRIMARY_HOVER = '#45b8bb';

// Map DrawParam to component-friendly format
interface Draw {
  drawId: number;
  lotteryName: string;
}

interface Zone {
  zoneId: number;
  name: string;
}

const WinningPlays: React.FC = () => {
  // Filter state
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);

  // Data state
  const [winningPlays, setWinningPlays] = useState<WinningPlay[]>([]);
  const [drawsList, setDrawsList] = useState<Draw[]>([]);
  const [zonesList, setZonesList] = useState<Zone[]>([]);

  // Totals
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalPrizes, setTotalPrizes] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);

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
        const params = await getWinningPlaysParams();

        // Transform draws
        const draws: Draw[] = params.draws.map((d: DrawParam) => ({
          drawId: d.drawId,
          lotteryName: d.lotteryName
        }));
        setDrawsList(draws);

        // Transform zones
        const zones: Zone[] = params.zones.map((z: ZoneParam) => ({
          zoneId: z.zoneId,
          name: z.name
        }));
        setZonesList(zones);
      } catch (err) {
        console.error('Error loading filter options:', err);
        setError('Error al cargar las opciones de filtro');
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Fetch winning plays
  const fetchWinningPlays = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getWinningPlays({
        startDate,
        endDate,
        drawId: selectedDraw?.drawId,
        zoneIds: selectedZones.length > 0 ? selectedZones.map(z => z.zoneId) : undefined
      });

      setWinningPlays(response.items);
      setTotalSales(response.totalSales);
      setTotalPrizes(response.totalPrizes);
      setGrandTotal(response.grandTotal);
    } catch (err) {
      console.error('Error fetching winning plays:', err);
      setError('Error al cargar las jugadas ganadoras');
      setWinningPlays([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedDraw, selectedZones]);

  // Handle filter button click
  const handleFilter = () => {
    fetchWinningPlays();
  };

  // Handle PDF export
  const handlePdfExport = () => {
    // TODO: Implement PDF export
    console.log('PDF export not implemented yet');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: '#2c2c2c', mb: 4, fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}
          >
            Jugadas ganadoras
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
              {/* Date filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha inicial"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha final"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Sorteo and Zones filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Autocomplete
                    options={drawsList}
                    getOptionLabel={(option) => option.lotteryName || ''}
                    value={selectedDraw}
                    onChange={(_, value) => setSelectedDraw(value)}
                    isOptionEqualToValue={(option, value) => option.drawId === value.drawId}
                    renderInput={(params) => (
                      <TextField {...params} label="Sorteo" size="small" placeholder="Seleccione" />
                    )}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Autocomplete
                    multiple
                    options={zonesList}
                    getOptionLabel={(option) => option.name || ''}
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
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={handleFilter}
                  disabled={loading}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_HOVER },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Filtrar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdf />}
                  onClick={handlePdfExport}
                  disabled={loading || winningPlays.length === 0}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    '&:hover': { bgcolor: PRIMARY_HOVER },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  PDF
                </Button>
              </Stack>

              {/* Loading indicator */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: PRIMARY_COLOR }} />
                </Box>
              )}

              {/* Data Table */}
              {!loading && (
                <>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {['Tipo de jugada', 'Jugada', 'Venta', 'Premio', 'Total'].map((header) => (
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
                        {winningPlays.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: PRIMARY_COLOR }}>
                              No hay entradas disponibles
                            </TableCell>
                          </TableRow>
                        ) : (
                          winningPlays.map((play) => (
                            <TableRow key={play.lineId} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                              <TableCell>{play.betTypeName}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{play.betNumber}</TableCell>
                              <TableCell>{formatCurrency(play.salesAmount)}</TableCell>
                              <TableCell sx={{ color: 'success.main' }}>{formatCurrency(play.prizeAmount)}</TableCell>
                              <TableCell sx={{ color: play.total < 0 ? 'error.main' : 'success.main', fontWeight: 500 }}>
                                {formatCurrency(play.total)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Box>

                  {/* Summary row */}
                  {winningPlays.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Paper sx={{ px: 4, py: 2, backgroundColor: '#f5f5f5', textAlign: 'center', width: 'fit-content' }} elevation={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
                          <Typography variant="h6" sx={{ color: '#1976d2' }}>
                            Total registros: {winningPlays.length}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#1976d2' }}>
                            Ventas: {formatCurrency(totalSales)}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#28a745' }}>
                            Premios: {formatCurrency(totalPrizes)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: grandTotal < 0 ? '#dc3545' : '#28a745' }}>
                            Total: {formatCurrency(grandTotal)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(WinningPlays);
