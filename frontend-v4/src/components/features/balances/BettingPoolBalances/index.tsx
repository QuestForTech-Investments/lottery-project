import React, { useState, useCallback, useMemo, useEffect, type SyntheticEvent, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

import BalanceTable from '../common/BalanceTable';
import DateFilter from '../common/DateFilter';
import QuickFilter from '../common/QuickFilter';
import {
  getBettingPoolBalances,
  extractZonesFromBalances,
  type BettingPoolBalanceData,
  type BalanceZone
} from '../../../../services/balanceService';
import { getTodayDate } from '@/utils/formatters';

interface ColumnDefinition {
  key: string;
  label: string;
  sortable?: boolean;
  format?: string;
  align?: 'left' | 'center' | 'right';
}

type BalanceType = 'all' | 'positive' | 'negative';

const COLUMNS: ColumnDefinition[] = [
  { key: 'numero', label: 'Número', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'usuarios', label: 'Usuarios', sortable: true },
  { key: 'referencia', label: 'Referencia', sortable: true },
  { key: 'zona', label: 'Zona', sortable: true },
  { key: 'balance', label: 'Balance', sortable: true, format: 'currency', align: 'right' },
  { key: 'prestamos', label: 'Préstamos', sortable: true, format: 'currency', align: 'right' },
];

const BettingPoolBalances = (): React.ReactElement => {
  // State — default to today (shows yesterday's end-of-day snapshot as starting balance)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [selectedZones, setSelectedZones] = useState<BalanceZone[]>([]);
  const [allZones, setAllZones] = useState<BalanceZone[]>([]);
  const [balanceType, setBalanceType] = useState<BalanceType>('all');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [data, setData] = useState<BettingPoolBalanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const balances = await getBettingPoolBalances(selectedDate);
      setData(balances);

      const zones = extractZonesFromBalances(balances);
      setAllZones(zones);

      // Select all zones by default on first load
      setSelectedZones(prev => prev.length === 0 ? zones : prev);
    } catch (err) {
      console.error('[ERROR] [BALANCES] Error fetching betting pool balances:', err);
      setError('Error al cargar los balances. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleZonesChange = useCallback((_event: SyntheticEvent, newValue: BalanceZone[]) => {
    setSelectedZones(newValue);
  }, []);

  const handleBalanceTypeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setBalanceType(event.target.value as BalanceType);
  }, []);

  const handleQuickFilterChange = useCallback((value: string) => {
    setQuickFilter(value);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportPdf = useCallback(() => {
    // TODO: Implement PDF export
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by zones
    if (selectedZones.length > 0 && selectedZones.length < allZones.length) {
      const zoneNames = selectedZones.map(z => z.name);
      result = result.filter(item => zoneNames.includes(item.zona));
    }

    // Filter by balance type
    if (balanceType === 'positive') {
      result = result.filter(item => item.balance > 0);
    } else if (balanceType === 'negative') {
      result = result.filter(item => item.balance < 0);
    }

    // Quick filter
    if (quickFilter) {
      const search = quickFilter.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(search)
        )
      );
    }

    return result;
  }, [data, selectedZones, allZones.length, balanceType, quickFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      balance: filteredData.reduce((sum, item) => sum + item.balance, 0),
      prestamos: filteredData.reduce((sum, item) => sum + item.prestamos, 0),
    };
  }, [filteredData]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Balances de bancas
        </Typography>

        {/* Filters Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
            {/* Date Filter */}
            <DateFilter
              value={selectedDate}
              onChange={handleDateChange}
              label="Fecha"
            />

            {/* Zones Multi-Select */}
            <Box sx={{ minWidth: 300 }}>
              <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
                Zonas
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={allZones}
                value={selectedZones}
                onChange={handleZonesChange}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Seleccione"
                  />
                )}
                renderTags={(value) => (
                  <Chip
                    key="selected-count"
                    label={`${value.length} seleccionadas`}
                    size="small"
                  />
                )}
                disableCloseOnSelect
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  }
                }}
              />
            </Box>
          </Box>

          {/* Balance Type Radio */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
              Balances a incluir
            </Typography>
            <FormControl>
              <RadioGroup
                row
                value={balanceType}
                onChange={handleBalanceTypeChange}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" />}
                  label="TODOS"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: balanceType === 'all' ? 600 : 400,
                    }
                  }}
                />
                <FormControlLabel
                  value="positive"
                  control={<Radio size="small" />}
                  label="POSITIVOS"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: balanceType === 'positive' ? 600 : 400,
                    }
                  }}
                />
                <FormControlLabel
                  value="negative"
                  control={<Radio size="small" />}
                  label="NEGATIVOS"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: balanceType === 'negative' ? 600 : 400,
                    }
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              backgroundColor: '#8b5cf6',
              '&:hover': { backgroundColor: '#3fb5b8' },
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            Refrescar
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              backgroundColor: '#8b5cf6',
              '&:hover': { backgroundColor: '#3fb5b8' },
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleExportPdf}
            sx={{
              backgroundColor: '#8b5cf6',
              '&:hover': { backgroundColor: '#3fb5b8' },
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >
            PDF
          </Button>
        </Box>

        {/* Quick Filter */}
        <Box sx={{ mb: 2 }}>
          <QuickFilter
            value={quickFilter}
            onChange={handleQuickFilterChange}
          />
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <BalanceTable
            columns={COLUMNS}
            data={filteredData as unknown as Array<Record<string, unknown> & { id?: number | string }>}
            totals={totals}
          />
        )}
      </Paper>
    </Box>
  );
};

export default React.memo(BettingPoolBalances);
