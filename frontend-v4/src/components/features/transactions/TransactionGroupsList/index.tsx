import React, { useState, useEffect, useMemo, useCallback, type ChangeEvent } from 'react';
import CreateTransactionGroupModal from './CreateTransactionGroupModal';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { getTransactionGroups, type TransactionGroupAPI } from '@services/transactionGroupService';

type SortDirection = 'asc' | 'desc';
type SortKey = 'groupNumber' | 'createdAt' | 'createdByName' | 'isAutomatic' | 'notes' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const TransactionGroupsList = (): React.ReactElement => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [groups, setGroups] = useState<TransactionGroupAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGroups = useCallback(async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const data = await getTransactionGroups({
        startDate: start || undefined,
        endDate: end || undefined
      });
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading transaction groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleFilter = useCallback(() => {
    loadGroups(startDate, endDate);
  }, [startDate, endDate, loadGroups]);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = groups;

    if (quickFilter) {
      const lower = quickFilter.toLowerCase();
      filtered = filtered.filter((item) =>
        item.groupNumber.toLowerCase().includes(lower) ||
        (item.createdByName && item.createdByName.toLowerCase().includes(lower)) ||
        (item.notes && item.notes.toLowerCase().includes(lower)) ||
        (item.isAutomatic ? 'sí' : 'no').includes(lower)
      );
    }

    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | boolean = '';
        let bVal: string | boolean = '';

        switch (key) {
          case 'groupNumber': aVal = a.groupNumber; bVal = b.groupNumber; break;
          case 'createdAt': aVal = a.createdAt ?? ''; bVal = b.createdAt ?? ''; break;
          case 'createdByName': aVal = a.createdByName ?? ''; bVal = b.createdByName ?? ''; break;
          case 'isAutomatic': aVal = a.isAutomatic; bVal = b.isAutomatic; break;
          case 'notes': aVal = a.notes ?? ''; bVal = b.notes ?? ''; break;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [groups, quickFilter, sortConfig]);

  const handleCreated = useCallback(() => {
    loadGroups(startDate || undefined, endDate || undefined);
  }, [loadGroups, startDate, endDate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
        Lista de grupo de transacciones
      </Typography>

      <Card elevation={1}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth size="small" label="Fecha inicial" type="date"
                value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth size="small" label="Fecha final" type="date"
                value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button fullWidth variant="contained" onClick={handleFilter} sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase' }}>
                Filtrar
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button variant="contained" onClick={() => setCreateModalOpen(true)} sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase', px: 4 }}>
              Crear
            </Button>
          </Box>

          <TextField
            fullWidth size="small" placeholder="Filtro rapido"
            value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small"><SearchIcon fontSize="small" /></IconButton></InputAdornment> }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell><TableSortLabel active={sortConfig.key === 'groupNumber'} direction={sortConfig.key === 'groupNumber' ? sortConfig.direction : 'asc'} onClick={() => handleSort('groupNumber')} sx={{ fontWeight: 600 }}>Número</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdAt'} direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdAt')} sx={{ fontWeight: 600 }}>Fecha</TableSortLabel></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdByName'} direction={sortConfig.key === 'createdByName' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdByName')} sx={{ fontWeight: 600 }}>Creado por</TableSortLabel></TableCell>
                    <TableCell align="center"><TableSortLabel active={sortConfig.key === 'isAutomatic'} direction={sortConfig.key === 'isAutomatic' ? sortConfig.direction : 'asc'} onClick={() => handleSort('isAutomatic')} sx={{ fontWeight: 600 }}>¿Es automático?</TableSortLabel></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">No hay entradas disponibles</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedData.map((item) => (
                      <TableRow key={item.groupId} hover>
                        <TableCell>{item.groupNumber}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>{formatTime(item.createdAt)}</TableCell>
                        <TableCell>{item.createdByName ?? ''}</TableCell>
                        <TableCell align="center">
                          <Chip label={item.isAutomatic ? 'Sí' : 'No'} color={item.isAutomatic ? 'success' : 'default'} size="small" sx={{ fontSize: '12px' }} />
                        </TableCell>
                        <TableCell>{item.notes ?? ''}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Mostrando {filteredAndSortedData.length} entradas
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="contained" onClick={() => setCreateModalOpen(true)} sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#45b5b8' }, fontWeight: 600, textTransform: 'uppercase', px: 4 }}>
              Crear
            </Button>
          </Box>
        </CardContent>
      </Card>

      <CreateTransactionGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </Box>
  );
};

export default TransactionGroupsList;
