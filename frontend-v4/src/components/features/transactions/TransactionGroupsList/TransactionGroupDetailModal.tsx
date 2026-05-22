import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
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

const STATUS_KEYS: Record<string, string> = {
  PendienteAprobacion: 'transactions.groups.pendingApproval',
  PendienteEliminacion: 'transactions.groups.pendingDeletion',
  Aprobado: 'transactions.groups.approved',
  Rechazado: 'transactions.groups.rejected',
  Eliminado: 'transactions.groups.deleted',
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
  const { t } = useTranslation();
  const getStatusLabel = useCallback((status: string): string => {
    const key = STATUS_KEYS[status];
    return key ? t(key) : status;
  }, [t]);
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
      setSnackbar({ open: true, message: t('transactions.groups.deleteSuccess'), severity: 'success' });
      onClose();
      onDeleted?.();
    } catch (err) {
      console.error('Error deleting transaction group:', err);
      setSnackbar({ open: true, message: t('transactions.groups.deleteError'), severity: 'error' });
    } finally {
      setDeleting(false);
    }
  }, [groupId, onClose, onDeleted, t]);

  const exportCsv = useCallback(() => {
    if (!lines.length) return;
    const headers = [
      t('common.type'),
      t('transactions.entity1'),
      `${t('common.code')} ${t('transactions.entity1')}`,
      t('transactions.entity2'),
      `${t('common.code')} ${t('transactions.entity2')}`,
      t('transactions.initialBalance1'),
      t('transactions.initialBalance2'),
      t('transactions.debit'),
      t('transactions.credit'),
      t('transactions.finalBalance1'),
      t('transactions.finalBalance2'),
      t('common.notes'),
    ];
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
  }, [lines, totalDebit, totalCredit, group, groupId, t]);

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

    printWindow.document.write(`<html><head><title>${t('transactions.groups.title')} ${group?.groupNumber}</title>
      <style>body{font-family:Arial,sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:4px 6px}th{background:#f5f5f5;font-weight:600}td{font-size:11px}</style>
      </head><body>
      <h3>${t('transactions.groups.title')}: ${group?.groupNumber}</h3>
      <table>
        <thead><tr><th>${t('common.type')}</th><th>${t('transactions.entity1')}</th><th>${t('common.code')} #1</th><th>${t('transactions.entity2')}</th><th>${t('common.code')} #2</th><th>${t('transactions.initialBalance1')}</th><th>${t('transactions.initialBalance2')}</th><th>${t('transactions.debit')}</th><th>${t('transactions.credit')}</th><th>${t('transactions.finalBalance1')}</th><th>${t('transactions.finalBalance2')}</th><th>${t('common.notes')}</th></tr></thead>
        <tbody>${tableRows}
          <tr style="background:#f8f9fa;font-weight:600"><td colspan="7"></td><td style="text-align:right;color:#dc3545">${formatCurrency(totalDebit)}</td><td style="text-align:right;color:#28a745">${formatCurrency(totalCredit)}</td><td colspan="3"></td></tr>
        </tbody>
      </table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, [lines, totalDebit, totalCredit, group, t]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {group ? t('transactions.groups.groupLabel', { number: group.groupNumber }) : t('transactions.detail.title')}
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
                    {group.status === 'Rechazado' ? t('transactions.groups.rejected') : t('transactions.groups.approved')} {t('transactions.byUser')}: <strong>{group.approvedByName}</strong>
                  </Typography>
                )}
                {group?.rejectionReason && (
                  <Typography variant="body2" color="error">
                    {t('transactions.reason')}: {group.rejectionReason}
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
                    {deleting ? <CircularProgress size={20} color="inherit" /> : t('common.delete')}
                  </Button>
                ) : null}
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t('common.type')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('transactions.entity1')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('common.code')} {t('transactions.entity1')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('transactions.entity2')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('common.code')} {t('transactions.entity2')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.initialBalance1')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.initialBalance2')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.debit')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.credit')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.finalBalance1')}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.finalBalance2')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('common.notes')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                          {t('transactions.detail.noLines')}
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
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.totalDebit')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.totalCredit')}</TableCell>
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
        <DialogTitle>{t('transactions.groups.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {group?.status === 'PendienteAprobacion'
              ? <Trans
                  i18nKey="transactions.groups.confirmDeletePending"
                  values={{ number: group?.groupNumber ?? '' }}
                  components={{ b: <strong /> }}
                />
              : <Trans
                  i18nKey="transactions.groups.confirmDelete"
                  values={{ number: group?.groupNumber ?? '' }}
                  components={{ b: <strong /> }}
                />
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">{t('common.delete')}</Button>
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
