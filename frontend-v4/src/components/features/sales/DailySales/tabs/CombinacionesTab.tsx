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

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface CombinationSalesDto {
  betNumber: string;
  drawId: number;
  drawName: string;
  betTypeId: number;
  betTypeName: string;
  lineCount: number;
  totalSold: number;
  totalCommissions: number;
  totalPrizes: number;
  balance: number;
}

interface CombinationsResponse {
  date: string;
  drawId: number | null;
  combinations: CombinationSalesDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface CombinacionesTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const CombinacionesTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: CombinacionesTabProps): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CombinationSalesDto[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<CombinationsResponse>(
        `/reports/sales/combinations?date=${selectedDate}`
      );
      setData(response.combinations || []);
      setSummary(response.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading combinations:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(d =>
      d.betNumber.includes(term) ||
      d.drawName.toLowerCase().includes(term) ||
      d.betTypeName.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const formatCurrency = (value: number): string => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      lineCount: acc.lineCount + row.lineCount,
      totalSold: acc.totalSold + row.totalSold,
      totalCommissions: acc.totalCommissions + row.totalCommissions,
      totalPrizes: acc.totalPrizes + row.totalPrizes,
      balance: acc.balance + row.balance
    }), {
      lineCount: 0, totalSold: 0, totalCommissions: 0, totalPrizes: 0, balance: 0
    });
  }, [filteredData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Combinaciones
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
          Total vendido: {formatCurrency(summary.totalSold)}
        </Typography>

        <Box sx={{ mb: 2, textAlign: 'right' }}>
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
                <TableCell>Combinación</TableCell>
                <TableCell>Sorteo</TableCell>
                <TableCell>Tipo de apuesta</TableCell>
                <TableCell align="center">Líneas</TableCell>
                <TableCell align="right">Total Vendido</TableCell>
                <TableCell align="right">Total comisiones</TableCell>
                <TableCell align="right">Total premios</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'Cargando...' : 'No hay entradas para el sorteo y la fecha elegidos'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredData.map((row, index) => (
                    <TableRow key={`${row.drawId}-${row.betNumber}-${index}`} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {row.betNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.drawName}</TableCell>
                      <TableCell>{row.betTypeName}</TableCell>
                      <TableCell align="center">{row.lineCount}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalSold)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalCommissions)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalPrizes)}</TableCell>
                      <TableCell align="right" sx={{ color: row.balance < 0 ? 'error.main' : 'success.main' }}>
                        {formatCurrency(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: 'grey.200' }}>
                    <TableCell colSpan={3}><strong>Totales</strong></TableCell>
                    <TableCell align="center"><strong>{totals.lineCount}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.totalSold)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.totalCommissions)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.totalPrizes)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.balance)}</strong></TableCell>
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

export default CombinacionesTab;
