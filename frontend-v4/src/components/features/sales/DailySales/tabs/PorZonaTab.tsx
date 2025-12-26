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
  ToggleButton,
  ToggleButtonGroup,
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
  date: string;
  zones: ZoneSalesDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface FilterOption {
  value: string;
  label: string;
}

interface PorZonaTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'with-sales', label: 'Con ventas' },
  { value: 'with-prizes', label: 'Con premios' },
  { value: 'negative-net', label: 'Con ventas netas negativas' },
  { value: 'positive-net', label: 'Con ventas netas positivas' },
  { value: 'with-pending-tickets', label: 'Con tickets pendientes' }
];

const PorZonaTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: PorZonaTabProps): React.ReactElement => {
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ZoneSalesDto[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<ZoneSalesResponse>(
        `/reports/sales/by-zone?date=${selectedDate}`
      );
      setData(response.zones || []);
      setSummary(response.summary || { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
    } catch (error) {
      console.error('Error loading sales by zone:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    let result = data;

    // Apply filter type
    switch (filterType) {
      case 'with-sales':
        result = result.filter(d => d.totalSold > 0);
        break;
      case 'with-prizes':
        result = result.filter(d => d.totalPrizes > 0);
        break;
      case 'negative-net':
        result = result.filter(d => d.totalNet < 0);
        break;
      case 'positive-net':
        result = result.filter(d => d.totalNet > 0);
        break;
      case 'with-pending-tickets':
        result = result.filter(d => d.ticketCount > 0 && d.winnerCount === 0);
        break;
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d => d.zoneName.toLowerCase().includes(term));
    }

    return result;
  }, [data, filterType, searchTerm]);

  const formatCurrency = (value: number): string => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      bettingPoolCount: acc.bettingPoolCount + row.bettingPoolCount,
      ticketCount: acc.ticketCount + row.ticketCount,
      lineCount: acc.lineCount + row.lineCount,
      winnerCount: acc.winnerCount + row.winnerCount,
      totalSold: acc.totalSold + row.totalSold,
      totalCommissions: acc.totalCommissions + row.totalCommissions,
      totalDiscounts: acc.totalDiscounts + row.totalDiscounts,
      totalPrizes: acc.totalPrizes + row.totalPrizes,
      totalNet: acc.totalNet + row.totalNet,
      fall: acc.fall + row.fall,
      final: acc.final + row.final,
      balance: acc.balance + row.balance
    }), {
      bettingPoolCount: 0, ticketCount: 0, lineCount: 0, winnerCount: 0,
      totalSold: 0, totalCommissions: 0, totalDiscounts: 0, totalPrizes: 0,
      totalNet: 0, fall: 0, final: 0, balance: 0
    });
  }, [filteredData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Zonas
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

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
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
        </Box>

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3, fontSize: '1.7rem' }}>
          Total: <Box component="span" sx={{
            backgroundColor: '#e0f7fa',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            color: '#00838f'
          }}>{formatCurrency(summary.totalSold)}</Box>
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            Filtros
          </Typography>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={(_e, newValue) => newValue && setFilterType(newValue)}
            size="small"
            sx={{
              border: '2px solid #8b5cf6',
              borderRadius: '6px',
              overflow: 'hidden',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRight: '2px solid #8b5cf6',
                borderRadius: 0,
                px: 2,
                py: 0.6,
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                color: '#64748b',
                backgroundColor: '#fff',
                transition: 'all 0.15s ease',
                '&:last-of-type': {
                  borderRight: 'none',
                },
                '&:hover': {
                  backgroundColor: '#f8f7ff',
                  color: '#7c3aed',
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  },
                },
              },
            }}
          >
            {FILTER_OPTIONS.map(option => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

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

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>P</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>L</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>W</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Venta</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Comisiones</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Descuentos</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Premios</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Neto</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Caída</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Final</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {loading ? 'Cargando...' : 'No hay entradas para el sorteo y la fecha elegidos'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredData.map((row) => (
                    <TableRow key={row.zoneId} hover>
                      <TableCell>{row.zoneName}</TableCell>
                      <TableCell align="center">{row.bettingPoolCount}</TableCell>
                      <TableCell align="center">{row.lineCount}</TableCell>
                      <TableCell align="center">{row.winnerCount}</TableCell>
                      <TableCell align="right">{row.bettingPoolCount + row.lineCount + row.winnerCount}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalSold)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalCommissions)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalDiscounts)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalPrizes)}</TableCell>
                      <TableCell align="right" sx={{ color: row.totalNet < 0 ? 'error.main' : 'inherit' }}>
                        {formatCurrency(row.totalNet)}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(row.fall)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.final)}</TableCell>
                      <TableCell align="right" sx={{ color: row.balance < 0 ? 'error.main' : 'success.main' }}>
                        {formatCurrency(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: '#f5f7fa', '& td': { fontWeight: 600 } }}>
                    <TableCell>Totales</TableCell>
                    <TableCell align="center">{totals.bettingPoolCount}</TableCell>
                    <TableCell align="center">{totals.lineCount}</TableCell>
                    <TableCell align="center">{totals.winnerCount}</TableCell>
                    <TableCell align="right">{totals.bettingPoolCount + totals.lineCount + totals.winnerCount}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalCommissions)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalDiscounts)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalPrizes)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.totalNet)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.fall)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.final)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.balance)}</TableCell>
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

export default PorZonaTab;
