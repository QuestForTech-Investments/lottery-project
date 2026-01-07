import { useState, useCallback, useMemo } from 'react';
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
  InputAdornment,
  CircularProgress
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

interface DrawSalesDto {
  drawId: number;
  drawName: string;
  lotteryName: string | null;
  drawTime: string;
  drawColor: string | null;
  ticketCount: number;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalCommissions: number;
  totalNet: number;
}

interface DrawSalesResponse {
  date: string;
  draws: DrawSalesDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface PorSorteoTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const PorSorteoTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: PorSorteoTabProps): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DrawSalesDto[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<DrawSalesResponse>(
        `/reports/sales/by-draw?date=${selectedDate}`
      );
      setData(response?.draws || []);
      setSummary(response?.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading sales by draw:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(d =>
      d.drawName.toLowerCase().includes(term) ||
      (d.lotteryName && d.lotteryName.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.75rem' }}>
          Ventas por sorteo
        </Typography>

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

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 4, fontSize: '1.7rem' }}>
          Total neto: <Box component="span" sx={{
            backgroundColor: '#e0f7fa',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: '#00838f'
          }}>{formatCurrency(summary.totalNet)}</Box>
        </Typography>

        {data.length === 0 && !loading && (
          <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.25rem' }}>
            No hay entradas para el sorteo y la fecha elegidos
          </Typography>
        )}

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

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ cursor: 'pointer', fontWeight: 600 }}>Sorteo</TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total Vendido</TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total premios</TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total comisiones</TableCell>
                <TableCell align="right" sx={{ cursor: 'pointer', fontWeight: 600 }}>Total neto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'Cargando...' : 'No hay entradas para el sorteo y la fecha elegidos'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.drawId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {row.drawColor && (
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: row.drawColor
                          }} />
                        )}
                        {row.drawName}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(row.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalPrizes)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalCommissions)}</TableCell>
                    <TableCell align="right" sx={{ color: row.totalNet < 0 ? 'error.main' : 'inherit' }}>
                      {formatCurrency(row.totalNet)}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                <TableCell>Totales</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalSold)}</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalPrizes)}</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalCommissions)}</TableCell>
                <TableCell align="right">{formatCurrency(summary.totalNet)}</TableCell>
              </TableRow>
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

export default PorSorteoTab;
