import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as CsvIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  getTransactionGroup,
  deleteTransactionGroup,
  type TransactionGroupAPI,
  type TransactionGroupLineAPI
} from '@services/transactionGroupService';

interface Props {
  open: boolean;
  groupId: number | null;
  onClose: () => void;
  onDeleted?: () => void;
}

const formatCurrency = (val: number): string => `$${val.toFixed(2)}`;

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'PendienteAprobacion': return 'Pendiente de aprobación';
    case 'PendienteEliminacion': return 'Pendiente de eliminación';
    case 'Aprobado': return 'Aprobado';
    case 'Rechazado': return 'Rechazado';
    case 'Eliminado': return 'Eliminado';
    default: return status;
  }
};

const getStatusChipStyle = (status: string): Record<string, string> => {
  switch (status) {
    case 'PendienteAprobacion': return { bgcolor: '#fff8e1', color: '#f57f17' };
    case 'PendienteEliminacion': return { bgcolor: '#fff3e0', color: '#e65100' };
    case 'Aprobado': return { bgcolor: '#e8f5e9', color: '#2e7d32' };
    case 'Rechazado': return { bgcolor: '#ffebee', color: '#c62828' };
    case 'Eliminado': return { bgcolor: '#ffebee', color: '#c62828' };
    default: return { bgcolor: '#e0e0e0', color: '#616161' };
  }
};

const canDelete = (status?: string): boolean => {
  return status === 'Aprobado' || status === 'PendienteAprobacion';
};

