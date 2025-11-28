import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Grid,
  InputAdornment
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

/**
 * TransactionsByBettingPool
 * Route: /accountable-transactions/betting-pool
 * Original: https://la-numbers.apk.lol/#/accountable-transactions/betting-pool
 *
 * Simple view with date filters and betting pool selector.
 * After clicking "VER VENTAS", displays transactions/sales for selected pool.
 */
const TransactionsByBettingPool = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBettingPool, setSelectedBettingPool] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  // Mock betting pools for development
  const bettingPools = [
    { id: 1, codigo: 'BC001', nombre: 'LA CENTRAL 01' },
    { id: 2, codigo: 'BC002', nombre: 'LA CENTRAL 10' },
    { id: 3, codigo: 'BC003', nombre: 'LA CENTRAL 16' },
    { id: 4, codigo: 'BC004', nombre: 'CARIBBEAN 186' },
    { id: 5, codigo: 'BC005', nombre: 'CARIBBEAN 198' }
  ];

  const handleViewSales = () => {
    if (!selectedBettingPool) {
      alert('Por favor seleccione una banca');
      return;
    }

    if (!startDate || !endDate) {
      alert('Por favor seleccione las fechas');
      return;
    }

    // Mock results - in real app, this would be an API call
    const pool = bettingPools.find(p => p.id === selectedBettingPool);
    setResults({
      bettingPool: pool,
      transactions: [
        {
          id: 1,
          fecha: startDate,
          hora: '09:30:00',
          tipo: 'Venta',
          monto: 500.00,
          descripcion: 'Venta de tickets - ANGUILA 10AM'
        },
        {
          id: 2,
          fecha: startDate,
          hora: '14:15:00',
          tipo: 'Venta',
          monto: 750.00,
          descripcion: 'Venta de tickets - NEW YORK DAY'
        },
        {
          id: 3,
          fecha: startDate,
          hora: '18:45:00',
          tipo: 'Cobro',
          monto: 1200.00,
          descripcion: 'Cobro balance negativo'
        }
      ],
      totales: {
        ventas: 1250.00,
        cobros: 1200.00,
        balance: 50.00
      }
    });
    setShowResults(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters Card */}
      <Card elevation={1}>
        <CardContent sx={{ p: 5 }}>
          <Grid container spacing={3}>
            {/* Fecha inicial */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha inicial"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ color: '#999', fontSize: 18 }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiInputLabel-root': { fontSize: '14px' },
                  '& .MuiInputBase-input': { fontSize: '14px' }
                }}
              />
            </Grid>

            {/* Fecha final */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Fecha final"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ color: '#999', fontSize: 18 }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiInputLabel-root': { fontSize: '14px' },
                  '& .MuiInputBase-input': { fontSize: '14px' }
                }}
              />
            </Grid>

            {/* Banca */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '14px' }}>Banca</InputLabel>
                <Select
                  value={selectedBettingPool}
                  onChange={(e) => setSelectedBettingPool(e.target.value)}
                  label="Banca"
                  sx={{ fontSize: '14px' }}
                >
                  <MenuItem value="" sx={{ fontSize: '14px' }}>
                    <em>Seleccione una banca</em>
                  </MenuItem>
                  {bettingPools.map(pool => (
                    <MenuItem key={pool.id} value={pool.id} sx={{ fontSize: '14px' }}>
                      {pool.codigo} - {pool.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* VER VENTAS Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleViewSales}
              sx={{
                backgroundColor: '#51cbce',
                '&:hover': { backgroundColor: '#3fb5b8' },
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'uppercase',
                px: 6,
                py: 1.5,
                minWidth: '200px'
              }}
            >
              Ver Ventas
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Results Table (shown after clicking VER VENTAS) */}
      {showResults && results && (
        <Card elevation={1} sx={{ mt: 3 }}>
          <CardContent>
            {/* Header with betting pool info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500 }}>
                Transacciones - {results.bettingPool.nombre}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '14px', color: '#666' }}>
                {startDate} al {endDate}
              </Typography>
            </Box>

            {/* Transactions Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Hora</TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Descripción</TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.transactions.map((transaction, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontSize: '13px' }}>{transaction.fecha}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{transaction.hora}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.tipo}
                          size="small"
                          sx={{
                            backgroundColor: transaction.tipo === 'Venta' ? '#28a745' : '#51cbce',
                            color: 'white',
                            fontSize: '11px',
                            height: '24px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{transaction.descripcion}</TableCell>
                      <TableCell sx={{ fontSize: '13px', textAlign: 'right', fontWeight: 500 }}>
                        ${transaction.monto.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell colSpan={4} sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>
                      Totales:
                    </TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>
                      ${results.totales.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ bgcolor: '#e8f5e9', p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: '12px', color: '#666', display: 'block', mb: 0.5 }}>
                    Total Ventas
                  </Typography>
                  <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: '#28a745' }}>
                    ${results.totales.ventas.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ bgcolor: '#e1f5fe', p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: '12px', color: '#666', display: 'block', mb: 0.5 }}>
                    Total Cobros
                  </Typography>
                  <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: '#51cbce' }}>
                    ${results.totales.cobros.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ bgcolor: '#fff3e0', p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: '12px', color: '#666', display: 'block', mb: 0.5 }}>
                    Balance
                  </Typography>
                  <Typography variant="h5" sx={{ fontSize: '20px', fontWeight: 600, color: '#ff9800' }}>
                    ${results.totales.balance.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TransactionsByBettingPool;
