import React, { useState, useEffect, memo, type FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  FormControl,
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
  FormLabel,
  Radio,
  RadioGroup,
  Chip,
  Switch,
  Stack
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '@services/api';

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface Draw {
  drawId?: number;
  id?: number;
  drawName?: string;
  name?: string;
}

interface BettingPool {
  bettingPoolId?: number;
  id?: number;
  bettingPoolName?: string;
  name?: string;
}

interface PrizeField {
  prizeTypeId: number;
  fieldCode: string;
  fieldName: string;
  defaultMultiplier?: number;
}

interface BetType {
  betTypeId: number;
  betTypeCode: string;
  betTypeName: string;
  prizeTypes?: PrizeField[];
  prizeFields?: PrizeField[];
}

interface FormData {
  zoneId: string;
  fallType: string | null;
  deactivationBalance: string;
  dailySaleLimit: string;
  minutesToCancelTicket: string;
  ticketsToCancelPerDay: string;
  printTicketCopy: string;
  isActive: string;
  winningTicketControl: string;
  useNormalizedPrizes: string;
  allowPassingPlays: string;
  canChangePassword: string;
  language: string | null;
  printMode: string | null;
  discountProvider: string | null;
  discountMode: string | null;
  updateGeneralValues: boolean;
  autoFooter: boolean;
  footer1: string;
  footer2: string;
  footer3: string;
  footer4: string;
  generalCommission?: string;
  commissionType?: string;
  activeDraws?: number[];
  earlyClosingDrawId?: string;
  [key: string]: string | number | boolean | number[] | null | undefined;
}

const MassEditBettingPools: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Data from API
  const [zones, setZones] = useState<Zone[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [betTypes, setBetTypes] = useState<BetType[]>([]);
  const [loadingBetTypes, setLoadingBetTypes] = useState<boolean>(false);
  const [prizesSubTab, setPrizesSubTab] = useState<number>(0); // 0=Premios, 1=Comisiones, 2=Comisiones2

  // Form state - Configuration tab
  const [formData, setFormData] = useState<FormData>({
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
    // Footers tab
    autoFooter: false,
    footer1: '',
    footer2: '',
    footer3: '',
    footer4: '',
  });

  // Selection state
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [selectedBettingPools, setSelectedBettingPools] = useState<number[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectAllDraws, setSelectAllDraws] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [zonesData, drawsData, poolsData] = await Promise.all([
        api.get('/zones') as Promise<{ items?: Zone[] } | Zone[]>,
        api.get('/draws') as Promise<{ items?: Draw[] } | Draw[]>,
        api.get('/betting-pools') as Promise<{ items?: BettingPool[] } | BettingPool[]>
      ]);
      setZones(Array.isArray(zonesData) ? zonesData : (zonesData?.items || []));
      setDraws(Array.isArray(drawsData) ? drawsData : (drawsData?.items || []));
      setBettingPools(Array.isArray(poolsData) ? poolsData : (poolsData?.items || []));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | number[] | null): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrawToggle = (drawId: number): void => {
    setSelectedDraws(prev =>
      prev.includes(drawId)
        ? prev.filter(id => id !== drawId)
        : [...prev, drawId]
    );
  };

  const handlePoolToggle = (poolId: number): void => {
    setSelectedBettingPools(prev =>
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  };

  const handleZoneToggle = (zoneId: number): void => {
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const _handleSelectAllDraws = (): void => {
    if (selectAllDraws) {
      setSelectedDraws([]);
    } else {
      setSelectedDraws(draws.map(d => d.drawId || d.id || 0));
    }
    setSelectAllDraws(!selectAllDraws);
  };

  // Load bet types when Premios & Comisiones tab is activated
  const loadBetTypes = async (): Promise<void> => {
    if (betTypes.length > 0) return; // Already loaded
    setLoadingBetTypes(true);
    try {
      const data = await api.get('/bet-types/with-fields') as BetType[];
      // Transform prizeTypes to prizeFields
      const transformed = (data || []).map(bt => ({
        ...bt,
        prizeFields: bt.prizeTypes || []
      }));
      setBetTypes(transformed);
    } catch (error) {
      console.error('Error loading bet types:', error);
    } finally {
      setLoadingBetTypes(false);
    }
  };

  // Handle prize field change
  const handlePrizeFieldChange = (betTypeCode: string, fieldCode: string, value: string): void => {
    const key = `prize_${betTypeCode}_${fieldCode}`;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCommissionChange = (betTypeCode: string, value: string): void => {
    const key = `commission_${betTypeCode}`;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGeneralCommissionChange = (value: string): void => {
    setFormData(prev => ({ ...prev, generalCommission: value }));
  };

  const handleCommissionTypeChange = (value: string): void => {
    setFormData(prev => ({ ...prev, commissionType: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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

  const renderTriStateToggle = (_fieldName: string, value: string, onChange: (val: string) => void): JSX.Element => (
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
              <Box sx={{ maxWidth: 600 }}>
                {/* Footer automático */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                  <Typography sx={{ minWidth: 200 }}>Footer automático</Typography>
                  <Switch
                    checked={formData.autoFooter}
                    onChange={(e) => handleInputChange('autoFooter', e.target.checked)}
                  />
                </Box>

                {/* Primer pie de página */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Typography sx={{ minWidth: 200 }}>Primer pie de página</Typography>
                  <TextField
                    value={formData.footer1}
                    onChange={(e) => handleInputChange('footer1', e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Texto del primer pie de página"
                  />
                </Box>

                {/* Segundo pie de página */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Typography sx={{ minWidth: 200 }}>Segundo pie de página</Typography>
                  <TextField
                    value={formData.footer2}
                    onChange={(e) => handleInputChange('footer2', e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Texto del segundo pie de página"
                  />
                </Box>

                {/* Tercer pie de página */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Typography sx={{ minWidth: 200 }}>Tercer pie de página</Typography>
                  <TextField
                    value={formData.footer3}
                    onChange={(e) => handleInputChange('footer3', e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Texto del tercer pie de página"
                  />
                </Box>

                {/* Cuarto pie de página */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Typography sx={{ minWidth: 200 }}>Cuarto pie de página</Typography>
                  <TextField
                    value={formData.footer4}
                    onChange={(e) => handleInputChange('footer4', e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Texto del cuarto pie de página"
                  />
                </Box>
              </Box>
            )}

            {/* Prizes Tab */}
            {activeTab === 2 && (
              <Box>
                {/* Load bet types when tab is activated */}
                {betTypes.length === 0 && !loadingBetTypes && (() => { loadBetTypes(); return null; })()}

                {/* Sub-tabs */}
                <Tabs
                  value={prizesSubTab}
                  onChange={(e, newVal) => setPrizesSubTab(newVal)}
                  sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Premios" />
                  <Tab label="Comisiones" />
                  <Tab label="Comisiones 2" />
                </Tabs>

                {loadingBetTypes ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 2 }}>Cargando tipos de apuesta...</Typography>
                  </Box>
                ) : (
                  <>
                    {/* Premios Sub-tab */}
                    {prizesSubTab === 0 && (
                      <Grid container spacing={3}>
                        {betTypes.map(betType => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={betType.betTypeId}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {betType.betTypeName}
                              </Typography>
                              {(betType.prizeFields || []).map(field => {
                                const fieldKey = `prize_${betType.betTypeCode}_${field.fieldCode}`;
                                return (
                                  <Box key={field.prizeTypeId} sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {field.fieldName}
                                    </Typography>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="text"
                                      value={formData[fieldKey] || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        // Only allow numbers and decimal point
                                        if (val === '' || /^[\d.]*$/.test(val)) {
                                          handlePrizeFieldChange(betType.betTypeCode, field.fieldCode, val);
                                        }
                                      }}
                                      placeholder={field.defaultMultiplier?.toString() || ''}
                                      inputProps={{
                                        style: { fontSize: '0.875rem' }
                                      }}
                                    />
                                  </Box>
                                );
                              })}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}

                    {/* Comisiones Sub-tab */}
                    {prizesSubTab === 1 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* General Commission */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 500 }}>
                            General
                          </Typography>
                          <TextField
                            size="small"
                            type="text"
                            value={formData.generalCommission || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[\d.]*$/.test(val)) {
                                handleGeneralCommissionChange(val);
                              }
                            }}
                            placeholder="0"
                            sx={{ maxWidth: 150 }}
                          />
                        </Box>
                        <Divider />
                        {/* Per Bet Type Commissions */}
                        {loadingBetTypes ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : (
                          betTypes.map(betType => (
                            <Box key={betType.betTypeId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 500 }}>
                                {betType.betTypeName}
                              </Typography>
                              <TextField
                                size="small"
                                type="text"
                                value={formData[`commission_${betType.betTypeCode}`] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^[\d.]*$/.test(val)) {
                                    handleCommissionChange(betType.betTypeCode, val);
                                  }
                                }}
                                placeholder="0"
                                sx={{ maxWidth: 150 }}
                              />
                            </Box>
                          ))
                        )}
                      </Box>
                    )}

                    {/* Comisiones 2 Sub-tab */}
                    {prizesSubTab === 2 && (
                      <Box sx={{ p: 2 }}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend" sx={{ fontWeight: 500, mb: 1 }}>
                            Tipo de comisión
                          </FormLabel>
                          <RadioGroup
                            value={formData.commissionType || ''}
                            onChange={(e) => handleCommissionTypeChange(e.target.value)}
                          >
                            <FormControlLabel
                              value="general"
                              control={<Radio />}
                              label="General"
                            />
                            <FormControlLabel
                              value="por_jugada"
                              control={<Radio />}
                              label="Por jugada"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* Draws Tab */}
            {activeTab === 3 && (
              <Box>
                {/* Sorteos activos */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Sorteos activos
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
                    <Grid container spacing={1}>
                      {draws.map(draw => {
                        const id = draw.drawId || draw.id || 0;
                        const isActive = formData.activeDraws?.includes(id) || false;
                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isActive}
                                  onChange={(e) => {
                                    const newActiveDraws = e.target.checked
                                      ? [...(formData.activeDraws || []), id]
                                      : (formData.activeDraws || []).filter(drawId => drawId !== id);
                                    handleInputChange('activeDraws', newActiveDraws);
                                  }}
                                  size="small"
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {draw.drawName || draw.name}
                                </Typography>
                              }
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                </Box>

                {/* Aplicar cierre anticipado */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ minWidth: 200 }}>Aplicar cierre anticipado a</Typography>
                  <FormControl sx={{ minWidth: 300 }} size="small">
                    <Select
                      value={formData.earlyClosingDrawId || ''}
                      displayEmpty
                      onChange={(e) => handleInputChange('earlyClosingDrawId', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Ninguno</em>
                      </MenuItem>
                      {draws.map(draw => (
                        <MenuItem key={draw.drawId || draw.id} value={draw.drawId || draw.id}>
                          {draw.drawName || draw.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
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
                    const id = draw.drawId || draw.id || 0;
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
                    const id = pool.bettingPoolId || pool.id || 0;
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
                    const id = zone.zoneId || zone.id || 0;
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
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon sx={{ fontSize: 20 }} />}
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

export default memo(MassEditBettingPools);
