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
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '@services/api';

const BettingPoolAccess = () => {
  const [loading, setLoading] = useState(true);
  const [bettingPools, setBettingPools] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('number');
  const [order, setOrder] = useState('asc');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [modalData, setModalData] = useState({
    fallPercentage: '',
    deactivationBalance: '',
    dailySaleLimit: '',
    dailyBalanceLimit: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [zonesData, poolsData] = await Promise.all([
        api.get('/zones'),
        api.get('/betting-pools')
      ]);

      const zonesArray = zonesData?.items || zonesData || [];
      const poolsArray = poolsData?.items || poolsData || [];

      setZones(zonesArray);
      // Select all zones by default
      setSelectedZones(zonesArray.map(z => z.zoneId || z.id));
      setBettingPools(poolsArray);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  const handleZoneChange = (event) => {
    const value = event.target.value;
    setSelectedZones(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenModal = (pool) => {
    setSelectedPool(pool);
    setModalData({
      fallPercentage: pool.fallPercentage || '10',
      deactivationBalance: pool.deactivationBalance || '9999999',
      dailySaleLimit: pool.dailySaleLimit || '99999999',
      dailyBalanceLimit: pool.dailyBalanceLimit || ''
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPool(null);
  };

  const handleModalInputChange = (field, value) => {
    setModalData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveModal = async () => {
    if (!selectedPool) return;

    setSaving(true);
    try {
      await api.patch(`/betting-pools/${selectedPool.bettingPoolId || selectedPool.id}/access-config`, {
        fallPercentage: parseFloat(modalData.fallPercentage) || 0,
        deactivationBalance: parseFloat(modalData.deactivationBalance) || 0,
        dailySaleLimit: parseFloat(modalData.dailySaleLimit) || 0,
        dailyBalanceLimit: parseFloat(modalData.dailyBalanceLimit) || 0
      });
      alert('Configuración actualizada exitosamente');
      handleCloseModal();
      handleRefresh();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = [...bettingPools];

    // Filter by selected zones
    if (selectedZones.length > 0 && selectedZones.length < zones.length) {
      data = data.filter(pool => {
        const poolZoneId = pool.zoneId || pool.zone?.id;
        return selectedZones.includes(poolZoneId);
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        (pool.zoneName || pool.zone?.name || '')?.toLowerCase().includes(term)
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
        case 'zone':
          aValue = (a.zoneName || a.zone?.name || '').toLowerCase();
          bValue = (b.zoneName || b.zone?.name || '').toLowerCase();
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
  }, [bettingPools, selectedZones, zones, searchTerm, orderBy, order]);

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
          <Typography variant="h5" component="h1" gutterBottom>
            Lista de bancas
          </Typography>

          {/* Filters Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Zone Multi-Select */}
            <FormControl sx={{ minWidth: 200, maxWidth: 400 }}>
              <InputLabel>Zonas</InputLabel>
              <Select
                multiple
                value={selectedZones}
                onChange={handleZoneChange}
                input={<OutlinedInput label="Zonas" />}
                renderValue={(selected) => `${selected.length} seleccionadas`}
              >
                {zones.map((zone) => (
                  <MenuItem key={zone.zoneId || zone.id} value={zone.zoneId || zone.id}>
                    <Checkbox checked={selectedZones.indexOf(zone.zoneId || zone.id) > -1} />
                    <ListItemText primary={zone.zoneName || zone.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refrescar
            </Button>

            {/* Quick Filter */}
            <TextField
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
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
                  <TableCell>Usuarios</TableCell>
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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'zone'}
                      direction={orderBy === 'zone' ? order : 'asc'}
                      onClick={() => handleSort('zone')}
                    >
                      Zona
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Activa</TableCell>
                  <TableCell>Configuraciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.map((pool) => (
                  <TableRow key={pool.bettingPoolId || pool.id} hover>
                    <TableCell>{pool.bettingPoolId || pool.id}</TableCell>
                    <TableCell>
                      {pool.userCodes?.join(', ') || pool.reference || '-'}
                    </TableCell>
                    <TableCell>{pool.bettingPoolName || pool.name}</TableCell>
                    <TableCell>{pool.reference || '-'}</TableCell>
                    <TableCell>{pool.zoneName || pool.zone?.name || '-'}</TableCell>
                    <TableCell>
                      {pool.isActive || pool.active ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <CancelIcon color="error" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenModal(pool)}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Entry Count */}
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Mostrando {filteredAndSortedData.length} de {bettingPools.length} entradas
          </Typography>
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Actualizar banca
        </DialogTitle>
        <DialogContent>
          <Tabs value={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tab label="Configuraciones" icon={<SettingsIcon />} iconPosition="start" />
          </Tabs>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nombre"
              value={selectedPool?.bettingPoolName || selectedPool?.name || ''}
              disabled
              fullWidth
            />
            <TextField
              label="Porcentaje de caída"
              type="number"
              value={modalData.fallPercentage}
              onChange={(e) => handleModalInputChange('fallPercentage', e.target.value)}
              fullWidth
            />
            <TextField
              label="Balance de desactivación"
              type="number"
              value={modalData.deactivationBalance}
              onChange={(e) => handleModalInputChange('deactivationBalance', e.target.value)}
              fullWidth
            />
            <TextField
              label="Límite de venta diaria"
              type="number"
              value={modalData.dailySaleLimit}
              onChange={(e) => handleModalInputChange('dailySaleLimit', e.target.value)}
              fullWidth
            />
            <TextField
              label="Balance límite al día"
              type="number"
              value={modalData.dailyBalanceLimit}
              onChange={(e) => handleModalInputChange('dailyBalanceLimit', e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveModal}
            disabled={saving}
          >
            {saving ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BettingPoolAccess;
