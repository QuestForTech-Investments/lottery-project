import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Paper,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Chip,
  Switch,
  Stack
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '@services/api';

const MassEditBettingPools = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Data from API
  const [zones, setZones] = useState([]);
  const [draws, setDraws] = useState([]);
  const [bettingPools, setBettingPools] = useState([]);

  // Form state - Configuration tab
  const [formData, setFormData] = useState({
    zoneId: '',
    fallType: null,
    deactivationBalance: '',
    dailySaleLimit: '',
    minutesToCancelTicket: '',
    ticketsToCancelPerDay: '',
    printTicketCopy: 'no_change',
    isActive: 'no_change',
    winningTicketControl: 'no_change',
    useNormalizedPrizes: 'no_change',
    allowPassingPlays: 'no_change',
    canChangePassword: 'no_change',
    language: null,
    printMode: null,
    discountProvider: null,
    discountMode: null,
    updateGeneralValues: false,
  });

  // Selection state
  const [selectedDraws, setSelectedDraws] = useState([]);
  const [selectedBettingPools, setSelectedBettingPools] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [selectAllDraws, setSelectAllDraws] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [zonesData, drawsData, poolsData] = await Promise.all([
        api.get('/zones'),
        api.get('/draws'),
        api.get('/betting-pools')
      ]);
      setZones(zonesData?.items || zonesData || []);
      setDraws(drawsData?.items || drawsData || []);
      setBettingPools(poolsData?.items || poolsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrawToggle = (drawId) => {
    setSelectedDraws(prev =>
      prev.includes(drawId)
        ? prev.filter(id => id !== drawId)
        : [...prev, drawId]
    );
  };

  const handlePoolToggle = (poolId) => {
    setSelectedBettingPools(prev =>
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  const handleZoneToggle = (zoneId) => {
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleSelectAllDraws = () => {
    if (selectAllDraws) {
      setSelectedDraws([]);
    } else {
      setSelectedDraws(draws.map(d => d.drawId || d.id));
    }
    setSelectAllDraws(!selectAllDraws);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedBettingPools.length === 0) {
      alert('Debe seleccionar al menos una banca');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bettingPoolIds: selectedBettingPools,
        drawIds: selectedDraws,
        zoneIds: selectedZones,
        configuration: formData
      };

      await api.patch('/betting-pools/mass-update', payload);
      alert('Bancas actualizadas exitosamente');
    } catch (error) {
      console.error('Error updating:', error);
      alert('Error al actualizar las bancas');
    } finally {
      setSaving(false);
    }
  };

  const renderTriStateToggle = (fieldName, value, onChange) => (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(e, newVal) => newVal && onChange(newVal)}
      size="small"
      sx={{ flexWrap: 'wrap' }}
    >
      <ToggleButton value="on" color="success">
        Encender
      </ToggleButton>
      <ToggleButton value="off" color="error">
        Apagar
      </ToggleButton>
      <ToggleButton value="no_change" color="primary">
        No cambiar
      </ToggleButton>
    </ToggleButtonGroup>
  );

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
            Actualizar banca
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, newVal) => setActiveTab(newVal)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Configuración" />
              <Tab label="Pies de página" />
              <Tab label="Premios & Comisiones" />
              <Tab label="Sorteos" />
            </Tabs>

            {/* Tab Content */}
            {/* Configuration Tab */}
            {activeTab === 0 && (
              <Box>
                {/* SECTION 1: Full-width fields with label-control layout */}
                <Box sx={{ mb: 3 }}>
                  {/* Zona */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Typography sx={{ minWidth: 200 }}>Zona</Typography>
                    <FormControl sx={{ minWidth: 300 }} size="small">
                      <Select
                        value={formData.zoneId}
                        displayEmpty
                        onChange={(e) => handleInputChange('zoneId', e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Seleccione</em>
                        </MenuItem>
                        {zones.map(zone => (
                          <MenuItem key={zone.zoneId || zone.id} value={zone.zoneId || zone.id}>
                            {zone.zoneName || zone.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Tipo de caída */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Typography sx={{ minWidth: 200 }}>Tipo de caída</Typography>
                    <ToggleButtonGroup
                      value={formData.fallType}
                      exclusive
                      onChange={(e, newVal) => handleInputChange('fallType', newVal)}
                      size="small"
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <ToggleButton value="OFF">OFF</ToggleButton>
                      <ToggleButton value="COBRO">COBRO</ToggleButton>
                      <ToggleButton value="DIARIA">DIARIA</ToggleButton>
                      <ToggleButton value="MENSUAL">MENSUAL</ToggleButton>
                      <ToggleButton value="SEMANAL_CON_ACUMULADO">SEMANAL CON ACUMULADO</ToggleButton>
                      <ToggleButton value="SEMANAL_SIN_ACUMULADO">SEMANAL SIN ACUMULADO</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Balance de desactivación */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Typography sx={{ minWidth: 200 }}>Balance de desactivación</Typography>
                    <TextField
                      placeholder="Balance de desactivación"
                      value={formData.deactivationBalance}
                      onChange={(e) => handleInputChange('deactivationBalance', e.target.value)}
                      size="small"
                      sx={{ minWidth: 300 }}
                    />
                  </Box>

                  {/* Límite de venta diaria */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Typography sx={{ minWidth: 200 }}>Límite de venta diaria</Typography>
                    <TextField
                      placeholder="Límite de venta diaria"
                      value={formData.dailySaleLimit}
                      onChange={(e) => handleInputChange('dailySaleLimit', e.target.value)}
                      size="small"
                      sx={{ minWidth: 300 }}
                    />
                  </Box>
                </Box>

                {/* SECTION 2: Two columns for toggle groups */}
                <Grid container spacing={4} sx={{ mb: 3 }}>
                  {/* Left Column */}
                  <Grid item xs={12} md={6}>
                    {/* Imprimir copia de ticket */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Imprimir copia de ticket</Typography>
                      {renderTriStateToggle('printTicketCopy', formData.printTicketCopy,
                        (val) => handleInputChange('printTicketCopy', val))}
                    </Box>

                    {/* Activa */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Activa</Typography>
                      {renderTriStateToggle('isActive', formData.isActive,
                        (val) => handleInputChange('isActive', val))}
                    </Box>

                    {/* Control de tickets ganadores */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Control de tickets ganadores</Typography>
                      {renderTriStateToggle('winningTicketControl', formData.winningTicketControl,
                        (val) => handleInputChange('winningTicketControl', val))}
                    </Box>

                    {/* Usar premios normalizados */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Usar premios normalizados</Typography>
                      {renderTriStateToggle('useNormalizedPrizes', formData.useNormalizedPrizes,
                        (val) => handleInputChange('useNormalizedPrizes', val))}
                    </Box>

                    {/* Permitir pasar bote */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Permitir pasar bote</Typography>
                      {renderTriStateToggle('allowPassingPlays', formData.allowPassingPlays,
                        (val) => handleInputChange('allowPassingPlays', val))}
                    </Box>

                    {/* Minutos para cancelar tickets */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Minutos para cancelar tickets</Typography>
                      <TextField
                        value={formData.minutesToCancelTicket}
                        onChange={(e) => handleInputChange('minutesToCancelTicket', e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                      />
                    </Box>

                    {/* Tickets a cancelar por día */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Tickets a cancelar por día</Typography>
                      <TextField
                        type="number"
                        value={formData.ticketsToCancelPerDay}
                        onChange={(e) => handleInputChange('ticketsToCancelPerDay', e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                      />
                    </Box>
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} md={6}>
                    {/* Idioma */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Idioma</Typography>
                      <ToggleButtonGroup
                        value={formData.language}
                        exclusive
                        onChange={(e, newVal) => handleInputChange('language', newVal)}
                        size="small"
                      >
                        <ToggleButton value="ESPAÑOL">ESPAÑOL</ToggleButton>
                        <ToggleButton value="INGLÉS">INGLÉS</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Modo de impresión */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Modo de impresión</Typography>
                      <ToggleButtonGroup
                        value={formData.printMode}
                        exclusive
                        onChange={(e, newVal) => handleInputChange('printMode', newVal)}
                        size="small"
                      >
                        <ToggleButton value="DRIVER">DRIVER</ToggleButton>
                        <ToggleButton value="GENÉRICO">GENÉRICO</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Proveedor de descuento */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Proveedor de descuento</Typography>
                      <ToggleButtonGroup
                        value={formData.discountProvider}
                        exclusive
                        onChange={(e, newVal) => handleInputChange('discountProvider', newVal)}
                        size="small"
                      >
                        <ToggleButton value="GRUPO">GRUPO</ToggleButton>
                        <ToggleButton value="RIFERO">RIFERO</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Modo de descuento */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Modo de descuento</Typography>
                      <ToggleButtonGroup
                        value={formData.discountMode}
                        exclusive
                        onChange={(e, newVal) => handleInputChange('discountMode', newVal)}
                        size="small"
                        sx={{ flexWrap: 'wrap' }}
                      >
                        <ToggleButton value="OFF">OFF</ToggleButton>
                        <ToggleButton value="EFECTIVO">EFECTIVO</ToggleButton>
                        <ToggleButton value="TICKET_GRATIS">TICKET GRATIS</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Permitir cambiar contraseña */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Typography sx={{ minWidth: 200 }}>Permitir cambiar contraseña</Typography>
                      {renderTriStateToggle('canChangePassword', formData.canChangePassword,
                        (val) => handleInputChange('canChangePassword', val))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Footers Tab */}
            {activeTab === 1 && (
              <Typography color="text.secondary">
                Configuración de pies de página (En desarrollo)
              </Typography>
            )}

            {/* Prizes Tab */}
            {activeTab === 2 && (
              <Typography color="text.secondary">
                Configuración de premios y comisiones (En desarrollo)
              </Typography>
            )}

            {/* Draws Tab */}
            {activeTab === 3 && (
              <Typography color="text.secondary">
                Configuración de sorteos (En desarrollo)
              </Typography>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Selection Section - Using Chips like v1 badges */}
            {/* Sorteos */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Sorteos
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflowY: 'auto' }}>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {draws.map(draw => {
                    const id = draw.drawId || draw.id;
                    const isSelected = selectedDraws.includes(id);
                    return (
                      <Chip
                        key={id}
                        label={draw.drawName || draw.name}
                        onClick={() => handleDrawToggle(id)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        color={isSelected ? 'primary' : 'default'}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Stack>
              </Paper>
            </Box>

            {/* Bancas */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Bancas
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 150, overflowY: 'auto' }}>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {bettingPools.map(pool => {
                    const id = pool.bettingPoolId || pool.id;
                    const isSelected = selectedBettingPools.includes(id);
                    return (
                      <Chip
                        key={id}
                        label={pool.bettingPoolName || pool.name || `Pool ${id}`}
                        onClick={() => handlePoolToggle(id)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        color={isSelected ? 'primary' : 'default'}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Stack>
              </Paper>
            </Box>

            {/* Zonas */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Zonas
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 150, overflowY: 'auto' }}>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {zones.map(zone => {
                    const id = zone.zoneId || zone.id;
                    const isSelected = selectedZones.includes(id);
                    return (
                      <Chip
                        key={id}
                        label={zone.zoneName || zone.name}
                        onClick={() => handleZoneToggle(id)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        color={isSelected ? 'primary' : 'default'}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Stack>
              </Paper>
            </Box>

            {/* Actualizar valores generales - Switch like v1 iPhone toggle */}
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.updateGeneralValues}
                    onChange={(e) => handleInputChange('updateGeneralValues', e.target.checked)}
                  />
                }
                label="Actualizar valores generales"
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                disabled={saving || selectedBettingPools.length === 0}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon size={20} />}
                sx={{ minWidth: 200 }}
              >
                {saving ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MassEditBettingPools;
