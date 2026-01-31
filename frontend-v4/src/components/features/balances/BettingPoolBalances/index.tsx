import React, { useState, useCallback, useMemo, type SyntheticEvent, type ChangeEvent } from 'react';
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
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

import BalanceTable from '../common/BalanceTable';
import DateFilter from '../common/DateFilter';
import QuickFilter from '../common/QuickFilter';

interface BettingPoolData {
  id: number;
  numero: number;
  nombre: string;
  usuarios: string;
  referencia: string;
  zona: string;
  balance: number;
  prestamos: number;
}

interface Zone {
  id: number;
  name: string;
}

interface ColumnDefinition {
  key: string;
  label: string;
  sortable?: boolean;
  format?: string;
  align?: 'left' | 'center' | 'right';
}

type BalanceType = 'all' | 'positive' | 'negative';

// Mock data for development
const MOCK_DATA: BettingPoolData[] = [
  { id: 1, numero: 1, nombre: 'LA CENTRAL 01', usuarios: '001', referencia: 'GILBERTO ISLA GORDA TL', zona: 'GRUPO GILBERTO TL', balance: 112.66, prestamos: 0.00 },
  { id: 2, numero: 10, nombre: 'LA CENTRAL 10', usuarios: '010', referencia: 'GILBERTO TL', zona: 'GRUPO GILBERTO TL', balance: 447.61, prestamos: 0.00 },
  { id: 3, numero: 16, nombre: 'LA CENTRAL 16', usuarios: '016', referencia: 'CHINO TL', zona: 'GRUPO KENDRICK TL', balance: 1476.36, prestamos: 0.00 },
  { id: 4, numero: 63, nombre: 'LA CENTRAL 63', usuarios: '063', referencia: 'NELL TL', zona: 'GRUPO KENDRICK TL', balance: 744.92, prestamos: 0.00 },
  { id: 5, numero: 101, nombre: 'LA CENTRAL 101', usuarios: '101', referencia: 'FELO TL', zona: 'GRUPO KENDRICK TL', balance: 1052.00, prestamos: 0.00 },
  { id: 6, numero: 119, nombre: 'LA CENTRAL 119', usuarios: '119', referencia: 'EUDDY (GF)', zona: 'GRUPO GUYANA (DANI)', balance: 0.00, prestamos: 0.00 },
  { id: 7, numero: 135, nombre: 'LA CENTRAL 135', usuarios: '135', referencia: 'MORENA D (GF)', zona: 'GRUPO GUYANA (DANI)', balance: 498.40, prestamos: 0.00 },
  { id: 8, numero: 150, nombre: 'LA CENTRAL 150', usuarios: '150', referencia: 'DANNY (GF)', zona: 'GRUPO GUYANA (DANI)', balance: 141.23, prestamos: 0.00 },
  { id: 9, numero: 186, nombre: 'CARIBBEAN 186', usuarios: '186', referencia: 'BOB BALATA GF)', zona: 'GRUPO GUYANA (OMAR)', balance: -595.06, prestamos: 100.00 },
  { id: 10, numero: 198, nombre: 'CARIBBEAN 198', usuarios: '198', referencia: 'LISSET (GF)', zona: 'GRUPO GUYANA (OMAR)', balance: 700.86, prestamos: 0.00 },
];

const MOCK_ZONES: Zone[] = [
  { id: 1, name: 'GRUPO GILBERTO TL' },
  { id: 2, name: 'GRUPO KENDRICK TL' },
  { id: 3, name: 'GRUPO GUYANA (DANI)' },
  { id: 4, name: 'GRUPO GUYANA (OMAR)' },
];

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
  // State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedZones, setSelectedZones] = useState<Zone[]>(MOCK_ZONES);
  const [balanceType, setBalanceType] = useState<BalanceType>('all');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [data] = useState<BettingPoolData[]>(MOCK_DATA);

  // Handlers
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleZonesChange = useCallback((_event: SyntheticEvent, newValue: Zone[]) => {
    setSelectedZones(newValue);
  }, []);

  const handleBalanceTypeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setBalanceType(event.target.value as BalanceType);
  }, []);

  const handleQuickFilterChange = useCallback((value: string) => {
    setQuickFilter(value);
  }, []);

  const handleRefresh = useCallback(() => {
    // TODO: Call API
  }, [selectedDate, selectedZones, balanceType]);

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
    if (selectedZones.length > 0 && selectedZones.length < MOCK_ZONES.length) {
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
  }, [data, selectedZones, balanceType, quickFilter]);

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
                options={MOCK_ZONES}
                value={selectedZones}
                onChange={handleZonesChange}
                getOptionLabel={(option) => option.name}
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

        {/* Data Table */}
        <BalanceTable
          columns={COLUMNS}
          data={filteredData as unknown as Array<Record<string, unknown> & { id?: number | string }>}
          totals={totals}
        />
      </Paper>
    </Box>
  );
};

export default React.memo(BettingPoolBalances);
