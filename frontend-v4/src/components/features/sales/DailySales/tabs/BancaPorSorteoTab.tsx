import { useState, useCallback, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import api from '@services/api';

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface DrawSalesDetail {
  drawId: number;
  drawName: string;
  sold: number;
  prizes: number;
  commissions: number;
  net: number;
}

interface BettingPoolDrawSales {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  zoneId: number;
  zoneName: string;
  drawSales: DrawSalesDetail[];
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawTotals {
  drawId: number;
  drawName: string;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface BettingPoolDrawResponse {
  date: string;
  bettingPools: BettingPoolDrawSales[];
  drawTotals: DrawTotals[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface Draw {
  drawId: number;
  drawName?: string;
  lotteryName?: string;
}

interface BancaPorSorteoTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const BancaPorSorteoTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: BancaPorSorteoTabProps): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BettingPoolDrawSales[]>([]);
  const [drawTotals, setDrawTotals] = useState<DrawTotals[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [draws, setDraws] = useState<Draw[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);

  // Load draws on mount
  useEffect(() => {
    const loadDraws = async () => {
      try {
        const response = await api.get<{ items?: Draw[] } | Draw[]>('/draws');
        const drawsArray = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Draw[] || []);
        setDraws(drawsArray);
        setSelectedDraws(drawsArray.map(d => d.drawId));
      } catch (error) {
        console.error('Error loading draws:', error);
      }
    };
    loadDraws();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<BettingPoolDrawResponse>(
        `/reports/sales/betting-pool-by-draw?date=${selectedDate}`
      );
      setData(response.bettingPools || []);
      setDrawTotals(response.drawTotals || []);
      setSummary(response.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading betting pool by draw:', error);
      setData([]);
      setDrawTotals([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const handleDrawChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedDraws(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  const formatCurrency = (value: number): string => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get unique draws from data for columns
  const uniqueDraws = drawTotals;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Montos por sorteo y banca
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Fecha
            </Typography>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{
                width: 200,
                '& .MuiInputBase-root': { height: 32 },
                '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Sorteos
            </Typography>
            <FormControl
              sx={{
                minWidth: 200,
                '& .MuiInputBase-root': { height: 32 },
                '& .MuiSelect-select': { py: 0.5, fontSize: '0.8rem' },
              }}
              size="small"
            >
              <Select
                multiple
                value={selectedDraws}
                onChange={handleDrawChange}
                input={<OutlinedInput />}
                renderValue={(selected) => `${selected.length} seleccionados`}
              >
                {draws.map((draw) => (
                  <MenuItem key={draw.drawId} value={draw.drawId}>
                    <Checkbox checked={selectedDraws.indexOf(draw.drawId) > -1} />
                    <ListItemText primary={draw.drawName || draw.lotteryName || `Draw ${draw.drawId}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Zonas
            </Typography>
            <FormControl
              sx={{
                minWidth: 200,
                '& .MuiInputBase-root': { height: 32 },
                '& .MuiSelect-select': { py: 0.5, fontSize: '0.8rem' },
              }}
              size="small"
            >
              <Select
                multiple
                value={selectedZones}
                onChange={handleZoneChange}
                input={<OutlinedInput />}
                renderValue={(selected) => `${selected.length} seleccionadas`}
              >
                {zones.map((zone) => {
                  const zoneId = zone.zoneId || zone.id || 0;
                  return (
                    <MenuItem key={zoneId} value={zoneId}>
                      <Checkbox checked={selectedZones.indexOf(zoneId) > -1} />
                      <ListItemText primary={zone.zoneName || zone.name} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={loadData}
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
            {loading ? <CircularProgress size={16} color="inherit" /> : 'Ver ventas'}
          </Button>
        </Box>

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Total neto: {formatCurrency(summary.totalNet)}
        </Typography>

        {data.length === 0 && !loading ? (
          <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mt: 4 }}>
            No hay entradas para el sorteo y la fecha elegidos
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ minWidth: 150, position: 'sticky', left: 0, backgroundColor: 'grey.100', zIndex: 3 }}>
                    Banca
                  </TableCell>
                  {uniqueDraws.map(draw => (
                    <TableCell key={draw.drawId} align="right" sx={{ minWidth: 100 }}>
                      {draw.drawName}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ minWidth: 100 }}><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={uniqueDraws.length + 2} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {data.map((pool) => (
                      <TableRow key={pool.bettingPoolId} hover>
                        <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}>
                          {pool.bettingPoolName}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {pool.bettingPoolCode}
                          </Typography>
                        </TableCell>
                        {uniqueDraws.map(draw => {
                          const drawSale = pool.drawSales.find(ds => ds.drawId === draw.drawId);
                          return (
                            <TableCell key={draw.drawId} align="right">
                              {formatCurrency(drawSale?.sold || 0)}
                            </TableCell>
                          );
                        })}
                        <TableCell align="right">
                          <strong>{formatCurrency(pool.totalSold)}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow sx={{ backgroundColor: 'grey.200' }}>
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'grey.200', zIndex: 1 }}>
                        <strong>Totales</strong>
                      </TableCell>
                      {uniqueDraws.map(draw => (
                        <TableCell key={draw.drawId} align="right">
                          <strong>{formatCurrency(draw.totalSold)}</strong>
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <strong>{formatCurrency(summary.totalSold)}</strong>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Typography variant="body2" sx={{ mt: 2 }}>
          Mostrando {data.length} bancas, {uniqueDraws.length} sorteos
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BancaPorSorteoTab;
