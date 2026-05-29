import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  getPlayMonitoringPreview,
  getReceiverPreview,
  type EmailReceiver,
} from '@services/emailReceiverService';
import { getAllDraws } from '@services/drawService';

interface DrawOption {
  drawId: number;
  drawName: string;
}

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * When set, the preview uses the zones already configured on this receiver.
   * When null/omitted, it previews across all zones.
   */
  receiver?: EmailReceiver | null;
}

const todayIso = (): string => {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
};

/**
 * Renders the "Monitoreo de Jugadas" email exactly as it would be sent, inside
 * an iframe. The HTML comes straight from the backend builder so what the admin
 * sees here is byte-for-byte what recipients will get.
 */
const PreviewDialog: React.FC<PreviewDialogProps> = ({ open, onClose, receiver }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [date, setDate] = useState<string>(todayIso());
  // 0 = "todos los sorteos" (browse the whole day); a real email is one draw.
  const [drawId, setDrawId] = useState<number>(0);
  const [draws, setDraws] = useState<DrawOption[]>([]);
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load the list of draws once for the selector.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllDraws({ loadAll: true, isActive: true });
        const list = ('data' in res ? res.data : res.items) ?? [];
        if (!cancelled) {
          setDraws(list.map((d) => ({ drawId: d.drawId, drawName: d.drawName })));
        }
      } catch (err) {
        console.error('Error loading draws for preview:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const draw = drawId > 0 ? drawId : undefined;
      const result = receiver
        ? await getReceiverPreview(receiver.emailReceiverId, date, draw)
        : await getPlayMonitoringPreview(date, [], draw);
      setHtml(result);
    } catch (err) {
      console.error('Error loading email preview:', err);
      setError(
        t('emailReceiversAdmin.preview.error', {
          defaultValue: 'No se pudo generar la vista previa.',
        }),
      );
      setHtml('');
    } finally {
      setLoading(false);
    }
  }, [receiver, date, drawId, t]);

  // Reload whenever the dialog opens or the inputs change.
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const zoneSummary = receiver
    ? receiver.zones.length === 0
      ? t('emailReceiversAdmin.list.noZones', { defaultValue: 'Sin zonas' })
      : receiver.zones.map((z) => z.zoneName).join(', ')
    : t('emailReceiversAdmin.preview.allZones', { defaultValue: 'Todas las zonas' });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: fullScreen ? '100%' : '90vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600 }}>
            {t('emailReceiversAdmin.preview.title', { defaultValue: 'Vista previa del correo' })}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#666', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {receiver ? `${receiver.name} — ` : ''}{zoneSummary}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2 } }}>
        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <TextField
            type="date"
            size="small"
            label={t('emailReceiversAdmin.preview.date', { defaultValue: 'Fecha' })}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />
          <TextField
            select
            size="small"
            label={t('emailReceiversAdmin.preview.draw', { defaultValue: 'Sorteo' })}
            value={drawId}
            onChange={(e) => setDrawId(Number(e.target.value))}
            sx={{ minWidth: 220, flex: 1 }}
          >
            <MenuItem value={0}>
              {t('emailReceiversAdmin.preview.allDraws', { defaultValue: 'Todos (vista del día)' })}
            </MenuItem>
            {draws.map((d) => (
              <MenuItem key={d.drawId} value={d.drawId}>
                {d.drawName}
              </MenuItem>
            ))}
          </TextField>
          <Button
            onClick={load}
            startIcon={<RefreshIcon />}
            variant="outlined"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {t('common.refresh', { defaultValue: 'Refrescar' })}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}

        {/* Rendered email */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            border: '1px solid #e2e8f0',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: '#f1f5f9',
            minHeight: 300,
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.6)',
                zIndex: 1,
              }}
            >
              <CircularProgress size={32} />
            </Box>
          )}
          <iframe
            title="email-preview"
            srcDoc={html}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {t('common.close', { defaultValue: 'Cerrar' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewDialog;
