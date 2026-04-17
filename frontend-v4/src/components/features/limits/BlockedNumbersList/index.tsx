import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Snackbar, Alert, Chip, FormControlLabel, Switch, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { getBlockedNumbers, deleteBlockedNumber, type BlockedNumber } from '@/services/blockedNumbersService';

const ACCENT = '#6366f1';

// Format digits-only bet number back to display form (e.g. "1010" + "Palé" -> "10-10")
const formatBetNumberDisplay = (pattern: string, gameTypeName?: string | null): string => {
  if (!pattern) return '';
  const digits = pattern.replace(/\D/g, '');
  const gt = (gameTypeName || '').toLowerCase();
  if ((/pal[eé]/.test(gt) || /super/.test(gt)) && digits.length === 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  if (/tripleta/.test(gt) && digits.length === 6) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  }
  return digits || pattern;
};

const BlockedNumbersList: React.FC = () => {
  const [data, setData] = useState<BlockedNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: number; number?: string }>({ open: false });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getBlockedNumbers(includeExpired);
      setData(rows);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [includeExpired]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteBlockedNumber(deleteDialog.id);
      setSnackbar({ open: true, message: 'Número desbloqueado', severity: 'success' });
      setDeleteDialog({ open: false });
      load();
    } catch {
      setSnackbar({ open: true, message: 'Error al desbloquear', severity: 'error' });
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h5" align="center" sx={{ mb: 3, color: '#2c2c2c', fontFamily: 'Montserrat, sans-serif' }}>
        Números Bloqueados
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={includeExpired}
                onChange={(e) => setIncludeExpired(e.target.checked)}
                size="small"
                sx={{ '& .Mui-checked': { color: ACCENT } }}
              />
            }
            label="Incluir expirados"
          />
          <IconButton onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        ) : data.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay números bloqueados
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Sorteo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo de jugada</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Número</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha expiración</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Creado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(row => (
                  <TableRow key={row.blockedNumberId} hover>
                    <TableCell>{row.drawName || '—'}</TableCell>
                    <TableCell>{row.gameTypeName || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatBetNumberDisplay(row.betNumber, row.gameTypeName)}
                        size="small"
                        sx={{ bgcolor: ACCENT, color: 'white', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(row.expirationDate)}</TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell align="center">
                      {row.isExpired ? (
                        <Chip label="Expirado" size="small" sx={{ bgcolor: '#999', color: 'white' }} />
                      ) : (
                        <Chip label="Activo" size="small" sx={{ bgcolor: '#2e7d32', color: 'white' }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        sx={{ color: '#ef8157' }}
                        onClick={() => setDeleteDialog({ open: true, id: row.blockedNumberId, number: row.betNumber })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Desbloquear número</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea desbloquear el número <strong>{deleteDialog.number}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancelar</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#ef8157' }}>
            Desbloquear
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BlockedNumbersList;
