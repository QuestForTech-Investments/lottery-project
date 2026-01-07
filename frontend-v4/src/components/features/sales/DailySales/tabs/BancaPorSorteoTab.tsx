import { useState, useCallback, useEffect, useMemo } from 'react';
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
  InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';

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
  const [fechaInicial, setFechaInicial] = useState(selectedDate);
  const [fechaFinal, setFechaFinal] = useState(selectedDate);
  const [searchTerm, setSearchTerm] = useState('');

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
        `/reports/sales/betting-pool-by-draw?startDate=${fechaInicial}&endDate=${fechaFinal}`
      );
      setData(response?.bettingPools || []);
      setDrawTotals(response?.drawTotals || []);
      setSummary(response?.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading betting pool by draw:', error);
      setData([]);
      setDrawTotals([]);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(d =>
      d.bettingPoolName.toLowerCase().includes(term) ||
      d.bettingPoolCode.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleDrawChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedDraws(typeof value === 'string' ? value.split(',').map(Number) : value);
  };


  // Get unique draws from data for columns
  const uniqueDraws = drawTotals;

  // Calculate totals for the filtered data
  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      totalSold: acc.totalSold + row.totalSold,
      totalPrizes: acc.totalPrizes + row.totalPrizes,
      totalCommissions: acc.totalCommissions + row.totalCommissions,
      totalNet: acc.totalNet + row.totalNet
    }), { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  }, [filteredData]);

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
              Fecha inicial
            </Typography>
            <TextField
              type="date"
              size="small"
              value={fechaInicial}
              onChange={(e) => setFechaInicial(e.target.value)}
              sx={{
                width: 200,
                '& .MuiInputBase-root': { height: 32 },
                '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Fecha final
            </Typography>
            <TextField
              type="date"
              size="small"
              value={fechaFinal}
              onChange={(e) => setFechaFinal(e.target.value)}
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
                renderValue={(selected) => {
                  if (selected.length === 1) {
                    const zone = zones.find(z => (z.zoneId || z.id) === selected[0]);
                    return zone?.zoneName || zone?.name || '1 seleccionada';
                  }
                  return `${selected.length} seleccionadas`;
                }}
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

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
          Total neto: <Box component="span" sx={{
            backgroundColor: '#e0f7fa',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: '#00838f'
          }}>{formatCurrency(totals.totalNet)}</Box>
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Filtrado rápido"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
          <Table size="small" stickyHeader>
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}>Ref.</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}>Banca</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}>Total Vendido</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}>Total premios</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}>Total comisiones</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#e3e3e3' }}>Total neto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'Cargando...' : 'No hay entradas para el sorteo y la fecha elegidos'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredData.map((pool) => (
                    <TableRow key={pool.bettingPoolId} hover>
                      <TableCell>{pool.bettingPoolCode}</TableCell>
                      <TableCell>{pool.bettingPoolName}</TableCell>
                      <TableCell align="right">{formatCurrency(pool.totalSold)}</TableCell>
                      <TableCell align="right">{formatCurrency(pool.totalPrizes)}</TableCell>
                      <TableCell align="right">{formatCurrency(pool.totalCommissions)}</TableCell>
                      <TableCell align="right" sx={{ color: pool.totalNet < 0 ? 'error.main' : 'inherit' }}>
                        {formatCurrency(pool.totalNet)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                    <TableCell colSpan={2}>Totales</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalPrizes)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalCommissions)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalNet)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Mostrando {filteredData.length} de {data.length} entradas
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BancaPorSorteoTab;
