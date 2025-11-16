import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { getAllBetTypesWithFields } from '@services/prizeService';
// ⚡ getAllDraws removed - draws now loaded in parent
// ⚡ getBetTypesByDraw removed - now using getAllBetTypesWithFields for all draws

/**
 * Orden específico de los sorteos según V1
 */
const DRAW_ORDER = [
  'LA PRIMERA', 'NEW YORK DAY', 'NEW YORK NIGHT', 'FLORIDA AM', 'FLORIDA PM',
  'GANA MAS', 'NACIONAL', 'QUINIELA PALE', 'REAL', 'LOTEKA',
  'FL PICK2 AM', 'FL PICK2 PM', 'GEORGIA-MID AM', 'GEORGIA EVENING', 'GEORGIA NIGHT',
  'NEW JERSEY AM', 'NEW JERSEY PM', 'CONNECTICUT AM', 'CONNECTICUT PM',
  'CALIFORNIA AM', 'CALIFORNIA PM', 'CHICAGO AM', 'CHICAGO PM',
  'PENN MIDDAY', 'PENN EVENING', 'INDIANA MIDDAY', 'INDIANA EVENING',
  'DIARIA 11AM', 'DIARIA 3PM', 'DIARIA 9PM',
  'SUPER PALE TARDE', 'SUPER PALE NOCHE', 'SUPER PALE NY-FL AM', 'SUPER PALE NY-FL PM',
  'TEXAS MORNING', 'TEXAS DAY', 'TEXAS EVENING', 'TEXAS NIGHT',
  'VIRGINIA AM', 'VIRGINIA PM', 'SOUTH CAROLINA AM', 'SOUTH CAROLINA PM',
  'MARYLAND MIDDAY', 'MARYLAND EVENING', 'MASS AM', 'MASS PM', 'LA SUERTE',
  'NORTH CAROLINA AM', 'NORTH CAROLINA PM', 'LOTEDOM',
  'NY AM 6x1', 'NY PM 6x1', 'FL AM 6X1', 'FL PM 6X1',
  'King Lottery AM', 'King Lottery PM', 'L.E. PUERTO RICO 2PM', 'L.E. PUERTO RICO 10PM',
  'DELAWARE AM', 'DELAWARE PM', 'Anguila 1pm', 'Anguila 6PM', 'Anguila 9pm', 'Anguila 10am',
  'LA CHICA', 'LA PRIMERA 8PM', 'PANAMA MIERCOLES', 'PANAMA DOMINGO', 'LA SUERTE 6:00pm'
];

/**
 * PrizesTab Component with Sub-tabs and Draw Tabs (like V1)
 * 3-Level Structure:
 * - Level 1: Main tab "Premios & Comisiones"
 * - Level 2: Sub-tabs (Premios, Comisiones, Comisiones 2)
 * - Level 3: Draw tabs (General + ~70 draws)
 */
