import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Box
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { AttachMoney, HelpOutline } from '@mui/icons-material';
import api from '../../../../services/api';

interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  bettingPoolCode?: string;
  code?: string;
  bettingPoolName?: string;
  name?: string;
}

interface Bank {
  bankId?: number;
  id?: number;
  bankName?: string;
  name?: string;
}

type TransactionType = 'collection' | 'payment';

/**
 * CollectionsPaymentsWidget
 * Material-UI widget for creating collections (cobros) and payments (pagos)
 * Based on Vue.js app analysis - Dashboard widget implementation
 * Replicated to match exact styling from original app
 */
const CollectionsPaymentsWidget = (): React.ReactElement => {
  // State
  const [type, setType] = useState<TransactionType>('collection');
  const [bettingPoolCode, setBettingPoolCode] = useState<string>('');
  const [bankId, setBankId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadBettingPools();
    loadBanks();
  }, []);

  const loadBettingPools = async (): Promise<void> => {
    try {
      const response = await api.get<{ items?: BettingPool[] } | BettingPool[]>('/betting-pools?pageSize=1000');
      const pools = (response && typeof response === 'object' && 'items' in response)
        ? (response.items || [])
        : (response || []);
      setBettingPools(pools as BettingPool[]);
    } catch (err) {
      console.error('Error loading betting pools:', err);
      setError('Error al cargar las bancas');
    }
  };

  const loadBanks = async (): Promise<void> => {
    try {
      const response = await api.get<{ items?: Bank[] } | Bank[]>('/banks');
      const banksList = (response && typeof response === 'object' && 'items' in response)
        ? (response.items || [])
        : (response || []);
      setBanks(banksList as Bank[]);
    } catch (err) {
      console.error('Error loading banks:', err);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
    } catch (err: unknown) {
      console.error('Error creating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la transacción';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = useCallback((newType: TransactionType): void => {
    setType(newType);
    setError(null);
    setSuccess(null);
  }, []);

  return (
    <Card>
      <CardContent>
        {/* Title - matching original style */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            color: '#999',
            fontSize: '14px',
            fontWeight: 400,
            mb: 2
          }}
        >
          Cobros & pagos
        </Typography>

        {/* Type selector - matching original style */}
        <ButtonGroup fullWidth sx={{ mb: 2 }}>
          <Button
            onClick={() => handleTypeChange('collection')}
            startIcon={<AttachMoney />}
            sx={{
              background: type === 'collection' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e8e6f5',
              borderColor: type === 'collection' ? '#667eea !important' : '#b8b3d9 !important',
              color: type === 'collection' ? '#fff' : '#667eea',
              border: '1px solid',
              borderRadius: '4px 0 0 4px !important',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              '&:hover': {
                background: type === 'collection' ? 'linear-gradient(135deg, #5568d3 0%, #63418b 100%)' : '#d4d0ed',
                borderColor: type === 'collection' ? '#667eea !important' : '#b8b3d9 !important'
              }
            }}
          >
            COBRO
          </Button>
          <Button
            onClick={() => handleTypeChange('payment')}
            startIcon={<HelpOutline />}
            sx={{
              background: type === 'payment' ? 'linear-gradient(135deg, #c31432 0%, #240b36 100%)' : '#f5e6e8',
              borderColor: type === 'payment' ? '#c31432 !important' : '#d9b3b8 !important',
              color: type === 'payment' ? '#fff' : '#c31432',
              border: '1px solid',
              borderLeft: 'none !important',
              borderRadius: '0 4px 4px 0 !important',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              '&:hover': {
                background: type === 'payment' ? 'linear-gradient(135deg, #a01028 0%, #1a0826 100%)' : '#edd4d8',
                borderColor: type === 'payment' ? '#c31432 !important' : '#d9b3b8 !important',
                borderLeft: 'none !important'
              }
            }}
          >
            PAGO
          </Button>
        </ButtonGroup>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Código de banca - Horizontal layout */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#888',
                minWidth: '110px',
                mr: 2
              }}
            >
              Código de banca
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={bettingPoolCode}
                onChange={(e) => setBettingPoolCode(e.target.value)}
                required
                displayEmpty
                sx={{
                  fontSize: '13px',
                  color: '#666',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ddd'
                  }
                }}
              >
                <MenuItem value="">
                  <em>Seleccione</em>
                </MenuItem>
                {bettingPools.map((pool) => (
                  <MenuItem
                    key={pool.bettingPoolId || pool.id}
                    value={pool.bettingPoolCode || pool.code}
                    sx={{ fontSize: '13px' }}
                  >
                    {pool.bettingPoolCode || pool.code} - {pool.bettingPoolName || pool.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Banco - Horizontal layout */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#888',
                minWidth: '110px',
                mr: 2
              }}
            >
              Banco
            </Typography>
            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth size="small">
                <Select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  displayEmpty
                  sx={{
                    fontSize: '13px',
                    color: '#666',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ddd'
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Seleccione</em>
                  </MenuItem>
                  {banks.map((bank) => (
                    <MenuItem
                      key={bank.bankId || bank.id}
                      value={bank.bankId || bank.id}
                      sx={{ fontSize: '13px' }}
                    >
                      {bank.bankName || bank.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {banks.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  No hay bancos disponibles
                </Typography>
              )}
            </Box>
          </Box>

          {/* Monto - Horizontal layout */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#888',
                minWidth: '110px',
                mr: 2
              }}
            >
              Monto
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              inputProps={{
                step: '0.01',
                min: '0'
              }}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '13px',
                  color: '#666',
                  '& fieldset': {
                    borderColor: '#ddd'
                  }
                }
              }}
            />
          </Box>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Success message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, fontSize: '12px' }}>
              {success}
            </Alert>
          )}

          {/* Submit button - matching original pill shape */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              type="submit"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '10px 40px',
                borderRadius: '25px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                minWidth: '150px',
                border: 'none',
                boxShadow: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63418b 100%)',
                  boxShadow: 'none'
                },
                '&:disabled': {
                  backgroundColor: '#ddd',
                  color: '#999'
                }
              }}
            >
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CollectionsPaymentsWidget;
