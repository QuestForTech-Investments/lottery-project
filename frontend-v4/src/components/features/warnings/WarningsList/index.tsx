import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { getTodayDate } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  getWarnings,
  WARNING_TYPE_LABELS,
  WARNING_GROUPS,
  type Warning,
  type WarningSeverity,
} from '@services/warningService';

const SEVERITY_COLORS: Record<WarningSeverity, { bg: string; text: string }> = {
  high: { bg: '#ffebee', text: '#c62828' },
  medium: { bg: '#fff3e0', text: '#e65100' },
  low: { bg: '#e3f2fd', text: '#1565c0' },
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const WarningsList: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<string>(getTodayDate());
  const [filter, setFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const groupNames = useMemo(() => Object.keys(WARNING_GROUPS), []);
  const activeGroup = groupNames[activeTab];
  const showTicketColumns = activeGroup === 'Tickets';

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

  const groupedWarnings = useMemo(() => {
    const groupName = groupNames[activeTab];
    const allowedTypes = WARNING_GROUPS[groupName] || [];
    return warnings.filter((w) => allowedTypes.includes(w.warningType));
  }, [warnings, activeTab, groupNames]);

  const filteredWarnings = useMemo(() => {
    if (!filter) return groupedWarnings;
    const term = filter.toLowerCase();
    return groupedWarnings.filter(
      (w) =>
        (w.message || '').toLowerCase().includes(term) ||
        (w.bettingPoolName || '').toLowerCase().includes(term) ||
        (w.bettingPoolCode || '').toLowerCase().includes(term) ||
        (w.username || '').toLowerCase().includes(term) ||
        WARNING_TYPE_LABELS[w.warningType].toLowerCase().includes(term)
    );
  }, [groupedWarnings, filter]);

  const tabCount = (group: string): number => {
    const allowedTypes = WARNING_GROUPS[group] || [];
    return warnings.filter((w) => allowedTypes.includes(w.warningType)).length;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: '#2c2c2c', mb: 3, fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}
          >
            Advertencias
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label="Fecha"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Filtrar"
              placeholder="Banca, usuario, mensaje..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 280 }}
            />
            {loading && <CircularProgress size={24} sx={{ color: '#51cbce' }} />}
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
              '& .MuiTab-root': { fontFamily: 'Montserrat, sans-serif', textTransform: 'none' },
              '& .Mui-selected': { color: '#51cbce' },
            }}
            TabIndicatorProps={{ style: { backgroundColor: '#51cbce' } }}
          >
            {groupNames.map((g) => (
              <Tab
                key={g}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {g}
                    <Chip
                      label={tabCount(g)}
                      size="small"
                      sx={{
                        bgcolor: tabCount(g) > 0 ? '#d32f2f' : '#e0e0e0',
                        color: tabCount(g) > 0 ? 'white' : '#666',
                        fontWeight: 'bold',
                        height: 20,
                        minWidth: 24,
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                {showTicketColumns && <TableCell sx={{ fontWeight: 'bold' }}>Banca</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                {showTicketColumns && <TableCell sx={{ fontWeight: 'bold' }}>Ticket</TableCell>}
                {showTicketColumns && <TableCell sx={{ fontWeight: 'bold' }} align="right">Monto</TableCell>}
                {showTicketColumns && <TableCell sx={{ fontWeight: 'bold' }} align="right">Premio</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>Mensaje</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWarnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showTicketColumns ? 8 : 4} align="center" sx={{ py: 4, color: '#888' }}>
                    {loading ? 'Cargando...' : 'No hay advertencias para este día'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredWarnings.map((w) => {
                  const colors = SEVERITY_COLORS[w.severity] || SEVERITY_COLORS.medium;
                  return (
                    <TableRow key={w.warningId} hover>
                      <TableCell>
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
                      </TableCell>
                      {showTicketColumns && (
                        <TableCell>
                          {w.bettingPoolCode || w.bettingPoolName || '-'}
                        </TableCell>
                      )}
                      <TableCell>{w.username || '-'}</TableCell>
                      {showTicketColumns && (
                        <TableCell>
                          {w.ticketId ? (
                            <MuiLink
                              component="button"
                              onClick={() => handleTicketClick(w)}
                              sx={{
                                color: '#51cbce',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: 500,
                                background: 'none',
                                border: 'none',
                                p: 0,
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                '&:hover': { color: '#45b8bb' },
                              }}
                            >
                              {w.ticketCode || `#${w.ticketId}`}
                            </MuiLink>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      )}
                      {showTicketColumns && (
                        <TableCell align="right">
                          {w.ticketAmount != null ? formatCurrency(w.ticketAmount) : '-'}
                        </TableCell>
                      )}
                      {showTicketColumns && (
                        <TableCell align="right">
                          {w.ticketPrize != null && w.ticketPrize > 0
                            ? formatCurrency(w.ticketPrize)
                            : '-'}
                        </TableCell>
                      )}
                      <TableCell>{w.message || '-'}</TableCell>
                      <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default WarningsList;
