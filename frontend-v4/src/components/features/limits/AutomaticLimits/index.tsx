import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import automaticLimitService, { handleAutomaticLimitError } from '@/services/automaticLimitService';
import limitService from '@/services/limitService';
import type {
  AutomaticLimitConfig,
  RandomBlockConfig,
  LimitParams,
  NumberControlSettings,
  defaultAutomaticLimitConfig
} from '@/types/limits';

const AutomaticLimits = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Configuration state
  const [config, setConfig] = useState<AutomaticLimitConfig | null>(null);
  const [randomBlock, setRandomBlock] = useState<RandomBlockConfig>({
    drawIds: [],
    palesToBlock: 0
  });
  const [params, setParams] = useState<LimitParams | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingRandom, setSavingRandom] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [configData, paramsData] = await Promise.all([
          automaticLimitService.getConfig(),
          limitService.getLimitParams()
        ]);
        setConfig(configData);
        setParams(paramsData);
      } catch (err) {
        console.error('Error loading config:', err);
        const errorMessage = handleAutomaticLimitError(err, 'cargar configuracion');
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle general number controls change
  const handleGeneralChange = useCallback((field: keyof NumberControlSettings, value: boolean | number) => {
    setConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        generalNumberControls: {
          ...prev.generalNumberControls,
          [field]: value
        }
      };
    });
  }, []);

  // Handle line controls change
  const handleLineChange = useCallback((field: keyof NumberControlSettings, value: boolean | number) => {
    setConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        lineControls: {
          ...prev.lineControls,
          [field]: value
        }
      };
    });
  }, []);

  // Handle draw toggle for random blocking
  const handleDrawToggle = useCallback((drawId: number): void => {
    setRandomBlock(prev => ({
      ...prev,
      drawIds: prev.drawIds.includes(drawId)
        ? prev.drawIds.filter(id => id !== drawId)
        : [...prev.drawIds, drawId]
    }));
  }, []);

  // Save general configuration
  const handleSaveGeneral = useCallback(async (): Promise<void> => {
    if (!config) return;

    setSavingGeneral(true);
    try {
      await automaticLimitService.saveGeneralConfig(config);
      setSnackbar({
        open: true,
        message: 'Configuracion guardada exitosamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving general config:', err);
      const errorMessage = handleAutomaticLimitError(err, 'guardar configuracion');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSavingGeneral(false);
    }
  }, [config]);

  // Update random blocking
  const handleUpdateBlocking = useCallback(async (): Promise<void> => {
    if (randomBlock.drawIds.length === 0) {
      setSnackbar({
        open: true,
        message: 'Por favor seleccione al menos un sorteo',
        severity: 'warning'
      });
      return;
    }

    if (randomBlock.palesToBlock <= 0) {
      setSnackbar({
        open: true,
        message: 'Por favor ingrese el numero de pales a bloquear',
        severity: 'warning'
      });
      return;
    }

    setSavingRandom(true);
    try {
      await automaticLimitService.saveRandomBlock(randomBlock);
      setSnackbar({
        open: true,
        message: 'Bloqueo actualizado exitosamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating random block:', err);
      const errorMessage = handleAutomaticLimitError(err, 'actualizar bloqueo');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSavingRandom(false);
    }
  }, [randomBlock]);

  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  // Get draws from params for the checkbox list
  const draws = params?.draws || [];
  const bettingPools = params?.bettingPools || [];

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontSize: '24px', fontWeight: 500, color: '#2c2c2c' }}>
        Limites automaticos
      </Typography>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 2,
            borderColor: '#6366f1',
            '& .MuiTab-root': { fontSize: '14px' },
            '& .Mui-selected': { color: '#6366f1' }
          }}
          TabIndicatorProps={{ style: { backgroundColor: '#6366f1' } }}
        >
          <Tab label="General" />
          <Tab label="Bloqueo Aleatorio" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          {/* Tab General */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mb: 3, color: '#2c2c2c' }}>
                Controles automaticos generales por numero
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config?.generalNumberControls.enableDirecto ?? false}
                        onChange={(e) => handleGeneralChange('enableDirecto', e.target.checked)}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar directo (dia)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={config?.generalNumberControls.montoDirecto ?? 0}
                    onChange={(e) => handleGeneralChange('montoDirecto', parseFloat(e.target.value) || 0)}
                    placeholder="Monto directo"
                    disabled={!config?.generalNumberControls.enableDirecto}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config?.generalNumberControls.enablePale ?? false}
                        onChange={(e) => handleGeneralChange('enablePale', e.target.checked)}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar pale (dia-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={config?.generalNumberControls.montoPale ?? 0}
                    onChange={(e) => handleGeneralChange('montoPale', parseFloat(e.target.value) || 0)}
                    placeholder="Monto pale directo"
                    disabled={!config?.generalNumberControls.enablePale}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config?.generalNumberControls.enableSuperPale ?? false}
                        onChange={(e) => handleGeneralChange('enableSuperPale', e.target.checked)}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar super pale (dia-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={config?.generalNumberControls.montoSuperPale ?? 0}
                    onChange={(e) => handleGeneralChange('montoSuperPale', parseFloat(e.target.value) || 0)}
                    placeholder="Monto super pale"
                    disabled={!config?.generalNumberControls.enableSuperPale}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mt: 4, mb: 3, color: '#2c2c2c' }}>
                Controles automaticos de linea para bancas
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config?.lineControls.enableDirecto ?? false}
                        onChange={(e) => handleLineChange('enableDirecto', e.target.checked)}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar directo (dia)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={config?.lineControls.montoDirecto ?? 0}
                    onChange={(e) => handleLineChange('montoDirecto', parseFloat(e.target.value) || 0)}
                    placeholder="Monto directo"
                    disabled={!config?.lineControls.enableDirecto}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config?.lineControls.enablePale ?? false}
                        onChange={(e) => handleLineChange('enablePale', e.target.checked)}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar pale (dia-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={config?.lineControls.montoPale ?? 0}
                    onChange={(e) => handleLineChange('montoPale', parseFloat(e.target.value) || 0)}
                    placeholder="Monto pale directo"
                    disabled={!config?.lineControls.enablePale}
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config?.lineControls.enableSuperPale ?? false}
                        onChange={(e) => handleLineChange('enableSuperPale', e.target.checked)}
                      />
                    }
                    label={<Typography sx={{ fontSize: '13px' }}>Habilitar super pale (dia-mes)</Typography>}
                  />
                  <TextField
                    type="number"
                    fullWidth
                    value={config?.lineControls.montoSuperPale ?? 0}
                    onChange={(e) => handleLineChange('montoSuperPale', parseFloat(e.target.value) || 0)}
                    placeholder="Monto super pale"
                    disabled={!config?.lineControls.enableSuperPale}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveGeneral}
                  disabled={savingGeneral}
                  sx={{
                    bgcolor: '#6366f1',
                    color: 'white',
                    '&:hover': { bgcolor: '#5568d3' },
                    '&:disabled': { bgcolor: '#a5a6f6' },
                    fontSize: '14px',
                    px: 5,
                    py: 1.5,
                    textTransform: 'none'
                  }}
                >
                  {savingGeneral ? (
                    <>
                      <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                      GUARDANDO...
                    </>
                  ) : (
                    'GUARDAR'
                  )}
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab Bloqueo Aleatorio */}
          {activeTab === 1 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#787878', mb: 1 }}>
                  Sorteos *
                </Typography>
                <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', p: 1, borderRadius: '4px', bgcolor: 'white' }}>
                  {draws.length > 0 ? (
                    draws.map(draw => (
                      <FormControlLabel
                        key={draw.value}
                        control={
                          <Checkbox
                            checked={randomBlock.drawIds.includes(draw.value)}
                            onChange={() => handleDrawToggle(draw.value)}
                            size="small"
                          />
                        }
                        label={draw.label}
                        sx={{ display: 'block', mb: 1, '& .MuiFormControlLabel-label': { fontSize: '13px' } }}
                      />
                    ))
                  ) : (
                    <Typography sx={{ fontSize: '13px', color: '#999', p: 2, textAlign: 'center' }}>
                      No hay sorteos disponibles
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: '12px' }}>Bancas</InputLabel>
                  <Select
                    value={randomBlock.bettingPoolId ?? ''}
                    onChange={(e) => setRandomBlock(prev => ({
                      ...prev,
                      bettingPoolId: e.target.value === '' ? undefined : Number(e.target.value)
                    }))}
                    label="Bancas"
                    sx={{ fontSize: '14px' }}
                  >
                    <MenuItem value=""><em>Todas las bancas</em></MenuItem>
                    {bettingPools.map(bp => (
                      <MenuItem key={bp.value} value={bp.value} sx={{ fontSize: '14px' }}>
                        {bp.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  type="number"
                  label="# de pales a bloquear *"
                  fullWidth
                  value={randomBlock.palesToBlock || ''}
                  onChange={(e) => setRandomBlock(prev => ({
                    ...prev,
                    palesToBlock: parseInt(e.target.value, 10) || 0
                  }))}
                  placeholder="0"
                  InputLabelProps={{ sx: { fontSize: '12px' } }}
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleUpdateBlocking}
                  disabled={savingRandom}
                  sx={{
                    bgcolor: '#6366f1',
                    color: 'white',
                    '&:hover': { bgcolor: '#5568d3' },
                    '&:disabled': { bgcolor: '#a5a6f6' },
                    fontSize: '14px',
                    px: 5,
                    py: 1.5,
                    textTransform: 'none'
                  }}
                >
                  {savingRandom ? (
                    <>
                      <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                      ACTUALIZANDO...
                    </>
                  ) : (
                    'ACTUALIZAR'
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AutomaticLimits;
