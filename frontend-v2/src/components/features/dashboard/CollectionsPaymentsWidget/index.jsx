import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Box,
  Divider
} from '@mui/material';
import { AttachMoney, Payment } from '@mui/icons-material';
import api from '../../../../services/api';

/**
 * CollectionsPaymentsWidget
 * Material-UI widget for creating collections (cobros) and payments (pagos)
 * Based on Vue.js app analysis - Dashboard widget implementation
 */
const CollectionsPaymentsWidget = () => {
  // State
  const [type, setType] = useState('collection'); // 'collection' | 'payment'
  const [bettingPoolCode, setBettingPoolCode] = useState('');
  const [bankId, setBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [bettingPools, setBettingPools] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadBettingPools();
    loadBanks();
  }, []);

  const loadBettingPools = async () => {
    try {
      const response = await api.get('/betting-pools', {
        params: { pageSize: 1000 }
      });

      const pools = response.items || response || [];
      setBettingPools(pools);
    } catch (err) {
      console.error('Error loading betting pools:', err);
      setError('Error al cargar las bancas');
    }
  };

  const loadBanks = async () => {
    try {
      // TODO: Verify exact endpoint from original app
      const response = await api.get('/banks');
      const banksList = response.items || response || [];
      setBanks(banksList);
    } catch (err) {
      console.error('Error loading banks:', err);
      // Don't show error if banks endpoint doesn't exist yet
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!bettingPoolCode || !amount) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Verify exact endpoint from original app
      const endpoint = type === 'collection' ? '/collections' : '/payments';

      await api.post(endpoint, {
        bettingPoolCode,
        bankId: bankId || null,
        amount: parseFloat(amount)
      });

      setSuccess(`${type === 'collection' ? 'Cobro' : 'Pago'} creado exitosamente`);

      // Reset form
      setBettingPoolCode('');
      setBankId('');
      setAmount('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err.response?.data?.message || 'Error al crear la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setType(newType);
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom align="center">
          Cobros & pagos
        </Typography>

        {/* Type selector */}
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={handleTypeChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton
            value="collection"
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#51cbce',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#45b0b3'
                }
              }
            }}
          >
            <AttachMoney sx={{ mr: 0.5 }} />
            COBRO
          </ToggleButton>
          <ToggleButton
            value="payment"
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#51cbce',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#45b0b3'
                }
              }
            }}
          >
            <Payment sx={{ mr: 0.5 }} />
            PAGO
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider sx={{ mb: 2 }} />

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Código de banca */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Código de banca *</InputLabel>
            <Select
              value={bettingPoolCode}
              onChange={(e) => setBettingPoolCode(e.target.value)}
              label="Código de banca *"
              required
            >
              <MenuItem value="">
                <em>Seleccione</em>
              </MenuItem>
              {bettingPools.map((pool) => (
                <MenuItem
                  key={pool.bettingPoolId || pool.id}
                  value={pool.bettingPoolCode || pool.code}
                >
                  {pool.bettingPoolCode || pool.code} - {pool.bettingPoolName || pool.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Banco */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Banco</InputLabel>
            <Select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              label="Banco"
            >
              <MenuItem value="">
                <em>Seleccione</em>
              </MenuItem>
              {banks.map((bank) => (
                <MenuItem key={bank.bankId || bank.id} value={bank.bankId || bank.id}>
                  {bank.bankName || bank.name}
                </MenuItem>
              ))}
            </Select>
            {banks.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                No hay bancos disponibles
              </Typography>
            )}
          </FormControl>

          {/* Monto */}
          <TextField
            fullWidth
            size="small"
            label="Monto *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            inputProps={{
              step: '0.01',
              min: '0'
            }}
            required
            sx={{ mb: 2 }}
          />

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#51cbce',
              '&:hover': {
                backgroundColor: '#45b0b3'
              }
            }}
          >
            {loading ? 'Creando...' : 'Crear'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CollectionsPaymentsWidget;
