import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import DateFilter from '../../balances/common/DateFilter';
import QuickFilter from '../../balances/common/QuickFilter';
import CreateCobroPagoModal from './CreateCobroPagoModal';
import TransactionGroupDetailModal from '../../transactions/TransactionGroupsList/TransactionGroupDetailModal';
import api from '@services/api';
import { getTodayDate } from '@/utils/formatters';
import { useTableSort } from '@/utils/useTableSort';

// Raw shape returned by /transaction-groups.
interface TransactionGroupDto {
  groupId: number;
  groupNumber: string;
  zoneId: number | null;
  zoneName: string | null;
  notes: string | null;
  isAutomatic: boolean;
  status: string;
  createdAt: string;
  createdByName: string | null;
  entities: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

// Row shape rendered in the table — splits createdAt into fecha + hora.
interface TransactionRow {
  groupId: number;
  numero: string;
  fecha: string;
  hora: string;
  createdAt: string; // raw ISO for sorting
  creadoPor: string;
  notas: string;
  status: string;
}

const statusChipColor = (status: string): { bg: string; color: string } => {
  switch (status) {
    case 'Aprobado': return { bg: '#e8f5e9', color: '#2e7d32' };
    case 'Pendiente': return { bg: '#fff3e0', color: '#e65100' };
    case 'Rechazado':
    case 'Eliminado': return { bg: '#ffebee', color: '#c62828' };
    default: return { bg: '#e3f2fd', color: '#1565c0' };
  }
};

const CollectionsPaymentsList = (): React.ReactElement => {
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [detailGroupId, setDetailGroupId] = useState<number | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The API uses tzOffset in minutes — local browser offset keeps date
      // boundaries aligned with the user's timezone.
      const tzOffset = new Date().getTimezoneOffset() * -1;
      const data = await api.get(
        `/transaction-groups?startDate=${startDate}&endDate=${endDate}&tzOffset=${tzOffset}`,
      ) as TransactionGroupDto[];

      const rows: TransactionRow[] = (data || []).map((g) => {
        const created = new Date(g.createdAt);
        return {
          groupId: g.groupId,
          numero: g.groupNumber,
          fecha: created.toLocaleDateString('es-ES'),
          hora: created.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          createdAt: g.createdAt,
          creadoPor: g.createdByName ?? '-',
          notas: g.notes ?? '',
          status: g.status ?? '',
        };
      });
      setTransactions(rows);
    } catch (err) {
      const e = err as Error;
      console.error('Error loading transaction groups:', err);
      setError(e.message || 'Error al cargar cobros y pagos');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Auto-load on mount.
  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleCreate = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  // Filter by quick-filter against any column.
  const filteredData = useMemo(() => {
    if (!quickFilter) return transactions;
    const search = quickFilter.toLowerCase();
    return transactions.filter((item) =>
      item.numero.toLowerCase().includes(search) ||
      item.fecha.toLowerCase().includes(search) ||
      item.hora.toLowerCase().includes(search) ||
      item.creadoPor.toLowerCase().includes(search) ||
      item.notas.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search),
    );
  }, [transactions, quickFilter]);

  // Sort the filtered rows. "Fecha" sorts by raw timestamp.
  const { sortedData, getSortProps } = useTableSort<TransactionRow, string>(
    filteredData,
    (row, key) => {
      if (key === 'fecha') return row.createdAt;
      return (row as unknown as Record<string, string | number>)[key];
    },
    { sortBy: 'createdAt', sortOrder: 'desc' },
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 400, mb: 3 }}>
          Cobros y pagos
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
          <DateFilter value={startDate} onChange={setStartDate} label="Fecha inicial" />
          <DateFilter value={endDate} onChange={setEndDate} label="Fecha final" />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleFilter}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              backgroundColor: '#51cbce',
              '&:hover': { backgroundColor: '#45b8bb' },
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Filtrar
          </Button>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <QuickFilter value={quickFilter} onChange={setQuickFilter} placeholder="Filtrado rápido" />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#e3e3e3' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>
                  <TableSortLabel {...getSortProps('numero')}>Número</TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>
                  <TableSortLabel {...getSortProps('fecha')}>Fecha</TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>
                  <TableSortLabel {...getSortProps('hora')}>Hora</TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>
                  <TableSortLabel {...getSortProps('creadoPor')}>Creado por</TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>
                  <TableSortLabel {...getSortProps('status')}>Estado</TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontSize: '13px', fontWeight: 600, py: 1.5 }}>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 4 }}>
                    <Alert severity="info" sx={{ bgcolor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' }}>
                      No hay entradas disponibles
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => {
                  const chip = statusChipColor(row.status);
                  return (
                    <TableRow key={row.groupId} hover>
                      <TableCell sx={{ fontSize: '13px' }}>
                        <Typography
                          component="span"
                          onClick={() => setDetailGroupId(row.groupId)}
                          sx={{
                            fontFamily: 'monospace',
                            color: '#1976d2',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: 'inherit',
                          }}
                        >
                          {row.numero}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{row.fecha}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{row.hora}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{row.creadoPor.toUpperCase()}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        <Chip
                          label={row.status || '-'}
                          size="small"
                          sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{row.notas}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
            Mostrando {sortedData.length} de {transactions.length} entradas
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleCreate}
            sx={{
              backgroundColor: '#51cbce',
              '&:hover': { backgroundColor: '#45b8bb' },
              textTransform: 'uppercase',
              fontWeight: 600,
              px: 5,
              py: 1.25,
              minWidth: '120px',
            }}
          >
            Crear
          </Button>
        </Box>
      </Paper>

      <CreateCobroPagoModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          loadTransactions();
        }}
      />

      <TransactionGroupDetailModal
        open={detailGroupId !== null}
        groupId={detailGroupId}
        onClose={() => setDetailGroupId(null)}
        // Refresh the list after a delete from inside the detail modal.
        onDeleted={loadTransactions}
      />
    </Box>
  );
};

export default CollectionsPaymentsList;
