import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Link as MuiLink,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { getTodayDate, getActiveLocale } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  getWarnings,
  WARNING_TYPE_LABELS,
  type Warning,
  type WarningType,
  type WarningSeverity,
} from '@services/warningService';
import {
  getMyNotifications,
  markNotificationsRead,
  deleteMyNotification,
  type NotificationItem,
} from '@services/notificationService';

const TICKET_TYPES: WarningType[] = [
  'TICKET_CREATED_LATE',
  'TICKET_CANCELLED_LATE',
  'TICKET_CANCELLED_AFTER_DRAW',
  'TICKET_WINNER_CANCELLED',
  'TICKET_BYPASS_VALIDATION',
];

const SEVERITY_COLORS: Record<WarningSeverity, { bg: string; text: string }> = {
  high: { bg: '#ffebee', text: '#c62828' },
  medium: { bg: '#fff3e0', text: '#e65100' },
  low: { bg: '#e3f2fd', text: '#1565c0' },
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString(getActiveLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Typography
      variant="h6"
      sx={{ color: '#2c2c2c', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}
    >
      {title}
    </Typography>
    <Chip
      label={count}
      size="small"
      sx={{
        bgcolor: count > 0 ? '#d32f2f' : '#e0e0e0',
        color: count > 0 ? 'white' : '#666',
        fontWeight: 'bold',
        height: 22,
        minWidth: 28,
      }}
    />
  </Box>
);

const renderChip = (w: Warning) => {
  const colors = SEVERITY_COLORS[w.severity] || SEVERITY_COLORS.medium;
  return (
    <Chip
      label={WARNING_TYPE_LABELS[w.warningType] || w.warningType}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.text,
        fontWeight: 500,
        fontSize: '11px',
      }}
    />
  );
};

interface ResultChangeMeta {
  drawName?: string;
  previousNumber?: string;
  newNumber?: string;
  previousAdditionalNumber?: string;
  newAdditionalNumber?: string;
}

const parseResultChangeMeta = (metadataJson?: string | null): ResultChangeMeta => {
  if (!metadataJson) return {};
  try {
    return JSON.parse(metadataJson) as ResultChangeMeta;
  } catch {
    return {};
  }
};

/** Split the main winning number into 2-digit positions (Quiniela 1ra/2da/3ra style). */
const splitWinning = (s?: string): string[] => {
  if (!s) return [];
  const trimmed = s.trim();
  if (/[,\-\s]/.test(trimmed)) {
    return trimmed.split(/[,\-\s]+/).map((n) => n.trim()).filter(Boolean);
  }
  if (/^\d+$/.test(trimmed) && trimmed.length % 2 === 0 && trimmed.length > 2) {
    const out: string[] = [];
    for (let i = 0; i < trimmed.length; i += 2) out.push(trimmed.slice(i, i + 2));
    return out;
  }
  return [trimmed];
};

/**
 * Split the additional number for US-style draws by widths.
 *  - 12 digits → cash3 (3) + play4 (4) + pick5 (5)
 *  - 7 digits  → cash3 (3) + play4 (4)
 *  - 5 digits  → pick5
 *  - 4 digits  → play4
 *  - 3 digits  → cash3
 *  - else      → keep as one number
 */
const splitAdditional = (s?: string): string[] => {
  if (!s) return [];
  const trimmed = s.trim();
  if (/[,\-\s]/.test(trimmed)) {
    return trimmed.split(/[,\-\s]+/).map((n) => n.trim()).filter(Boolean);
  }
  if (/^\d+$/.test(trimmed)) {
    switch (trimmed.length) {
      case 12:
        return [trimmed.slice(0, 3), trimmed.slice(3, 7), trimmed.slice(7)];
      case 7:
        return [trimmed.slice(0, 3), trimmed.slice(3)];
      case 5:
      case 4:
      case 3:
        return [trimmed];
      default:
        break;
    }
  }
  return [trimmed];
};

const buildPositions = (
  winning?: string,
  additional?: string
): string[] => [...splitWinning(winning), ...splitAdditional(additional)];

