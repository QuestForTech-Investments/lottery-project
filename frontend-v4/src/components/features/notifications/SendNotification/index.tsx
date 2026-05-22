import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import api from '@services/api';
import { MultiSelectSearch } from '@/components/common';

interface ZonaRaw {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}
interface BancaRaw {
  bettingPoolId?: number;
  id?: number;
  bettingPoolCode?: string;
  bettingPoolName?: string;
  name?: string;
  code?: string;
}
interface AdminRaw {
  userId: number;
  username: string;
  fullName?: string;
}

type Audience = 'banca' | 'admin';
type NotificationKind = 'mark_as_read' | 'expiration_date';
type Priority = 'low' | 'medium' | 'high';

const MAX_MESSAGE = 200;
const PRIMARY = '#51cbce';
const PRIMARY_HOVER = '#45b8bb';

const SendNotification = (): React.ReactElement => {
  const { t } = useTranslation();
  const [bancasList, setBancasList] = useState<{ id: number; label: string }[]>([]);
  const [zonasList, setZonasList] = useState<{ id: number; label: string }[]>([]);
  const [adminsList, setAdminsList] = useState<{ id: number; label: string }[]>([]);
  const [selectedBancas, setSelectedBancas] = useState<number[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);

  // Audience is now a set — both bancas and admins can be selected at once.
  const [audience, setAudience] = useState<Audience[]>(['banca']);
  const [kind, setKind] = useState<NotificationKind>('mark_as_read');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [message, setMessage] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load bancas + zones + admin users once on mount.
  useEffect(() => {
    (async () => {
      try {
        const [bancasResp, zonesResp, adminsResp] = await Promise.all([
          api.get('/betting-pools?pageSize=1000') as Promise<{ items?: BancaRaw[] } | BancaRaw[]>,
          api.get('/zones?pageSize=1000') as Promise<{ items?: ZonaRaw[] } | ZonaRaw[]>,
          // /users returns administrators (POS users excluded by default).
          api.get('/users?pageSize=1000') as Promise<{ items?: AdminRaw[] } | AdminRaw[]>,
        ]);
        const bancasArr = (bancasResp && typeof bancasResp === 'object' && 'items' in bancasResp)
          ? (bancasResp.items || [])
          : (bancasResp as BancaRaw[] || []);
        const zonesArr = (zonesResp && typeof zonesResp === 'object' && 'items' in zonesResp)
          ? (zonesResp.items || [])
          : (zonesResp as ZonaRaw[] || []);
        const adminsArr = (adminsResp && typeof adminsResp === 'object' && 'items' in adminsResp)
          ? (adminsResp.items || [])
          : (adminsResp as AdminRaw[] || []);

        setBancasList(bancasArr.map((b) => ({
          id: b.bettingPoolId || b.id || 0,
          label: `${b.bettingPoolCode || b.code || ''}${b.bettingPoolName || b.name ? ` — ${b.bettingPoolName || b.name}` : ''}`.trim(),
        })));
        setZonasList(zonesArr.map((z) => ({
          id: z.zoneId || z.id || 0,
          label: z.zoneName || z.name || '',
        })));
        setAdminsList(adminsArr.map((u) => ({
          id: u.userId,
          label: u.username.toUpperCase(),
        })));
      } catch (err) {
        console.error('Error loading notification recipients:', err);
      }
    })();
  }, []);

  const toBanca = audience.includes('banca');
  const toAdmin = audience.includes('admin');

  const charsLeft = MAX_MESSAGE - message.length;

  // Validation — derived so the button enables/disables live without state.
  const validationError = useMemo(() => {
    if (!message.trim()) return t('notificationsAdmin.validation.writeMessage');
    if (audience.length === 0) return t('notificationsAdmin.validation.selectAudience');
    if (toBanca && selectedBancas.length === 0 && selectedZones.length === 0) {
      return t('notificationsAdmin.validation.selectBancaOrZone');
    }
    if (toAdmin && selectedAdmins.length === 0) {
      return t('notificationsAdmin.validation.selectAdmin');
    }
    if (kind === 'expiration_date' && !expiresAt) {
      return t('notificationsAdmin.validation.selectExpiration');
    }
    return null;
  }, [message, audience.length, toBanca, toAdmin, selectedBancas.length, selectedZones.length, selectedAdmins.length, kind, expiresAt, t]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMessage(e.target.value.slice(0, MAX_MESSAGE));
  };

  const handleSubmit = useCallback(async () => {
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // Backend endpoint stub — wire to /api/notifications once the table exists.
      await api.post('/notifications', {
        audience,
        bancaIds: toBanca ? selectedBancas : [],
        zoneIds: toBanca ? selectedZones : [],
        adminUserIds: toAdmin ? selectedAdmins : [],
        priority,
        notificationType: kind,
        expiresAt: kind === 'expiration_date' ? expiresAt : null,
        message: message.trim(),
      });
      setSuccess(t('notificationsAdmin.sent'));
      // Reset form (keep audience + recipient picks so the user can send a follow-up).
      setMessage('');
      setExpiresAt('');
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(t('notificationsAdmin.errorSend'));
    } finally {
      setSubmitting(false);
    }
  }, [validationError, audience, selectedBancas, selectedZones, selectedAdmins, toBanca, toAdmin, priority, kind, expiresAt, message, t]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 400, mb: 3 }}>
          {t('notificationsAdmin.title')}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <MultiSelectSearch
              label={t('common.bettingPools')}
              selectAllLabel={t('notificationsAdmin.allFemPlural')}
              options={bancasList}
              selectedIds={selectedBancas}
              onChange={setSelectedBancas}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MultiSelectSearch
              label={t('common.zones')}
              selectAllLabel={t('notificationsAdmin.allFemPlural')}
              options={zonasList}
              selectedIds={selectedZones}
              onChange={setSelectedZones}
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            {t('notificationsAdmin.sendTo')}
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={audience}
            onChange={(_, v: Audience[]) => {
              // Lock at least one option selected (silently ignore the click that would empty it).
              if (v.length === 0) return;
              setAudience(v);
            }}
          >
            <ToggleButton value="banca" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{t('common.bettingPools')}</ToggleButton>
            <ToggleButton value="admin" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{t('notificationsAdmin.audienceGroupAdmins')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {toAdmin && (
          <Box sx={{ mb: 2 }}>
            <MultiSelectSearch
              label={t('notificationsAdmin.admins')}
              selectAllLabel={t('notificationsAdmin.allMascPlural')}
              options={adminsList}
              selectedIds={selectedAdmins}
              onChange={setSelectedAdmins}
            />
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            {t('notificationsAdmin.kindLabel')}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={kind}
              onChange={(_, v: NotificationKind | null) => v && setKind(v)}
            >
              <ToggleButton value="mark_as_read" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{t('notificationsAdmin.markAsRead')}</ToggleButton>
              <ToggleButton value="expiration_date" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{t('notificationsAdmin.withExpiration')}</ToggleButton>
            </ToggleButtonGroup>

            {/* Only relevant when the second mode is picked. */}
            {kind === 'expiration_date' && (
              <TextField
                type="date"
                size="small"
                label={t('notificationsAdmin.expires')}
                InputLabelProps={{ shrink: true }}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            )}
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            {t('notificationsAdmin.priorityLabel')}
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={priority}
            onChange={(_, v: Priority | null) => v && setPriority(v)}
          >
            <ToggleButton value="low" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{t('notificationsAdmin.priorityLow')}</ToggleButton>
            <ToggleButton value="medium" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{t('notificationsAdmin.priorityMedium')}</ToggleButton>
            <ToggleButton value="high" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>{t('notificationsAdmin.priorityHigh')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            {t('notificationsAdmin.message')}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            value={message}
            onChange={handleMessageChange}
            placeholder={t('notificationsAdmin.messagePlaceholder')}
            inputProps={{ maxLength: MAX_MESSAGE }}
          />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: charsLeft < 20 ? 'warning.main' : 'text.secondary', mt: 0.5 }}>
            {t('notificationsAdmin.charsLeft', { total: charsLeft })}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !!validationError}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send />}
            sx={{
              backgroundColor: PRIMARY,
              '&:hover': { backgroundColor: PRIMARY_HOVER },
              textTransform: 'uppercase',
              fontWeight: 600,
              px: 5,
              py: 1.25,
            }}
          >
            {t('notificationsAdmin.createNotification')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SendNotification;
