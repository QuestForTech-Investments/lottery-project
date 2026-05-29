import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  getEmailReceivers,
  deleteEmailReceiver,
  EMAIL_NOTIFICATION_TYPES,
  type EmailReceiver,
} from '@services/emailReceiverService';
import PreviewDialog from '../PreviewDialog';

type SortKey = 'emailReceiverId' | 'name' | 'email' | 'notificationType' | 'isActive' | null;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// Single source of truth for the human-readable label of every notification
// type. Add new types here as the backend grows.
const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  [EMAIL_NOTIFICATION_TYPES.MONITOREO_JUGADAS]: 'Monitoreo de Jugadas',
};

const labelForType = (type: string): string =>
  NOTIFICATION_TYPE_LABELS[type] ?? type;

/**
 * EmailReceiversList — admin CRUD for the recipients of automated emails.
 *
 * Data flows through the real `/api/email-receivers` endpoint; deletes are
 * soft (sets is_active=false) so the configured recipient can be restored
 * later without re-entering the zone list.
 */
const EmailReceiversList = (): React.ReactElement => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [receivers, setReceivers] = useState<EmailReceiver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<EmailReceiver | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  // null = preview across all zones; otherwise preview using the receiver's zones.
  const [previewReceiver, setPreviewReceiver] = useState<EmailReceiver | null>(null);

  const openPreview = (receiver: EmailReceiver | null) => {
    setPreviewReceiver(receiver);
    setPreviewOpen(true);
  };

  const loadReceivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmailReceivers();
      setReceivers(data);
    } catch (err) {
      console.error('Error loading email receivers:', err);
      setError(t('emailReceiversAdmin.list.loadError', { defaultValue: 'Error al cargar los receptores.' }));
      setReceivers([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadReceivers();
  }, [loadReceivers]);

  const handleSort = (key: SortKey): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedReceivers = useMemo(() => {
    let filtered = [...receivers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        labelForType(r.notificationType).toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortConfig.direction === 'asc' ? av - bv : bv - av;
        }
        if (typeof av === 'boolean' && typeof bv === 'boolean') {
          return sortConfig.direction === 'asc'
            ? (av === bv ? 0 : av ? -1 : 1)
            : (av === bv ? 0 : av ? 1 : -1);
        }
        const as = String(av ?? '').toLowerCase();
        const bs = String(bv ?? '').toLowerCase();
        if (as < bs) return sortConfig.direction === 'asc' ? -1 : 1;
        if (as > bs) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [receivers, searchTerm, sortConfig]);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteEmailReceiver(toDelete.emailReceiverId);
      setToDelete(null);
      await loadReceivers();
    } catch (err) {
      console.error('Error deleting email receiver:', err);
      setError(t('emailReceiversAdmin.list.deleteError', { defaultValue: 'Error al eliminar el receptor.' }));
    } finally {
      setDeleting(false);
    }
  };

  // Compact arrow indicator used in the sortable column headers.
  const sortIndicator = (key: SortKey): string =>
    sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 1400, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 4 } }}>
          {/* Header: title + create button */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            mb: { xs: 2, sm: 3 },
          }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#2c2c2c',
                fontSize: { xs: '1.1rem', sm: '1.5rem' },
              }}
            >
              {t('emailReceiversAdmin.list.title')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('common.refresh', { defaultValue: 'Refrescar' })}>
                <span>
                  <IconButton onClick={loadReceivers} disabled={loading} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Button
                onClick={() => openPreview(null)}
                variant="outlined"
                startIcon={<VisibilityIcon />}
                sx={{
                  color: '#8b5cf6',
                  borderColor: '#c4b5fd',
                  '&:hover': { borderColor: '#8b5cf6', bgcolor: '#f5f3ff' },
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('emailReceiversAdmin.preview.button', { defaultValue: 'Vista previa' })}
              </Button>
              <Button
                component={RouterLink}
                to="/receivers/new"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' },
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('emailReceiversAdmin.list.newReceiver', { defaultValue: 'Nuevo receptor' })}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Quick filter */}
          <Box sx={{ mb: 3, maxWidth: { xs: '100%', sm: 400 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('common.filterQuick')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' },
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell
                    onClick={() => handleSort('emailReceiverId')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                  >
                    #{sortIndicator('emailReceiverId')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('name')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                  >
                    {t('common.name')}{sortIndicator('name')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('email')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                  >
                    {t('emailReceiversAdmin.fields.email')}{sortIndicator('email')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('notificationType')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                  >
                    {t('emailReceiversAdmin.fields.notificationType')}{sortIndicator('notificationType')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('emailReceiversAdmin.fields.zones', { defaultValue: 'Zonas' })}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('isActive')}
                    align="center"
                    sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                  >
                    {t('common.status')}{sortIndicator('isActive')}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {t('common.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedReceivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#999', fontSize: '14px' }}>
                      {t('emailReceiversAdmin.list.noResults', { defaultValue: 'No hay receptores configurados.' })}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedReceivers.map((receiver) => (
                    <TableRow key={receiver.emailReceiverId} hover>
                      <TableCell sx={{ fontSize: '14px' }}>{receiver.emailReceiverId}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{receiver.name}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{receiver.email}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{labelForType(receiver.notificationType)}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {receiver.zones.length === 0 ? (
                          <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                            {t('emailReceiversAdmin.list.noZones', { defaultValue: 'Sin zonas' })}
                          </Typography>
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {receiver.zones.slice(0, 3).map((z) => (
                              <Chip
                                key={z.zoneId}
                                label={z.zoneName}
                                size="small"
                                sx={{ fontSize: '11px', height: 22 }}
                              />
                            ))}
                            {receiver.zones.length > 3 && (
                              <Tooltip title={receiver.zones.slice(3).map(z => z.zoneName).join(', ')} arrow>
                                <Chip
                                  label={`+${receiver.zones.length - 3}`}
                                  size="small"
                                  sx={{ fontSize: '11px', height: 22, bgcolor: '#e0e0e0' }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={receiver.isActive ? t('common.active') : t('common.inactive')}
                          color={receiver.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ fontSize: '12px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openPreview(receiver)}
                          sx={{ color: '#8b5cf6', mr: 0.5 }}
                          title={t('emailReceiversAdmin.preview.button', { defaultValue: 'Vista previa' })}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          component={RouterLink}
                          to={`/receivers/edit/${receiver.emailReceiverId}`}
                          sx={{ color: '#007bff', mr: 0.5 }}
                          title={t('common.edit')}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setToDelete(receiver)}
                          sx={{ color: '#dc3545' }}
                          title={t('common.delete')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer count */}
          <Box sx={{ mt: 2, fontSize: '14px', color: '#666' }}>
            {t('common.showingEntries', { shown: filteredAndSortedReceivers.length, total: receivers.length })}
          </Box>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={toDelete !== null} onClose={() => !deleting && setToDelete(null)}>
        <DialogTitle>
          {t('emailReceiversAdmin.list.deleteTitle', { defaultValue: 'Eliminar receptor' })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('emailReceiversAdmin.list.deleteConfirm', {
              defaultValue: '¿Seguro que quieres eliminar este receptor? Dejará de recibir correos automáticos.',
            })}
            {toDelete && (
              <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 600, color: '#2c2c2c' }}>
                {toDelete.name} ({toDelete.email})
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email preview */}
      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        receiver={previewReceiver}
      />
    </Box>
  );
};

export default EmailReceiversList;
