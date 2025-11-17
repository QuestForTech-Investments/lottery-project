import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  CleaningServices as CleanIcon
} from '@mui/icons-material';
import api from '@services/api';

const CleanPendingPayments = () => {
  const [loading, setLoading] = useState(true);
  const [bettingPools, setBettingPools] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('number');
  const [order, setOrder] = useState('asc');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [cleanDate, setCleanDate] = useState(new Date().toISOString().split('T')[0]);
  const [cleanSummary, setCleanSummary] = useState({ tickets: 0, amount: 0 });
  const [cleaning, setCleaning] = useState(false);

  // Report tab state
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportBancaId, setReportBancaId] = useState('');
  const [reportData, setReportData] = useState([]);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportOrderBy, setReportOrderBy] = useState('fecha');
  const [reportOrder, setReportOrder] = useState('asc');
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    loadBettingPools();
  }, []);

  const loadBettingPools = async () => {
    setLoading(true);
    try {
      const poolsData = await api.get('/betting-pools');
      const poolsArray = poolsData?.items || poolsData || [];
      setBettingPools(poolsArray);
    } catch (error) {
      console.error('Error loading betting pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleReportSort = (property) => {
    const isAsc = reportOrderBy === property && reportOrder === 'asc';
    setReportOrder(isAsc ? 'desc' : 'asc');
    setReportOrderBy(property);
  };

  const handleOpenModal = (pool) => {
    setSelectedPool(pool);
    setCleanDate(new Date().toISOString().split('T')[0]);
    setCleanSummary({ tickets: 0, amount: 0 });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPool(null);
  };

  const handleCleanPayments = async () => {
    if (!selectedPool) return;

    const confirmed = window.confirm(
      `¿Está seguro de limpiar ${cleanSummary.tickets} tickets pendientes por un monto de $${cleanSummary.amount.toFixed(2)}?`
    );
    if (!confirmed) return;

    setCleaning(true);
    try {
      await api.post(`/betting-pools/${selectedPool.bettingPoolId || selectedPool.id}/clean-pending-payments`, {
        untilDate: cleanDate
      });
      alert('Pendientes de pago limpiados exitosamente');
      handleCloseModal();
      loadBettingPools();
    } catch (error) {
      console.error('Error cleaning payments:', error);
      alert('Error al limpiar pendientes de pago');
    } finally {
      setCleaning(false);
    }
  };

  const handleSearchReport = async () => {
    if (!reportBancaId) {
      alert('Por favor seleccione una banca');
      return;
    }

    setLoadingReport(true);
    try {
      const data = await api.get(
        `/betting-pools/${reportBancaId}/cleaned-payments?startDate=${reportStartDate}&endDate=${reportEndDate}`
      );
      setReportData(data?.items || data || []);
    } catch (error) {
      console.error('Error loading report:', error);
      setReportData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  // Filter and sort list data
  const filteredAndSortedData = useMemo(() => {
    let data = [...bettingPools];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        (pool.userCodes?.join(', ') || '')?.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case 'number':
          aValue = a.bettingPoolId || a.id || 0;
          bValue = b.bettingPoolId || b.id || 0;
          break;
        case 'name':
          aValue = (a.bettingPoolName || a.name || '').toLowerCase();
          bValue = (b.bettingPoolName || b.name || '').toLowerCase();
          break;
        case 'reference':
          aValue = (a.reference || '').toLowerCase();
          bValue = (b.reference || '').toLowerCase();
          break;
        default:
          aValue = a[orderBy];
          bValue = b[orderBy];
      }

      if (typeof aValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return data;
  }, [bettingPools, searchTerm, orderBy, order]);

  // Filter and sort report data
  const filteredAndSortedReportData = useMemo(() => {
    let data = [...reportData];

    if (reportSearchTerm) {
      const term = reportSearchTerm.toLowerCase();
      data = data.filter(item =>
        item.ticketNumber?.toString().includes(term) ||
        item.usuario?.toLowerCase().includes(term)
      );
    }

    return data;
  }, [reportData, reportSearchTerm]);

  // Calculate report totals
  const reportTotals = useMemo(() => {
    return filteredAndSortedReportData.reduce(
      (acc, item) => ({
        monto: acc.monto + (item.monto || 0),
        premios: acc.premios + (item.premios || 0)
      }),
      { monto: 0, premios: 0 }
    );
  }, [filteredAndSortedReportData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Lista" />
            <Tab label="Reporte" />
          </Tabs>

          {/* Tab Lista */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Lista de bancas
              </Typography>

              {/* Quick Filter */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  placeholder="Filtrado rápido"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'number'}
                          direction={orderBy === 'number' ? order : 'asc'}
                          onClick={() => handleSort('number')}
                        >
                          Número
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'name'}
                          direction={orderBy === 'name' ? order : 'asc'}
                          onClick={() => handleSort('name')}
                        >
                          Nombre
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'reference'}
                          direction={orderBy === 'reference' ? order : 'asc'}
                          onClick={() => handleSort('reference')}
                        >
                          Referencia
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Usuarios</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedData.map((pool) => (
                      <TableRow key={pool.bettingPoolId || pool.id} hover>
                        <TableCell>{pool.bettingPoolId || pool.id}</TableCell>
                        <TableCell>{pool.bettingPoolName || pool.name}</TableCell>
                        <TableCell>{pool.reference || '-'}</TableCell>
                        <TableCell>{pool.userCodes?.join(', ') || pool.reference || '-'}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenModal(pool)}
                            title="Limpiar pendientes de pago"
                          >
                            <CleanIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Mostrando {filteredAndSortedData.length} de {bettingPools.length} entradas
              </Typography>
            </Box>
          )}

          {/* Tab Reporte */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Tickets pagados y limpiados
              </Typography>

              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="Fecha inicial"
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Fecha final"
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl sx={{ minWidth: 250 }} size="small">
                  <InputLabel>Banca</InputLabel>
                  <Select
                    value={reportBancaId}
                    label="Banca"
                    onChange={(e) => setReportBancaId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Seleccione</em>
                    </MenuItem>
                    {bettingPools.map((pool) => (
                      <MenuItem key={pool.bettingPoolId || pool.id} value={pool.bettingPoolId || pool.id}>
                        {pool.reference || pool.bettingPoolName || pool.name} ({pool.bettingPoolId || pool.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleSearchReport}
                  disabled={loadingReport}
                >
                  {loadingReport ? 'Buscando...' : 'Buscar'}
                </Button>
              </Box>

              {/* Quick Filter */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  placeholder="Filtrado rápido"
                  value={reportSearchTerm}
                  onChange={(e) => setReportSearchTerm(e.target.value)}
                  size="small"
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Report Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={reportOrderBy === 'fecha'}
                          direction={reportOrderBy === 'fecha' ? reportOrder : 'asc'}
                          onClick={() => handleReportSort('fecha')}
                        >
                          Fecha
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={reportOrderBy === 'ticketNumber'}
                          direction={reportOrderBy === 'ticketNumber' ? reportOrder : 'asc'}
                          onClick={() => handleReportSort('ticketNumber')}
                        >
                          Ticket #
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={reportOrderBy === 'monto'}
                          direction={reportOrderBy === 'monto' ? reportOrder : 'asc'}
                          onClick={() => handleReportSort('monto')}
                        >
                          Monto
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={reportOrderBy === 'premios'}
                          direction={reportOrderBy === 'premios' ? reportOrder : 'asc'}
                          onClick={() => handleReportSort('premios')}
                        >
                          Premios
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={reportOrderBy === 'fechaPago'}
                          direction={reportOrderBy === 'fechaPago' ? reportOrder : 'asc'}
                          onClick={() => handleReportSort('fechaPago')}
                        >
                          Fecha de pago
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={reportOrderBy === 'usuario'}
                          direction={reportOrderBy === 'usuario' ? reportOrder : 'asc'}
                          onClick={() => handleReportSort('usuario')}
                        >
                          Usuario
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedReportData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No hay entradas disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedReportData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.fecha}</TableCell>
                          <TableCell>{item.ticketNumber}</TableCell>
                          <TableCell>${(item.monto || 0).toFixed(2)}</TableCell>
                          <TableCell>${(item.premios || 0).toFixed(2)}</TableCell>
                          <TableCell>{item.fechaPago}</TableCell>
                          <TableCell>{item.usuario}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {/* Totals Row */}
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell>
                        <strong>Totales</strong>
                      </TableCell>
                      <TableCell>
                        <strong>-</strong>
                      </TableCell>
                      <TableCell>
                        <strong>${reportTotals.monto.toFixed(2)}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>${reportTotals.premios.toFixed(2)}</strong>
                      </TableCell>
                      <TableCell>
                        <strong>-</strong>
                      </TableCell>
                      <TableCell>
                        <strong>-</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Mostrando {filteredAndSortedReportData.length} de {reportData.length} entradas
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Clean Pending Payments Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Limpiar pendientes de pago</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Nombre:</strong> {selectedPool?.bettingPoolName || selectedPool?.name}
            </Typography>
            <Typography variant="body1">
              <strong>Número:</strong> #{selectedPool?.bettingPoolId || selectedPool?.id}
            </Typography>
          </Box>

          <TextField
            label="Fecha"
            type="date"
            value={cleanDate}
            onChange={(e) => setCleanDate(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se limpiaran todos los tickets pendientes de pago hasta la fecha seleccionada
          </Typography>

          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="body1">
              <strong>Tickets:</strong> {cleanSummary.tickets}
            </Typography>
            <Typography variant="body1">
              <strong>Monto de premios a limpiar:</strong> ${cleanSummary.amount.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCleanPayments}
            disabled={cleaning}
          >
            {cleaning ? 'Limpiando...' : 'OK'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CleanPendingPayments;
