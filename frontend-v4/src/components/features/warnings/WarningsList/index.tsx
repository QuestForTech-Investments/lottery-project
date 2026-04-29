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

const WarningsList: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<string>(getTodayDate());
  const [filter, setFilter] = useState<string>('');
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  const ticketWarnings = useMemo(() => {
    const allowed = WARNING_GROUPS['Tickets'] || [];
    return warnings.filter((w) => allowed.includes(w.warningType) && matchesFilter(w));
  }, [warnings, filter]);

  const resultWarnings = useMemo(() => {
    const allowed = WARNING_GROUPS['Resultados'] || [];
    return warnings.filter((w) => allowed.includes(w.warningType) && matchesFilter(w));
  }, [warnings, filter]);

  const totalTickets = warnings.filter((w) =>
    (WARNING_GROUPS['Tickets'] || []).includes(w.warningType)
  ).length;
  const totalResults = warnings.filter((w) =>
    (WARNING_GROUPS['Resultados'] || []).includes(w.warningType)
  ).length;

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

          {/* Tickets table */}
          <SectionHeader title="Tickets" count={totalTickets} />
          <Table size="small" sx={{ mb: 4 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Banca</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ticket</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Monto</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Premio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mensaje</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ticketWarnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#888' }}>
                    {loading ? 'Cargando...' : 'No hay advertencias de tickets'}
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

          {/* Resultados table */}
          <SectionHeader title="Resultados" count={totalResults} />
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mensaje</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultWarnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#888' }}>
                    {loading ? 'Cargando...' : 'No hay advertencias de resultados'}
                  </TableCell>
                </TableRow>
              ) : (
                resultWarnings.map((w) => (
                  <TableRow key={w.warningId} hover>
                    <TableCell>{renderChip(w)}</TableCell>
                    <TableCell>{w.username || '-'}</TableCell>
                    <TableCell>{w.message || '-'}</TableCell>
                    <TableCell>{formatDateTime(w.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default WarningsList;
