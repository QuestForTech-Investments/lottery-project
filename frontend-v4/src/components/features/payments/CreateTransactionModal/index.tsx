import { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Settings as SettingsIcon } from '@mui/icons-material';

interface Transaction {
  type: string;
  entity: string;
  debit?: string | number;
  credit?: string | number;
  initialBalance?: string | number;
  finalBalance?: string | number;
  notes?: string;
}

interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

interface Totals {
  debit: number;
  credit: number;
}

/**
 * CreateTransactionModal - Modal for creating collections/payments transactions
 * Replica of Vue.js modal: https://la-numbers.apk.lol/#/simplified-accountable-transaction-groups
 * Material-UI Dialog implementation
 */
const CreateTransactionModal = ({ open, onClose }: CreateTransactionModalProps): React.ReactElement => {
  const [type, setType] = useState<string>('');
  const [bettingPoolName, setBettingPoolName] = useState<string>('');
  const [bettingPoolCode, setBettingPoolCode] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [sourceInitialBalance] = useState<string>('0.00');
  const [sourceFinalBalance] = useState<string>('0.00');
  const [destInitialBalance] = useState<string>('0.00');
  const [destFinalBalance] = useState<string>('0.00');
  const [transactionNotes, setTransactionNotes] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [transactions] = useState<Transaction[]>([]);

  const handleSubmit = useCallback((): void => {
    console.log('Registering transaction...');
    // TODO: API call to create transaction
    onClose();
  }, [onClose]);

  const totals = useMemo((): Totals => {
    return {
      debit: transactions.reduce((sum, t) => sum + (parseFloat(String(t.debit)) || 0), 0),
      credit: transactions.reduce((sum, t) => sum + (parseFloat(String(t.credit)) || 0), 0)
    };
  }, [transactions]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '800px'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500 }}>
          Crear Transacciones
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        {/* Two columns layout */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {/* Left Column */}
          <Box sx={{ flex: 1 }}>
            {/* Type */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel sx={{ fontSize: '13px' }}>Tipo</InputLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                label="Tipo"
                sx={{ fontSize: '13px' }}
              >
                <MenuItem value="" sx={{ fontSize: '13px' }}>
                  <em>Selecione uno...</em>
                </MenuItem>
                <MenuItem value="cobro" sx={{ fontSize: '13px' }}>Cobro</MenuItem>
                <MenuItem value="pago" sx={{ fontSize: '13px' }}>Pago</MenuItem>
              </Select>
            </FormControl>

            {/* Banca section */}
            <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mt: 2, mb: 2 }}>
              BANCA
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Nombre"
              value={bettingPoolName}
              onChange={(e) => setBettingPoolName(e.target.value)}
              sx={{ mb: 2, '& .MuiInputLabel-root': { fontSize: '13px' }, '& .MuiInputBase-input': { fontSize: '13px' } }}
            />

            <TextField
              fullWidth
              size="small"
              label="Código"
              value={bettingPoolCode}
              onChange={(e) => setBettingPoolCode(e.target.value)}
              sx={{ mb: 2, '& .MuiInputLabel-root': { fontSize: '13px' }, '& .MuiInputBase-input': { fontSize: '13px' } }}
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ step: '0.01' }}
              sx={{ '& .MuiInputLabel-root': { fontSize: '13px' }, '& .MuiInputBase-input': { fontSize: '13px' } }}
            />
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: 1 }}>
            {/* Entidad fuente */}
            <Typography variant="h6" sx={{ fontSize: '13px', fontWeight: 600, mb: 1, color: '#999', textTransform: 'uppercase' }}>
              Entidad fuente
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                label="Balance inicial"
                value={sourceInitialBalance}
                disabled
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': { fontSize: '12px' },
                  '& .MuiInputBase-input': { fontSize: '13px', backgroundColor: '#f5f5f5' }
                }}
              />
              <TextField
                size="small"
                label="Balance final"
                value={sourceFinalBalance}
                disabled
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': { fontSize: '12px' },
                  '& .MuiInputBase-input': { fontSize: '13px', backgroundColor: '#f5f5f5' }
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Entidad destino */}
            <Typography variant="h6" sx={{ fontSize: '13px', fontWeight: 600, mb: 1, color: '#999', textTransform: 'uppercase' }}>
              Entidad destino
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                label="Balance inicial"
                value={destInitialBalance}
                disabled
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': { fontSize: '12px' },
                  '& .MuiInputBase-input': { fontSize: '13px', backgroundColor: '#f5f5f5' }
                }}
              />
              <TextField
                size="small"
                label="Balance final"
                value={destFinalBalance}
                disabled
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': { fontSize: '12px' },
                  '& .MuiInputBase-input': { fontSize: '13px', backgroundColor: '#f5f5f5' }
                }}
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Notas de la transacción"
              value={transactionNotes}
              onChange={(e) => setTransactionNotes(e.target.value)}
              multiline
              rows={3}
              sx={{ '& .MuiInputLabel-root': { fontSize: '13px' }, '& .MuiInputBase-input': { fontSize: '13px' } }}
            />
          </Box>
        </Box>

        {/* Transaction table */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Entidad</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Débito</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Crédito</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Balance inicial</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Balance final</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Notas</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                  <SettingsIcon sx={{ fontSize: '18px' }} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 3 }}>
                    <Alert
                      severity="info"
                      sx={{
                        bgcolor: '#d1ecf1',
                        color: '#0c5460',
                        border: '1px solid #bee5eb',
                        '& .MuiAlert-icon': {
                          color: '#0c5460'
                        }
                      }}
                    >
                      No hay información disponible
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.type}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.entity}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>${parseFloat(String(transaction.debit || 0)).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>${parseFloat(String(transaction.credit || 0)).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>${parseFloat(String(transaction.initialBalance || 0)).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>${parseFloat(String(transaction.finalBalance || 0)).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{transaction.notes}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton size="small">
                        <SettingsIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {/* Totals row */}
              <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>Totales</TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>${totals.debit.toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>${totals.credit.toFixed(2)}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* General notes */}
        <TextField
          fullWidth
          size="small"
          label="Notas"
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          multiline
          rows={3}
          sx={{ '& .MuiInputLabel-root': { fontSize: '13px' }, '& .MuiInputBase-input': { fontSize: '13px' } }}
        />
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ borderTop: '1px solid #dee2e6', p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#666',
            fontSize: '13px',
            textTransform: 'uppercase',
            px: 3
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#51cbce',
            '&:hover': { backgroundColor: '#3fb5b8' },
            fontSize: '13px',
            textTransform: 'uppercase',
            px: 3
          }}
        >
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTransactionModal;