const renderResultDiff = (meta: ResultChangeMeta) => {
  const prev = buildPositions(meta.previousNumber, meta.previousAdditionalNumber);
  const next = buildPositions(meta.newNumber, meta.newAdditionalNumber);
  const len = Math.max(prev.length, next.length);
  if (len === 0) return <span style={{ color: '#888' }}>-</span>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, fontFamily: 'monospace' }}>
      {Array.from({ length: len }).map((_, i) => {
        const a = prev[i] ?? '—';
        const b = next[i] ?? '—';
        const changed = a !== b;
        return (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '13px',
              color: changed ? '#c62828' : '#2c2c2c',
              fontWeight: changed ? 600 : 400,
            }}
          >
            <Box component="span" sx={{ minWidth: 44, textAlign: 'right' }}>{a}</Box>
            <Box component="span" sx={{ color: changed ? '#c62828' : '#888' }}>→</Box>
            <Box component="span" sx={{ minWidth: 44 }}>{b}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

const PRIORITY_STYLE: Record<NotificationItem['priority'], { bg: string; text: string }> = {
  high:   { bg: '#ffebee', text: '#c62828' },
  medium: { bg: '#fff3e0', text: '#e65100' },
  low:    { bg: '#e3f2fd', text: '#1565c0' },
};

const WarningsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = useState<string>(getTodayDate());
  const [filter, setFilter] = useState<string>('');
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);

  // Historial de resultado no publicado — last N days, configurable.
  const [historyDays, setHistoryDays] = useState<number>(7);
  const [historyWarnings, setHistoryWarnings] = useState<Warning[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const handleTicketClick = (w: Warning) => {
    if (!w.ticketId) return;
    const params = new URLSearchParams();
    params.set('ticketId', String(w.ticketId));
    if (w.bettingPoolId) params.set('bettingPoolId', String(w.bettingPoolId));
    if (w.ticketCreatedAt) {
      const d = new Date(w.ticketCreatedAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      params.set('date', `${yyyy}-${mm}-${dd}`);
    }
    navigate(`/tickets/monitoring?${params.toString()}`);
  };

  const loadWarnings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWarnings(date);
      setWarnings(data);
    } catch (err) {
      console.error('Error loading warnings:', err);
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadWarnings();
  }, [loadWarnings]);

  // Load the current user's notifications once on mount.
  const loadNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const items = await getMyNotifications();
      setNotifications(items);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // When the user opens the Notificaciones tab, mark everything as read so the
  // bell badge updates immediately on the next poll.
  useEffect(() => {
    if (activeTab !== 1) return;
    const unread = notifications.filter((n) => !n.isRead).map((n) => n.notificationId);
    if (unread.length === 0) return;
    markNotificationsRead(unread)
      .then(() => {
        setNotifications((prev) => prev.map((n) =>
          unread.includes(n.notificationId) ? { ...n, isRead: true } : n,
        ));
      })
      .catch((err) => console.error('Error marking notifications read:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const totalNotifications = notifications.length;
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  // Range query for the unpublished-results history.
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const days = Math.max(1, Math.min(365, Math.floor(Number(historyDays) || 7)));
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - (days - 1));
      const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      };
      const data = await getWarnings(undefined, 'RESULT_PUBLICATION_LATE', {
        startDate: fmt(start),
        endDate: fmt(end),
      });
      setHistoryWarnings(data);
    } catch (err) {
      console.error('Error loading unpublished-results history:', err);
      setHistoryWarnings([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [historyDays]);

  // Fetch when the user opens the Historial tab or changes the days filter.
  useEffect(() => {
    if (activeTab !== 3) return;
    loadHistory();
  }, [activeTab, loadHistory]);

  // Keep the history count fresh for the tab badge so we don't have to open the
  // tab first to see the number.
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optimistic delete — drop the row locally first, restore if the request fails.
  const handleDeleteNotification = useCallback(async (notificationId: number) => {
    const snapshot = notifications;
    setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId));
    try {
      await deleteMyNotification(notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setNotifications(snapshot);
    }
  }, [notifications]);

  const matchesFilter = (w: Warning): boolean => {
    if (!filter) return true;
    const term = filter.toLowerCase();
    return (
      (w.message || '').toLowerCase().includes(term) ||
      (w.bettingPoolName || '').toLowerCase().includes(term) ||
      (w.bettingPoolCode || '').toLowerCase().includes(term) ||
      (w.username || '').toLowerCase().includes(term) ||
      WARNING_TYPE_LABELS[w.warningType].toLowerCase().includes(term)
    );
  };

  const ticketWarnings = useMemo(
    () => warnings.filter((w) => TICKET_TYPES.includes(w.warningType) && matchesFilter(w)),
    [warnings, filter]
  );

  const resultChangeWarnings = useMemo(
    () =>
      warnings.filter(
        (w) => w.warningType === 'RESULT_CHANGED_AFTER_PRIZES' && matchesFilter(w)
      ),
    [warnings, filter]
  );

  const resultLateWarnings = useMemo(
    () =>
      warnings.filter((w) => w.warningType === 'RESULT_PUBLICATION_LATE' && matchesFilter(w)),
    [warnings, filter]
  );

  const totalTickets = warnings.filter((w) => TICKET_TYPES.includes(w.warningType)).length;
  const totalResultChanges = warnings.filter(
    (w) => w.warningType === 'RESULT_CHANGED_AFTER_PRIZES'
  ).length;
  const totalLateResults = warnings.filter(
    (w) => w.warningType === 'RESULT_PUBLICATION_LATE'
  ).length;

  const tabBadge = (count: number) => (
    <Chip
      label={count}
      size="small"
      sx={{
        ml: 1,
        bgcolor: count > 0 ? '#d32f2f' : '#e0e0e0',
        color: count > 0 ? 'white' : '#666',
        fontWeight: 'bold',
        height: 20,
        minWidth: 24,
      }}
    />
  );

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              color: '#2c2c2c',
              mb: 3,
              fontWeight: 500,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {t('warningsAdmin.title')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label={t('common.date')}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t('common.filter')}
              placeholder={t('warningsAdmin.filterPlaceholder')}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 280 }}
            />
            {loading && <CircularProgress size={24} sx={{ color: '#6366f1' }} />}
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 3,
              '& .MuiTab-root': { fontFamily: 'Montserrat, sans-serif', textTransform: 'none' },
              '& .Mui-selected': { color: '#6366f1' },
            }}
            TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {t('warningsAdmin.tabs.tickets')}
                  {tabBadge(totalTickets + totalResultChanges)}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {t('warningsAdmin.tabs.notifications')}
                  {tabBadge(unreadNotifications)}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {t('warningsAdmin.tabs.unpublishedResults')}
                  {tabBadge(totalLateResults)}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {t('warningsAdmin.tabs.unpublishedHistory')}
                  {tabBadge(historyWarnings.length)}
                </Box>
              }
            />
          </Tabs>

          {activeTab === 0 && (
            <>
              {/* Tickets table */}
              <SectionHeader title={t('warningsAdmin.tabs.tickets')} count={totalTickets} />
              <Table size="small" sx={{ mb: 4 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.type')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('common.bettingPool')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('common.user')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.ticket')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('common.amount')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('common.prize')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.message')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('common.date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticketWarnings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#888' }}>
                        {loading ? t('common.loading') : t('warningsAdmin.empty.tickets')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ticketWarnings.map((w) => (
                      <TableRow key={w.warningId} hover>
                        <TableCell>{renderChip(w)}</TableCell>
                        <TableCell>{w.bettingPoolCode || w.bettingPoolName || '-'}</TableCell>
                        <TableCell>{w.username || '-'}</TableCell>
                        <TableCell>
                          {w.ticketId ? (
                            <MuiLink
                              component="button"
                              onClick={() => handleTicketClick(w)}
                              sx={{
                                color: '#6366f1',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: 500,
                                background: 'none',
                                border: 'none',
                                p: 0,
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                '&:hover': { color: '#4f46e5' },
                              }}
                            >
                              {w.ticketCode || `#${w.ticketId}`}
                            </MuiLink>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {w.ticketAmount != null ? formatCurrency(w.ticketAmount) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {w.ticketPrize != null && w.ticketPrize > 0
                            ? formatCurrency(w.ticketPrize)
                            : '-'}
                        </TableCell>
                        <TableCell>{w.message || '-'}</TableCell>
                        <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Cambio de resultados table */}
              <SectionHeader title={t('warningsAdmin.sections.resultChanges')} count={totalResultChanges} />
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('common.draw')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('common.user')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.changes')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('common.date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultChangeWarnings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#888' }}>
                        {loading ? t('common.loading') : t('warningsAdmin.empty.resultChanges')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    resultChangeWarnings.map((w) => {
                      const meta = parseResultChangeMeta(w.metadataJson);
                      return (
                        <TableRow key={w.warningId} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {meta.drawName || '-'}
                          </TableCell>
                          <TableCell>{w.username || '-'}</TableCell>
                          <TableCell>{renderResultDiff(meta)}</TableCell>
                          <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {activeTab === 2 && (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.type')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.message')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('common.date')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultLateWarnings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: '#888' }}>
                      {loading ? t('common.loading') : t('warningsAdmin.empty.unpublishedResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  resultLateWarnings.map((w) => (
                    <TableRow key={w.warningId} hover>
                      <TableCell>{renderChip(w)}</TableCell>
                      <TableCell>{w.message || '-'}</TableCell>
                      <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {activeTab === 3 && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <TextField
                  type="number"
                  label={t('warningsAdmin.lastNDays')}
                  size="small"
                  value={historyDays}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (Number.isNaN(v)) return;
                    setHistoryDays(Math.max(1, Math.min(365, v)));
                  }}
                  inputProps={{ min: 1, max: 365 }}
                  sx={{ width: 180 }}
                />
                {loadingHistory && <CircularProgress size={20} sx={{ color: '#6366f1' }} />}
              </Box>

              <SectionHeader title={t('warningsAdmin.sections.unpublishedResults')} count={historyWarnings.length} />
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.type')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.message')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('common.date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyWarnings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: '#888' }}>
                        {loadingHistory
                          ? t('common.loading')
                          : t('warningsAdmin.empty.unpublishedHistory', { total: historyDays })}
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyWarnings.map((w) => (
                      <TableRow key={w.warningId} hover>
                        <TableCell>{renderChip(w)}</TableCell>
                        <TableCell>{w.message || '-'}</TableCell>
                        <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {activeTab === 1 && (
            <>
              <SectionHeader title={t('warningsAdmin.tabs.notifications')} count={totalNotifications} />
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.priority')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.message')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.from')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.received')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('warningsAdmin.cols.expires')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: 56 }}>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#888' }}>
                        {loadingNotifs ? t('common.loading') : t('warningsAdmin.empty.notifications')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((n) => {
                      const p = PRIORITY_STYLE[n.priority] || PRIORITY_STYLE.medium;
                      const priorityLabel = t(`warningsAdmin.priority.${n.priority}`);
                      return (
                        <TableRow
                          key={n.notificationId}
                          hover
                          sx={{ backgroundColor: n.isRead ? 'transparent' : '#f0f7ff' }}
                        >
                          <TableCell>
                            <Chip
                              label={priorityLabel}
                              size="small"
                              sx={{ bgcolor: p.bg, color: p.text, fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: n.isRead ? 400 : 600 }}>
                            {n.message}
                          </TableCell>
                          <TableCell>{(n.createdByName || '-').toUpperCase()}</TableCell>
                          <TableCell>{formatDateTime(n.createdAt)}</TableCell>
                          <TableCell>{n.expiresAt ? formatDateTime(n.expiresAt) : '-'}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={t('common.delete')}>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteNotification(n.notificationId)}
                                sx={{ color: '#c62828' }}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default WarningsList;
