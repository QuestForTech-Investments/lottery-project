import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import api from '@services/api';
import { formatCurrency } from '@/utils/formatCurrency';

interface PayoutBancaDto {
  bettingPoolId: number;
  bettingPoolName: string;
  bettingPoolCode: string;
  zoneName: string | null;
  lineCount: number;
  pendingCount: number;
  loserCount: number;
  winnerCount: number;
  totalSold: number;
  totalPrizes: number;
  totalNet: number;
}

interface PayoutBancasResponse {
  multiplier: number;
  category: string;
  bancas: PayoutBancaDto[];
  totalCount: number;
}

export interface PayoutBancasDialogProps {
  open: boolean;
  onClose: () => void;
  category: 'quiniela' | 'pale';
  multiplier: number | null;
  selectedDate: string;
}

const PayoutBancasDialog = ({ open, onClose, category, multiplier, selectedDate }: PayoutBancasDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [bancas, setBancas] = useState<PayoutBancaDto[]>([]);

  // Fetch once the dialog opens for a multiplier; reset whenever it closes.
  useEffect(() => {
    if (!open || multiplier == null) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get<PayoutBancasResponse>(
          `/reports/sales/prize-categories-by-payout/bancas?category=${category}&multiplier=${multiplier}&date=${selectedDate}`,
        );
        if (cancelled) return;
        setBancas(response?.bancas || []);
      } catch (e) {
        console.error('Error loading payout bancas:', e);
        if (!cancelled) setBancas([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, multiplier, category, selectedDate]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 500 }}>
        Bancas con pago {multiplier ?? ''}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : bancas.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No hay bancas con este pago en la fecha elegida.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#e3e3e3' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Banca</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Zona</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>P</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>L</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>W</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Venta</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Premios</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Neto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bancas.map((b) => (
                  <TableRow key={b.bettingPoolId} hover>
                    <TableCell>{b.bettingPoolCode}</TableCell>
                    <TableCell>{b.bettingPoolName}</TableCell>
                    <TableCell>{b.zoneName || ''}</TableCell>
                    <TableCell align="center">{b.pendingCount}</TableCell>
                    <TableCell align="center">{b.loserCount}</TableCell>
                    <TableCell align="center">{b.winnerCount}</TableCell>
                    <TableCell align="right">{formatCurrency(b.totalSold)}</TableCell>
                    <TableCell align="right">{formatCurrency(b.totalPrizes)}</TableCell>
                    <TableCell align="right" sx={{ color: b.totalNet < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                      {formatCurrency(b.totalNet)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small" sx={{ textTransform: 'none' }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayoutBancasDialog;