const PrizesTab = ({ formData, handleChange, bettingPoolId = null, loadDrawSpecificValues = null, draws: propDraws = [], loadingDraws: propLoadingDraws = false }) => {
  // ⚡ PERFORMANCE: Draws loaded in parent hook when provided, otherwise load locally (backward compatible)
  const [localDraws, setLocalDraws] = useState([]);
  const [localLoadingDraws, setLocalLoadingDraws] = useState(false);
  const [betTypes, setBetTypes] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState(0); // 0=Premios, 1=Comisiones, 2=Comisiones 2
  const [activeDraw, setActiveDraw] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const drawTabsRef = useRef(null);

  // Use prop draws if provided, otherwise use local draws
  const draws = propDraws.length > 0 ? propDraws : localDraws;
  const loadingDraws = propDraws.length > 0 ? propLoadingDraws : localLoadingDraws;

  // 🔍 DEBUG: Log draws to diagnose issue
  console.log(`🔍 [PrizesTab DEBUG] propDraws.length=${propDraws.length}, localDraws.length=${localDraws.length}, final draws.length=${draws.length}`);

  // Estado para valores "general" (usados como fallback)
  const [generalValues, setGeneralValues] = useState({});

  // Load draws locally only if not provided by parent
  useEffect(() => {
    if (propDraws.length === 0) {
      const loadLocalDraws = async () => {
        try {
          setLocalLoadingDraws(true);
          const { getAllDraws } = await import('@services/drawService');
          const drawsResponse = await getAllDraws({ isActive: true, loadAll: true });
          if (drawsResponse.success && drawsResponse.data) {
            const apiDraws = drawsResponse.data.map(draw => ({
              id: `draw_${draw.drawId}`,
              name: draw.drawName,
              drawId: draw.drawId
            }));
            const sortedDraws = DRAW_ORDER
              .map(orderName => apiDraws.find(draw => draw.name === orderName))
              .filter(draw => draw !== undefined);
            const unorderedDraws = apiDraws.filter(draw => !DRAW_ORDER.includes(draw.name));
            const formattedDraws = [
              { id: 'general', name: 'General' },
              ...sortedDraws,
              ...unorderedDraws
            ];
            setLocalDraws(formattedDraws);
            console.log(`✅ Loaded ${formattedDraws.length} draws locally (PrizesTab fallback)`);
          } else {
            setLocalDraws([{ id: 'general', name: 'General' }]);
          }
        } catch (err) {
          console.error('❌ Error loading draws locally:', err);
          setLocalDraws([{ id: 'general', name: 'General' }]);
        } finally {
          setLocalLoadingDraws(false);
        }
      };
      loadLocalDraws();
    }
  }, [propDraws.length]);

  /**
   * Load bet types when draw changes
   */
  useEffect(() => {
    loadBetTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraw]);

  /**
   * 🔥 NEW: Load draw-specific values when switching to a draw tab
   */
  useEffect(() => {
    console.log(`🔍 [LOAD CHECK] activeDraw: ${activeDraw}, bettingPoolId: ${bettingPoolId}, hasLoadFn: ${!!loadDrawSpecificValues}`);

    // Only load if:
    // 1. We're editing (bettingPoolId exists)
    // 2. We have the load function
    // 3. We're on a specific draw tab (not general)
    if (bettingPoolId && loadDrawSpecificValues && activeDraw !== 'general' && activeDraw.startsWith('draw_')) {
      const drawId = parseInt(activeDraw.split('_')[1]);
      console.log(`🎯 Tab changed to draw ${drawId}, loading specific values...`);

      loadDrawSpecificValues(drawId, bettingPoolId)
        .then(drawValues => {
          if (Object.keys(drawValues).length > 0) {
            console.log(`✅ Loaded draw values, updating form data...`);
            // Merge draw-specific values into formData
            Object.keys(drawValues).forEach(key => {
              handleChange({
                target: {
                  name: key,
                  value: drawValues[key]
                }
              });
            });
          }
        })
        .catch(error => {
          console.error(`❌ Error loading draw-specific values:`, error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraw, bettingPoolId]);

  /**
   * Load "general" values once (for fallback)
   */
  useEffect(() => {
    const loadGeneralDefaults = async () => {
      try {
        console.log('📋 [FALLBACK] Loading general values for fallback...');
        const allBetTypes = await getAllBetTypesWithFields();

        if (allBetTypes && Array.isArray(allBetTypes)) {
          const generalVals = {};

          allBetTypes.forEach(betType => {
            const betTypeCode = betType.betTypeCode;
            const prizeFields = betType.prizeFields || [];

            prizeFields.forEach(field => {
              const fieldCode = field.fieldCode;
              const defaultValue = field.defaultMultiplier;

              if (fieldCode && defaultValue !== undefined && betTypeCode) {
                const key = `general_${betTypeCode}_${fieldCode}`;
                generalVals[key] = defaultValue;
              }
            });
          });

          console.log(`✅ [FALLBACK] General values loaded: ${Object.keys(generalVals).length} fields`);
          setGeneralValues(generalVals);
        }
      } catch (error) {
        console.error('❌ [FALLBACK] Error loading general values:', error);
      }
    };

    loadGeneralDefaults();
  }, []);

  // ⚡ PERFORMANCE: loadInitialData removed - draws now loaded once in parent hook

  /**
   * Load bet types based on active draw
   */
  const loadBetTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX: Always use getAllBetTypesWithFields() for ALL draws
      // Bet types and their fields (prizeFields) are the same across all draws
      // Only the VALUES differ per draw (loaded separately in useEffect line 121-152)
      console.log(`📋 Loading all bet types for ${activeDraw}`);
      const betTypesData = await getAllBetTypesWithFields();

      console.log(`✅ Loaded ${betTypesData.length} bet types for ${activeDraw}`);
      setBetTypes(betTypesData);
    } catch (err) {
      console.error('❌ Error loading bet types:', err);
      setError(err.message || 'Error al cargar tipos de premios');
      setBetTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // NOTA: Con sistema de fallback, ya NO copiamos valores de "general" a loterías específicas
  // Los valores de "general" se usan automáticamente si no hay valor específico

  /**
   * Handle sub-tab change
   */
  const handleSubTabChange = (event, newValue) => {
    setActiveSubTab(newValue);
  };

  /**
   * Scroll tabs left
   */
  const scrollLeft = () => {
    if (lotteryTabsRef.current) {
      lotteryTabsRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Scroll tabs right
   */
  const scrollRight = () => {
    if (lotteryTabsRef.current) {
      lotteryTabsRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Generate field name for formData
   * Format: {drawId}_{betTypeCode}_{fieldCode}
   * Example: general_DIRECTO_DIRECTO_PRIMER_PAGO or draw_1_DIRECTO_DIRECTO_PRIMER_PAGO
   */
  const getFieldName = (betTypeCode, prizeField) => {
    return `${activeDraw}_${betTypeCode}_${prizeField.fieldCode}`;
  };

  /**
   * Get field value from formData with fallback logic
   */
  const getFieldValue = (betTypeCode, prizeField) => {
    const fieldKey = getFieldName(betTypeCode, prizeField);
    const currentValue = formData[fieldKey];

    // Si es "general", usar el valor directamente
    if (activeDraw === 'general') {
      // ✅ FIX: Allow empty strings so users can clear fields
      // Only use default if field doesn't exist yet
      if (currentValue !== undefined && currentValue !== null) {
        return currentValue;
      }
      return prizeField.defaultMultiplier || '';
    }

    // Si es sorteo específico: usar fallback
    // 1. Si tiene valor propio, usarlo (even if empty)
    if (currentValue !== undefined && currentValue !== null) {
      return currentValue;
    }

    // 2. Si no, usar valor de "general"
    const generalKey = `general_${betTypeCode}_${prizeField.fieldCode}`;
    const generalValue = generalValues[generalKey] || formData[generalKey];

    if (generalValue !== undefined && generalValue !== null && generalValue !== '') {
      return generalValue;
    }

    // 3. Último fallback: defaultMultiplier
    return prizeField.defaultMultiplier || '';
  };

  /**
   * Handle field change
   * Validates that only numbers and decimals are entered
   */
  const handleFieldChange = (betTypeCode, prizeField) => (event) => {
    const fieldKey = getFieldName(betTypeCode, prizeField);
    const value = event.target.value;

    // Allow empty value
    if (value === '') {
      handleChange({
        target: {
          name: fieldKey,
          value: ''
        }
      });
      return;
    }

    // Only allow numbers and one decimal point
    // Valid: 123, 123.45, .5, 0.5
    const numberRegex = /^-?\d*\.?\d*$/;
    if (numberRegex.test(value)) {
      handleChange({
        target: {
          name: fieldKey,
          value: value
        }
      });
    }
    // If invalid, don't update (ignore the input)
  };

  /**
   * Render Premios content
   */
  const renderPremiosContent = () => {
    return (
      <>
        {/* Bet Types Accordions */}
        {betTypes.map((betType, index) => (
          <Accordion key={betType.betTypeId} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {betType.betTypeName}
                </Typography>
                {betType.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic', flex: 1 }}
                  >
                    {betType.description}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Render prize type fields for this bet type */}
                {betType.prizeFields && betType.prizeFields.length > 0 ? (
                  betType.prizeFields.map((field) => {
                    const fieldKey = getFieldName(betType.betTypeCode, field);
                    const currentValue = formData[fieldKey];
                    const generalKey = `general_${betType.betTypeCode}_${field.fieldCode}`;
                    const generalValue = generalValues[generalKey] || formData[generalKey];

                    // Determinar si es un valor personalizado
                    const isCustomValue = activeDraw !== 'general' &&
                                         currentValue !== undefined &&
                                         currentValue !== null &&
                                         currentValue !== '';

                    // Crear placeholder que muestre el valor de general si aplica
                    const placeholderText = activeDraw === 'general'
                      ? field.defaultMultiplier?.toString() || '0'
                      : `${generalValue || field.defaultMultiplier || 0} (general)`;

                    return (
                      <Grid item xs={12} md={6} key={field.prizeTypeId}>
                        <TextField
                          fullWidth
                          type="text"
                          label={field.fieldName}
                          name={fieldKey}
                          value={getFieldValue(betType.betTypeCode, field)}
                          onChange={handleFieldChange(betType.betTypeCode, field)}
                          placeholder={placeholderText}
                          inputProps={{
                            step: "0.01",
                            min: field.minMultiplier || 0,
                            max: field.maxMultiplier || 10000,
                            'data-type-id': field.prizeTypeId,
                            'data-field-code': field.fieldCode,
                            'data-default': field.defaultMultiplier,
                            'data-min': field.minMultiplier,
                            'data-max': field.maxMultiplier
                          }}
                          helperText={
                            activeDraw === 'general'
                              ? `Default: ${field.defaultMultiplier || 0} | Rango: ${field.minMultiplier || 0} - ${field.maxMultiplier || 10000}`
                              : isCustomValue
                                ? `✓ Valor personalizado | Rango: ${field.minMultiplier || 0} - ${field.maxMultiplier || 10000}`
                                : `Usando valor de "General": ${generalValue || field.defaultMultiplier || 0} | Rango: ${field.minMultiplier || 0} - ${field.maxMultiplier || 10000}`
                          }
                          FormHelperTextProps={{
                            sx: {
                              fontSize: '0.7rem',
                              color: isCustomValue ? 'primary.main' : 'text.secondary'
                            }
                          }}
                        />
                      </Grid>
                    );
                  })
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No hay campos de premios configurados para este tipo de juego
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    );
  };

  /**
   * Render Comisiones content (placeholder)
   */
  const renderComisionesContent = () => {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          <Typography variant="body1">
            Configuración de <strong>Comisiones</strong> para el sorteo: <strong>{draws.find(l => l.id === activeDraw)?.name || 'General'}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Esta sección estará disponible en una futura actualización.
          </Typography>
        </Alert>
      </Box>
    );
  };

  /**
   * Render Comisiones 2 content (placeholder)
   */
  const renderComisiones2Content = () => {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          <Typography variant="body1">
            Configuración de <strong>Comisiones 2</strong> para el sorteo: <strong>{draws.find(l => l.id === activeDraw)?.name || 'General'}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Esta sección estará disponible en una futura actualización.
          </Typography>
        </Alert>
      </Box>
    );
  };

  /**
   * Render sub-tab content based on active sub-tab
   */
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 0:
        return renderPremiosContent();
      case 1:
        return renderComisionesContent();
      case 2:
        return renderComisiones2Content();
      default:
        return renderPremiosContent();
    }
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          {activeDraw === 'general'
            ? 'Cargando todos los tipos de premios...'
            : `Cargando tipos de premios para ${draws.find(l => l.id === activeDraw)?.name}...`
          }
        </Typography>
      </Box>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          No se pudieron cargar los tipos de premios. Por favor, verifica que el backend esté corriendo y vuelve a intentar.
        </Typography>
      </Box>
    );
  }

  /**
   * Render empty state
   */
  if (betTypes.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No hay tipos de premios configurados en el sistema.
        </Alert>
      </Box>
    );
  }

  /**
   * Render main content with 3-level tab structure
   */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Premios y Comisiones
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configura los pagos de premios y comisiones para cada tipo de juego de lotería.
      </Typography>

      {/* Level 2: Sub-tabs (Premios, Comisiones, Comisiones 2) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeSubTab}
          onChange={handleSubTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab label="Premios" />
          <Tab label="Comisiones" />
          <Tab label="Comisiones 2" />
        </Tabs>
      </Box>

      {/* Level 3: Draw Tabs with Horizontal Scroll */}
      <Box sx={{ mb: 3, position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Scroll Left Button */}
        <IconButton
          onClick={scrollLeft}
          disabled={loadingDraws}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ChevronLeft />
        </IconButton>

        {/* Draw Tabs Container */}
        <Box
          ref={drawTabsRef}
          sx={{
            flex: 1,
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 6
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'action.hover',
              borderRadius: 1
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'primary.main',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }
          }}
        >
          {loadingDraws ? (
            <Chip label="Cargando sorteos..." variant="outlined" />
          ) : (
            draws.map((draw) => (
              <Chip
                key={draw.id}
                label={draw.name}
                onClick={() => setActiveDraw(draw.id)}
                color={activeDraw === draw.id ? 'primary' : 'default'}
                variant={activeDraw === draw.id ? 'filled' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  fontWeight: activeDraw === draw.id ? 'bold' : 'normal',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap'
                }}
              />
            ))
          )}
        </Box>

        {/* Scroll Right Button */}
        <IconButton
          onClick={scrollRight}
          disabled={loadingDraws}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Info Chips */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={`${betTypes.length} tipos de juegos`}
          color="success"
          size="small"
        />
        <Chip
          label={`Sorteo: ${draws.find(l => l.id === activeDraw)?.name || 'General'}`}
          color="primary"
          size="small"
        />
        <Chip
          label={activeSubTab === 0 ? 'Premios' : activeSubTab === 1 ? 'Comisiones' : 'Comisiones 2'}
          color="secondary"
          size="small"
        />
      </Box>

      {/* Sub-tab Content */}
      <Box>
        {renderSubTabContent()}
      </Box>

      {/* Info box at the bottom */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> El tab "General" contiene valores por defecto que se copian automáticamente
            al seleccionar un sorteo específico por primera vez. Puedes modificar los valores de cada sorteo
            de forma independiente en cada sub-tab (Premios, Comisiones, Comisiones 2).
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

/**
 * Custom comparison function for PrizesTab
 */
const arePropsEqual = (prevProps, nextProps) => {
  // Check if handleChange function reference changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check if bettingPoolId changed
  if (prevProps.bettingPoolId !== nextProps.bettingPoolId) {
    return false;
  }

  // Deep comparison of formData (only prize-related fields with lottery prefix)
  const prevKeys = Object.keys(prevProps.formData || {}).filter(key => key.includes('_'));
  const nextKeys = Object.keys(nextProps.formData || {}).filter(key => key.includes('_'));

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of nextKeys) {
    if (prevProps.formData[key] !== nextProps.formData[key]) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(PrizesTab, arePropsEqual);