const TransactionGroupDetailModal: React.FC<Props> = ({ open, groupId, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [group, setGroup] = useState<TransactionGroupAPI | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  useEffect(() => {
    if (!open || !groupId) {
      setGroup(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTransactionGroup(groupId);
        setGroup(data);
      } catch (err) {
        console.error('Error loading group detail:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, groupId]);

  const lines: TransactionGroupLineAPI[] = group?.lines ?? [];
  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);

  const handleDelete = useCallback(async () => {
    if (!groupId) return;
    setConfirmDeleteOpen(false);
    setDeleting(true);
    try {
      await deleteTransactionGroup(groupId);
      setSnackbar({ open: true, message: 'Grupo eliminado exitosamente', severity: 'success' });
      onClose();
      onDeleted?.();
    } catch (err) {
      console.error('Error deleting transaction group:', err);
      setSnackbar({ open: true, message: 'Error al eliminar el grupo', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  }, [groupId, onClose, onDeleted]);

  const exportCsv = useCallback(() => {
    if (!lines.length) return;
    const headers = ['Tipo', 'Entidad #1', 'Código entidad #1', 'Entidad #2', 'Código entidad #2', 'Saldo inicial Entidad #1', 'Saldo inicial Entidad #2', 'Débito', 'Crédito', 'Saldo final Entidad #1', 'Saldo final Entidad #2', 'Notas'];
    const rows = lines.map(l => [
      l.transactionType,
      l.entity1Name,
      l.entity1Code,
      l.entity2Name ?? '',
      l.entity2Code ?? '',
      l.entity1InitialBalance.toFixed(2),
      l.entity2InitialBalance.toFixed(2),
      l.debit.toFixed(2),
      l.credit.toFixed(2),
      l.entity1FinalBalance.toFixed(2),
      l.entity2FinalBalance.toFixed(2),
      l.notes ?? ''
    ]);
    rows.push(['', '', '', '', '', '', '', totalDebit.toFixed(2), totalCredit.toFixed(2), '', '', '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grupo-${group?.groupNumber ?? groupId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lines, totalDebit, totalCredit, group, groupId]);

  const exportPdf = useCallback(() => {
    if (!lines.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const tableRows = lines.map(l => `
      <tr>
        <td>${l.transactionType}</td>
        <td>${l.entity1Name}</td>
        <td>${l.entity1Code}</td>
        <td>${l.entity2Name ?? ''}</td>
        <td>${l.entity2Code ?? ''}</td>
        <td style="text-align:right">${formatCurrency(l.entity1InitialBalance)}</td>
        <td style="text-align:right">${formatCurrency(l.entity2InitialBalance)}</td>
        <td style="text-align:right;color:#dc3545">${formatCurrency(l.debit)}</td>
        <td style="text-align:right;color:#28a745">${formatCurrency(l.credit)}</td>
        <td style="text-align:right">${formatCurrency(l.entity1FinalBalance)}</td>
        <td style="text-align:right">${formatCurrency(l.entity2FinalBalance)}</td>
        <td>${l.notes ?? ''}</td>
      </tr>`).join('');

    printWindow.document.write(`<html><head><title>Grupo ${group?.groupNumber}</title>
      <style>body{font-family:Arial,sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:4px 6px}th{background:#f5f5f5;font-weight:600}td{font-size:11px}</style>
      </head><body>
      <h3>Grupo de transacciones: ${group?.groupNumber}</h3>
      <table>
        <thead><tr><th>Tipo</th><th>Entidad #1</th><th>Código #1</th><th>Entidad #2</th><th>Código #2</th><th>Saldo ini. #1</th><th>Saldo ini. #2</th><th>Débito</th><th>Crédito</th><th>Saldo fin. #1</th><th>Saldo fin. #2</th><th>Notas</th></tr></thead>
        <tbody>${tableRows}
          <tr style="background:#f8f9fa;font-weight:600"><td colspan="7"></td><td style="text-align:right;color:#dc3545">${formatCurrency(totalDebit)}</td><td style="text-align:right;color:#28a745">${formatCurrency(totalCredit)}</td><td colspan="3"></td></tr>
        </tbody>
      </table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, [lines, totalDebit, totalCredit, group]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {group ? `Grupo ${group.groupNumber}` : 'Detalle de grupo'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Status and approval info */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip
                  label={getStatusLabel(group?.status ?? '')}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    ...getStatusChipStyle(group?.status ?? '')
                  }}
                />
                {group?.approvedByName && (
                  <Typography variant="body2" color="text.secondary">
                    {group.status === 'Rechazado' ? 'Rechazado' : 'Aprobado'} por: <strong>{group.approvedByName}</strong>
                  </Typography>
                )}
                {group?.rejectionReason && (
                  <Typography variant="body2" color="error">
                    Razón: {group.rejectionReason}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button variant="contained" size="small" startIcon={<PdfIcon />} onClick={exportPdf}
                  sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' }, textTransform: 'none', fontWeight: 600 }}>
                  PDF
                </Button>
                <Button variant="contained" size="small" startIcon={<CsvIcon />} onClick={exportCsv}
                  sx={{ bgcolor: '#28a745', '&:hover': { bgcolor: '#218838' }, textTransform: 'none', fontWeight: 600 }}>
                  CSV
                </Button>
                <Box sx={{ flex: 1 }} />
                {canDelete(group?.status) ? (
                  <Button variant="contained" size="small" startIcon={<DeleteIcon />} onClick={() => setConfirmDeleteOpen(true)}
                    disabled={deleting}
                    sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' }, textTransform: 'none', fontWeight: 600 }}>
                    {deleting ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
                  </Button>
                ) : null}
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Entidad #1</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Código entidad #1</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Entidad #2</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Código entidad #2</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Saldo inicial de Entidad #1</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Saldo inicial de Entidad #2</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Débito</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Crédito</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Saldo final de Entidad #1</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Saldo final de Entidad #2</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                          No hay líneas en este grupo
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {lines.map((line) => (
                          <TableRow key={line.lineId} hover>
                            <TableCell>{line.transactionType}</TableCell>
                            <TableCell>{line.entity1Name}</TableCell>
                            <TableCell>{line.entity1Code}</TableCell>
                            <TableCell>{line.entity2Name ?? ''}</TableCell>
                            <TableCell>{line.entity2Code ?? ''}</TableCell>
                            <TableCell align="right">{formatCurrency(line.entity1InitialBalance)}</TableCell>
                            <TableCell align="right">{formatCurrency(line.entity2InitialBalance)}</TableCell>
                            <TableCell align="right" sx={{ color: '#dc3545', fontWeight: 500 }}>{formatCurrency(line.debit)}</TableCell>
                            <TableCell align="right" sx={{ color: '#28a745', fontWeight: 500 }}>{formatCurrency(line.credit)}</TableCell>
                            <TableCell align="right">{formatCurrency(line.entity1FinalBalance)}</TableCell>
                            <TableCell align="right">{formatCurrency(line.entity2FinalBalance)}</TableCell>
                            <TableCell>{line.notes ?? ''}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell colSpan={7} />
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#dc3545' }}>{formatCurrency(totalDebit)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: '#28a745' }}>{formatCurrency(totalCredit)}</TableCell>
                          <TableCell colSpan={3} />
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={7} />
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total débito</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total crédito</TableCell>
                          <TableCell colSpan={3} />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {group?.status === 'PendienteAprobacion'
              ? <>¿Está seguro que desea eliminar el grupo <strong>{group?.groupNumber}</strong>? Esta transacción aún no ha sido aprobada, por lo que no afectará los balances.</>
              : <>¿Está seguro que desea eliminar el grupo <strong>{group?.groupNumber}</strong>? Los balances de las entidades serán revertidos o se enviará para aprobación.</>
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TransactionGroupDetailModal;
