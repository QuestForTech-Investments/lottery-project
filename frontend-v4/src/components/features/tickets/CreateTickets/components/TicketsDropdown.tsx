/**
 * TicketsDropdown Component
 *
 * Self-contained dropdown that lists today's tickets for the selected betting pool.
 * Supports search, cancel (with time window), and copy (placeholder).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Popover, TextField, IconButton,
  CircularProgress, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import { Trash2, Printer, Search, ChevronDown } from 'lucide-react';
import { cancelTicket, filterTickets, type TicketResponse } from '@services/ticketService';
import { getCurrentUser } from '@services/authService';
import type { BettingPool } from '../types';

const SANTO_DOMINGO_TZ = 'America/Santo_Domingo';

interface TicketsDropdownProps {
  selectedPool: BettingPool | null;
  cancelMinutes: number;
}

/** Get today's date string in Santo Domingo timezone (YYYY-MM-DD) */
const getTodaySD = (): string => {
  const parts = new Date().toLocaleDateString('en-CA', { timeZone: SANTO_DOMINGO_TZ });
  return parts; // en-CA gives YYYY-MM-DD
};

/** Parse createdAt to a Date */
const parseCreatedAt = (iso: string): Date => new Date(iso);

/** Format time as HH:mm in Santo Domingo */
const formatTime = (iso: string): string => {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: SANTO_DOMINGO_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const TicketsDropdown: React.FC<TicketsDropdownProps> = ({ selectedPool, cancelMinutes }) => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const open = Boolean(anchorEl);

  // Tick every second for countdown timer
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [open]);

  // Fetch tickets when popover opens
  const fetchTickets = useCallback(async () => {
    if (!selectedPool) return;
    setLoading(true);
    try {
      const today = getTodaySD();
      const response = await filterTickets({
        bettingPoolId: selectedPool.bettingPoolId,
        date: today,
        pageSize: 100,
        pageNumber: 1,
      });
      const all = response.tickets || [];
      // Filter out cancelled — API already sorts newest first
      const active = all.filter(t => !t.isCancelled);
      setTickets(active);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPool?.bettingPoolId]);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    setSearchQuery('');
    setSelectedTicketId(null);
    fetchTickets();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Filtered tickets
  const filtered = tickets.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticketCode?.toLowerCase().includes(q) ||
      String(t.grandTotal).includes(q) ||
      t.userName?.toLowerCase().includes(q)
    );
  });

  const selectedTicket = tickets.find(t => t.ticketId === selectedTicketId) || null;

  // Cancel expiry helpers
  const getRemainingMs = (ticket: TicketResponse): number => {
    const created = parseCreatedAt(ticket.createdAt).getTime();
    const expiresAt = created + cancelMinutes * 60 * 1000;
    return expiresAt - currentTime;
  };

  const isCancelExpired = (ticket: TicketResponse): boolean => {
    return getRemainingMs(ticket) <= 0;
  };

  const formatCountdown = (ticket: TicketResponse): string => {
    const remaining = getRemainingMs(ticket);
    if (remaining <= 0) return 'Expirado';
    const totalSec = Math.floor(remaining / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  // Get secondary label for a ticket
  const getSecondaryLabel = (ticket: TicketResponse): string => {
    return ticket.userName || '—';
  };

  // Cancel handler
  const handleCancelClick = () => {
    if (!selectedTicket || isCancelExpired(selectedTicket)) return;
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedTicket) return;
    setIsCancelling(true);
    try {
      const user = getCurrentUser();
      const userId = parseInt(user?.id || '1', 10);
      await cancelTicket(selectedTicket.ticketId, userId, 'Cancelado por usuario');
      setTickets(prev => prev.filter(t => t.ticketId !== selectedTicket.ticketId));
      setSelectedTicketId(null);
      setSnackbar({ open: true, message: `Ticket #${selectedTicket.ticketCode} cancelado`, severity: 'success' });
    } catch (err: unknown) {
      let msg = 'Error al cancelar el ticket';
      if (err && typeof err === 'object' && 'response' in err) {
        const apiErr = err as { response?: { data?: { code?: string; message?: string } } };
        const code = apiErr.response?.data?.code;
        if (code === 'CANCELLATION_TIME_EXPIRED') {
          msg = 'El tiempo de cancelación ha expirado';
        } else if (code === 'TICKET_ALREADY_CANCELLED') {
          msg = 'Este ticket ya fue cancelado';
        } else if (apiErr.response?.data?.message) {
          msg = apiErr.response.data.message;
        }
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  // Copy placeholder
  const handleCopy = () => {
    setSnackbar({ open: true, message: 'Pendiente de implementar', severity: 'error' });
  };

  // Button label
  const buttonLabel = selectedTicket
    ? `#${selectedTicket.ticketCode} - $${selectedTicket.grandTotal.toFixed(2)}`
    : `Tickets (${tickets.length})`;

  const canCancel = selectedTicket && !isCancelExpired(selectedTicket);

  return (
    <>
      {/* Trigger button */}
      <Box
        component="button"
        ref={anchorRef}
        onClick={handleOpen}
        disabled={!selectedPool}
        sx={{
          px: 3, py: 1.5,
          bgcolor: !selectedPool ? '#ccc' : open ? '#0288d1' : '#0097a7',
          color: 'white', border: 'none', borderRadius: '4px',
          fontSize: '13px', fontWeight: 'bold',
          cursor: !selectedPool ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 0.5,
          '&:hover': { bgcolor: !selectedPool ? '#ccc' : '#00838f' },
          whiteSpace: 'nowrap',
        }}
      >
        {buttonLabel}
        <ChevronDown size={14} />
      </Box>

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { width: 380, maxHeight: 460, display: 'flex', flexDirection: 'column' },
          },
        }}
      >
        {/* Search */}
        <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar ticket..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            slotProps={{
              input: {
                startAdornment: <Search size={16} style={{ marginRight: 6, color: '#999' }} />,
              },
            }}
          />
        </Box>

        {/* Ticket list */}
        <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 300 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : filtered.length === 0 ? (
            <Typography sx={{ p: 2, color: '#999', fontSize: '13px', textAlign: 'center' }}>
              {tickets.length === 0 ? 'No hay tickets hoy' : 'Sin resultados'}
            </Typography>
          ) : (
            filtered.map(ticket => {
              const isSelected = ticket.ticketId === selectedTicketId;
              return (
                <Box
                  key={ticket.ticketId}
                  onClick={() => setSelectedTicketId(isSelected ? null : ticket.ticketId)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.8,
                    cursor: 'pointer',
                    bgcolor: isSelected ? '#e3f2fd' : 'transparent',
                    borderBottom: '1px solid #f5f5f5',
                    '&:hover': { bgcolor: isSelected ? '#bbdefb' : '#fafafa' },
                    fontSize: '13px',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold', color: '#1565c0', fontSize: '13px', minWidth: 65 }}>
                    #{ticket.ticketCode}
                  </Typography>
                  <Typography sx={{ flex: 1, fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getSecondaryLabel(ticket)}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '13px', color: '#333', minWidth: 60, textAlign: 'right' }}>
                    ${ticket.grandTotal.toFixed(2)}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#999', minWidth: 40, textAlign: 'right' }}>
                    {formatTime(ticket.createdAt)}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>

        {/* Action buttons */}
        <Box sx={{
          display: 'flex', gap: 1, p: 1,
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'center',
        }}>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Trash2 size={14} />}
            disabled={!selectedTicket || !canCancel || isCancelling}
            onClick={handleCancelClick}
            sx={{ textTransform: 'none', fontSize: '12px', minWidth: 140 }}
          >
            {isCancelling
              ? 'Cancelando...'
              : selectedTicket
                ? `Cancelar ${formatCountdown(selectedTicket)}`
                : 'Cancelar'}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Printer size={14} />}
            disabled={!selectedTicket}
            onClick={handleCopy}
            sx={{
              textTransform: 'none', fontSize: '12px',
              bgcolor: '#607d8b', '&:hover': { bgcolor: '#455a64' },
            }}
          >
            Copia
          </Button>
        </Box>
      </Popover>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelConfirm} onClose={() => setShowCancelConfirm(false)}>
        <DialogTitle>Confirmar cancelación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea cancelar el ticket <strong>#{selectedTicket?.ticketCode}</strong> por <strong>${selectedTicket?.grandTotal.toFixed(2)}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelConfirm(false)} disabled={isCancelling}>
            No
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained" disabled={isCancelling}>
            {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TicketsDropdown;
