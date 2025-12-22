import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '@services/api';

interface PrizeCategoryDto {
  betTypeId: number;
  betTypeName: string;
  betTypeCode: string | null;
  lineCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalNet: number;
  profitPercentage: number;
}

interface PrizeCategoryResponse {
  date: string;
  drawId: number | null;
  drawName: string | null;
  categories: PrizeCategoryDto[];
  summary: {
    totalSold: number;
    totalPrizes: number;
    totalCommissions: number;
    totalNet: number;
  };
  totalCount: number;
}

interface CategoriaPremiosPaleTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

// Filter for Pale-related bet types
const PALE_BET_TYPE_CODES = ['PALE', 'PLE', 'PALE_RD', 'PALE_USA'];

const CategoriaPremiosPaleTab = ({ selectedDate, setSelectedDate }: CategoriaPremiosPaleTabProps): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PrizeCategoryDto[]>([]);
  const [summary, setSummary] = useState({ totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<PrizeCategoryResponse>(
        `/reports/sales/prize-categories?date=${selectedDate}`
      );
      // Filter only Pale-related bet types
      const paleCategories = (response.categories || []).filter(c =>
        c.betTypeName.toLowerCase().includes('pale') ||
        (c.betTypeCode && PALE_BET_TYPE_CODES.includes(c.betTypeCode.toUpperCase()))
      );
      setData(paleCategories);

      // Recalculate summary for filtered data
      const filteredSummary = paleCategories.reduce((acc, c) => ({
        totalSold: acc.totalSold + c.totalSold,
        totalPrizes: acc.totalPrizes + c.totalPrizes,
        totalCommissions: acc.totalCommissions,
        totalNet: acc.totalNet + c.totalNet
      }), { totalSold: 0, totalPrizes: 0, totalCommissions: 0, totalNet: 0 });

      setSummary(filteredSummary);
    } catch (error) {
      console.error('Error loading pale categories:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(d =>
      d.betTypeName.toLowerCase().includes(term) ||
      (d.betTypeCode && d.betTypeCode.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const formatCurrency = (value: number): string => {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totals = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      lineCount: acc.lineCount + row.lineCount,
      winnerCount: acc.winnerCount + row.winnerCount,
      totalSold: acc.totalSold + row.totalSold,
      totalPrizes: acc.totalPrizes + row.totalPrizes,
      totalNet: acc.totalNet + row.totalNet
    }), {
      lineCount: 0, winnerCount: 0, totalSold: 0, totalPrizes: 0, totalNet: 0
    });
  }, [filteredData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Total Pale: {formatCurrency(summary.totalSold)}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Este reporte muestra únicamente las categorías de premios para apuestas tipo Pale.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
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
            {loading ? <CircularProgress size={16} color="inherit" /> : 'Ver reporte'}
          </Button>
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
                <TableCell>Tipo de Pale</TableCell>
                <TableCell>Código</TableCell>
                <TableCell align="center">Líneas</TableCell>
                <TableCell align="center">Ganadores</TableCell>
                <TableCell align="right">Total Vendido</TableCell>
                <TableCell align="right">Total Premios</TableCell>
                <TableCell align="right">Neto</TableCell>
                <TableCell align="right">% Ganancia</TableCell>
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
                  {filteredData.map((row) => (
                    <TableRow key={row.betTypeId} hover>
                      <TableCell>{row.betTypeName}</TableCell>
                      <TableCell>{row.betTypeCode || '-'}</TableCell>
                      <TableCell align="center">{row.lineCount}</TableCell>
                      <TableCell align="center">{row.winnerCount}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalSold)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalPrizes)}</TableCell>
                      <TableCell align="right" sx={{ color: row.totalNet < 0 ? 'error.main' : 'inherit' }}>
                        {formatCurrency(row.totalNet)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: row.profitPercentage < 0 ? 'error.main' : 'success.main' }}>
                        {row.profitPercentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: 'grey.200' }}>
                    <TableCell colSpan={2}><strong>Totales</strong></TableCell>
                    <TableCell align="center"><strong>{totals.lineCount}</strong></TableCell>
                    <TableCell align="center"><strong>{totals.winnerCount}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.totalSold)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.totalPrizes)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(totals.totalNet)}</strong></TableCell>
                    <TableCell align="right">
                      <strong>
                        {totals.totalSold > 0
                          ? `${((totals.totalNet / totals.totalSold) * 100).toFixed(2)}%`
                          : '0%'}
                      </strong>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Mostrando {filteredData.length} de {data.length} entradas de tipo Pale
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CategoriaPremiosPaleTab;
