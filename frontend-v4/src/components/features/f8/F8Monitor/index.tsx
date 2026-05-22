import React, { useState, useCallback, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search as SearchIcon } from '@mui/icons-material';
import { getTodayDate } from '@/utils/formatters';

interface Filters {
  fecha: string;
  sorteo: string;
  jugada: string;
}

interface PlayData {
  id: number;
  banca: string;
  monto: number;
}

/**
 * F8Monitor Component (Material-UI V2)
 *
 * F8 - Monitoreo de jugadas por Banca
 * Permite filtrar jugadas por fecha, sorteo y número de jugada
 */
const F8Monitor = (): React.ReactElement => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({
    fecha: getTodayDate(),
    sorteo: '',
    jugada: ''
  });
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mockup data - 5 bancas con montos
  const [playData] = useState<PlayData[]>([
    { id: 1, banca: 'LA CENTRAL 01', monto: 150.00 },
    { id: 2, banca: 'NORTE EXPRESS', monto: 320.50 },
    { id: 3, banca: 'SUR PREMIUM', monto: 89.75 },
    { id: 4, banca: 'ESTE RAPIDO', monto: 210.00 },
    { id: 5, banca: 'OESTE GOLD', monto: 175.25 }
  ]);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>): void => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
  }, []);

  const handleRefresh = useCallback((): void => {
    alert(t('f8Admin.msgRefreshMock', {
      date: filters.fecha,
      draw: filters.sorteo || t('f8Admin.filterAll'),
      play: filters.jugada || t('f8Admin.filterAllPlays')
    }));
  }, [filters, t]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredData: PlayData[] = playData.filter(item =>
    item.banca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total: number = filteredData.reduce((sum, item) => sum + item.monto, 0);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 1200, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#2c2c2c'
            }}
          >
            {t('f8Admin.title')}
          </Typography>

          {/* Filtros */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <TextField
              label={t('f8Admin.dateLabel')}
              type="date"
              name="fecha"
              value={filters.fecha}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              size="small"
            />
            <FormControl size="small">
              <InputLabel sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                {t('f8Admin.drawsLabel')}
              </InputLabel>
              <Select
                name="sorteo"
                value={filters.sorteo}
                onChange={handleFilterChange}
                label={t('f8Admin.drawsLabel')}
                sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="">{t('f8Admin.drawsPlaceholder')}</MenuItem>
                <MenuItem value="DIARIA 11AM">DIARIA 11AM</MenuItem>
                <MenuItem value="LOTEDOM">LOTEDOM</MenuItem>
                <MenuItem value="LA PRIMERA">LA PRIMERA</MenuItem>
                <MenuItem value="TEXAS DAY">TEXAS DAY</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('f8Admin.playLabel')}
              name="jugada"
              value={filters.jugada}
              onChange={handleFilterChange}
              placeholder={t('f8Admin.playPlaceholder')}
              InputLabelProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              InputProps={{
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleRefresh}
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                color: 'white',
                textTransform: 'none',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}
            >
              {t('f8Admin.refreshButton')}
            </Button>
          </Box>

          {/* Total */}
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '20px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              mb: 3,
              color: '#2c2c2c'
            }}
          >
            {t('f8Admin.totalLabel', { total: total.toFixed(2) })}
          </Typography>

          {/* Filtro rápido */}
          <Box sx={{ mb: 3, maxWidth: 400 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('f8Admin.quickFilterPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />
          </Box>

          {/* Tabla */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    {t('f8Admin.headerBettingPools')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    {t('f8Admin.headerAmount')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 5, color: '#999', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                      {t('f8Admin.noEntries')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {item.banca}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        ${item.monto.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid #dee2e6',
              fontSize: '14px',
              color: '#666',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            {t('f8Admin.showingEntries', { shown: filteredData.length, total: playData.length })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default F8Monitor;
