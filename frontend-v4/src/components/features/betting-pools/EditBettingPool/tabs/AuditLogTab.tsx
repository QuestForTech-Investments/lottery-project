import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  getBettingPoolAuditLog,
  type BettingPoolAuditLogEntry,
} from '@services/bettingPoolAuditService';

interface AuditLogTabProps {
  bettingPoolId: number;
}

const ACTION_COLOR: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  CREATED: 'success',
  UPDATED: 'info',
  BULK_UPDATED: 'warning',
  DELETED: 'error',
};

/**
 * Locale tag for `toLocaleString` based on the active i18n language. Falls back
 * to the regional Spanish format the rest of the app uses.
 */
const localeTag = (lang: string | undefined): string => {
  switch ((lang ?? 'es').split('-')[0]) {
    case 'en':
      return 'en-US';
    case 'fr':
      return 'fr-FR';
    case 'ht':
      return 'ht-HT';
    case 'es':
    default:
      return 'es-DO';
  }
};

/**
 * Per-banca change history. Read-only — every entry corresponds to an UPDATE
 * (and eventually CREATE / DELETE) performed by a specific user. Sensitive
 * fields like passwords show "(cambió)" without surfacing the values.
 */
const AuditLogTab: React.FC<AuditLogTabProps> = ({ bettingPoolId }) => {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<BettingPoolAuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Audit field labels are looked up under `editBettingPool.audit.fields.*` —
  // the field key from the backend (e.g. "config.cancelMinutes") is dotted, so
  // i18next walks the nested object naturally. Falls back to the raw key.
  const fieldLabel = (field: string): string =>
    t(`editBettingPool.audit.fields.${field}`, { defaultValue: field });

  // EF serializes booleans as "True"/"False" — translate so the table reads
  // naturally in whichever locale is active.
  const formatValue = (value: string | null): string => {
    if (value === null || value === undefined || value === '') {
      return t('editBettingPool.audit.emptyValue', { defaultValue: '—' });
    }
    if (value === 'True') return t('editBettingPool.audit.yes', { defaultValue: 'Sí' });
    if (value === 'False') return t('editBettingPool.audit.no', { defaultValue: 'No' });
    return value;
  };

  const formatTimestamp = (iso: string): string => {
    try {
      return new Date(iso).toLocaleString(localeTag(i18n.language), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBettingPoolAuditLog(bettingPoolId);
      setEntries(data);
    } catch (err) {
      console.error('Error loading audit log:', err);
      setError(
        t('editBettingPool.audit.loadError', {
          defaultValue: 'Error al cargar el historial de cambios.',
        }),
      );
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [bettingPoolId, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('editBettingPool.audit.title', { defaultValue: 'Historial de cambios' })}
        </Typography>
        <Tooltip title={t('common.refresh', { defaultValue: 'Refrescar' })}>
          <span>
            <IconButton onClick={load} disabled={loading} color="primary">
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : entries.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: '#888', py: 5, fontSize: '14px' }}>
          {t('editBettingPool.audit.empty', {
            defaultValue: 'Aún no hay cambios registrados para esta banca.',
          })}
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  {t('common.date', { defaultValue: 'Fecha' })}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {t('editBettingPool.audit.action', { defaultValue: 'Acción' })}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {t('editBettingPool.audit.user', { defaultValue: 'Usuario' })}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {t('editBettingPool.audit.changes', { defaultValue: 'Cambios' })}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.auditLogId} hover>
                  <TableCell sx={{ fontSize: '13px', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {formatTimestamp(entry.createdAt)}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Chip
                      label={t(`editBettingPool.audit.actions.${entry.action}`, {
                        defaultValue: entry.action,
                      })}
                      size="small"
                      color={ACTION_COLOR[entry.action] ?? 'default'}
                      sx={{ fontSize: '11px', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px', verticalAlign: 'top' }}>
                    {entry.userName ?? '—'}
                    {entry.ipAddress && (
                      <Box component="span" sx={{ display: 'block', color: '#999', fontSize: '11px' }}>
                        {entry.ipAddress}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: '13px' }}>
                    {entry.changes.length === 0 ? (
                      <Box component="span" sx={{ color: '#999', fontStyle: 'italic' }}>—</Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {entry.changes.map((c, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                            <Box component="span" sx={{ fontWeight: 600, minWidth: 110 }}>
                              {fieldLabel(c.field)}:
                            </Box>
                            {c.field === 'password' ? (
                              <Box component="span" sx={{ color: '#6d28d9', fontStyle: 'italic' }}>
                                {t('editBettingPool.audit.passwordChanged', { defaultValue: '(cambió)' })}
                              </Box>
                            ) : (
                              <>
                                <Box
                                  component="span"
                                  sx={{
                                    textDecoration: 'line-through',
                                    color: '#888',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                  }}
                                >
                                  {formatValue(c.oldValue)}
                                </Box>
                                <Box component="span" sx={{ color: '#888' }}>→</Box>
                                <Box
                                  component="span"
                                  sx={{
                                    color: '#047857',
                                    fontWeight: 600,
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                  }}
                                >
                                  {formatValue(c.newValue)}
                                </Box>
                              </>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AuditLogTab;
