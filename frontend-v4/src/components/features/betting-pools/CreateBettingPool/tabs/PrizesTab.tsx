import React, { useState, useEffect, useRef, useMemo, type ChangeEvent, type SyntheticEvent } from 'react';
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
  Button,
  Snackbar,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ChevronLeft, ChevronRight, Save as SaveIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getAllBetTypesWithFields } from '@services/prizeService';
import { filterBetTypesForDraw } from '@services/betTypeCompatibilityService';
// ⚡ getAllDraws removed - draws now loaded in parent
// ⚡ getBetTypesByDraw removed - now using getAllBetTypesWithFields for all draws

interface PrizeField {
  prizeTypeId: number;
  fieldName: string;
  fieldCode: string;
  defaultMultiplier: number;
  minMultiplier?: number;
  maxMultiplier?: number;
}

// Local BetType interface (different from service's BetType)
interface BetType {
  betTypeId: number;
  betTypeName: string;
  betTypeCode: string;
  description?: string;
  prizeFields: PrizeField[];
}

interface Draw {
  id: string;
  name: string;
  drawId?: number;
}

interface _CommissionField {
  id: string;
  name: string;
  fieldCode: string;
}

interface PrizesFormData {
  [key: string]: string | number | boolean;
}

interface GeneralValues {
  [key: string]: number | string;
}

interface SyntheticEventLike {
  target: {
    name: string;
    value: string | number;
  };
}

interface PrizesTabProps {
  formData: PrizesFormData;
  handleChange: (e: SyntheticEventLike) => void;
  bettingPoolId?: number | null;
  loadDrawSpecificValues?: ((drawId: number, bettingPoolId: number) => Promise<Record<string, string | number>>) | null;
  draws?: Draw[];
  loadingDraws?: boolean;
  onSavePrizeConfig?: ((activeDraw: string) => Promise<void>) | null;
}

interface ApiDraw {
  drawId: number;
  drawName: string;
  isActive?: boolean;
}

interface DrawsApiResponse {
  success: boolean;
  data?: ApiDraw[];
}

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
 * Bet type codes that apply to each draw category
 * Based on analysis of the original Vue.js application (la-numbers.apk.lol)
 */

// Basic bet types (Dominicans, Nicaragua, Anguila, King Lottery)
// Note: PALÉ has accent in database
const BASIC_BET_TYPES = ['DIRECTO', 'PALÉ', 'TRIPLETA'];

// USA bet types (all USA draws) - includes basic + all Cash3, Play4, Pick5, Bolita, Singulación, Pick Two variants
// Note: Some codes use spaces, some use underscores - must match database exactly
const USA_BET_TYPES = [
  'DIRECTO', 'PALÉ', 'TRIPLETA',
  'CASH3_STRAIGHT', 'CASH3_BOX', 'CASH3_FRONT_BOX', 'CASH3_BACK_STRAIGHT',
  'CASH3 FRONT STRAIGHT', 'CASH3 BACK BOX',
  'PLAY4 STRAIGHT', 'PLAY4 BOX',
  'BOLITA 1', 'BOLITA 2',
  'SINGULACION', 'SINGULACIÓN 1', 'SINGULACIÓN 2', 'SINGULACIÓN 3',
  'PICK5 STRAIGHT', 'PICK5 BOX',
  'PICK2', 'PICK TWO', 'PICK TWO FRONT', 'PICK TWO BACK', 'PICK TWO MIDDLE'
];

// Super Pale bet types (only Super Pale)
const SUPER_PALE_BET_TYPES = ['SUPER_PALE'];

// Panama bet types (basic + Panama)
const PANAMA_BET_TYPES = ['DIRECTO', 'PALÉ', 'TRIPLETA', 'PANAMA'];

// Draw categories
const DOMINICAN_DRAWS = [
  'NACIONAL', 'LA PRIMERA', 'LA PRIMERA 8PM', 'GANA MAS',
  'LA SUERTE', 'LA SUERTE 6:00pm', 'LOTEKA', 'LOTEDOM',
  'LA CHICA', 'REAL', 'QUINIELA PALE',
  'L.E. PUERTO RICO 2PM', 'L.E. PUERTO RICO 10PM'
];

const NICARAGUA_DRAWS = ['DIARIA 11AM', 'DIARIA 3PM', 'DIARIA 9PM'];

const ANGUILA_DRAWS = ['Anguila 10am', 'Anguila 1pm', 'Anguila 6PM', 'Anguila 9pm'];

const KING_LOTTERY_DRAWS = ['King Lottery AM', 'King Lottery PM'];

const USA_DRAWS = [
  'NEW YORK DAY', 'NEW YORK NIGHT',
  'FLORIDA AM', 'FLORIDA PM', 'FL PICK2 AM', 'FL PICK2 PM',
  'GEORGIA-MID AM', 'GEORGIA EVENING', 'GEORGIA NIGHT',
  'NEW JERSEY AM', 'NEW JERSEY PM',
  'CONNECTICUT AM', 'CONNECTICUT PM',
  'CALIFORNIA AM', 'CALIFORNIA PM',
  'CHICAGO AM', 'CHICAGO PM',
  'PENN MIDDAY', 'PENN EVENING',
  'INDIANA MIDDAY', 'INDIANA EVENING',
  'TEXAS MORNING', 'TEXAS DAY', 'TEXAS EVENING', 'TEXAS NIGHT',
  'VIRGINIA AM', 'VIRGINIA PM',
  'SOUTH CAROLINA AM', 'SOUTH CAROLINA PM',
  'MARYLAND MIDDAY', 'MARYLAND EVENING',
  'MASS AM', 'MASS PM',
  'NORTH CAROLINA AM', 'NORTH CAROLINA PM',
  'DELAWARE AM', 'DELAWARE PM',
  'NY AM 6x1', 'NY PM 6x1', 'FL AM 6X1', 'FL PM 6X1'
];

const SUPER_PALE_DRAWS = [
  'SUPER PALE TARDE', 'SUPER PALE NOCHE',
  'SUPER PALE NY-FL AM', 'SUPER PALE NY-FL PM'
];

const PANAMA_DRAWS = ['PANAMA MIERCOLES', 'PANAMA DOMINGO'];

/**
 * Get allowed bet type codes for a specific draw
 */
const getAllowedBetTypesForDraw = (drawName: string): string[] | null => {
  // If "General" or "general", return null (show all)
  if (!drawName || drawName.toLowerCase() === 'general') {
    return null;
  }

  if (DOMINICAN_DRAWS.includes(drawName)) return BASIC_BET_TYPES;
  if (NICARAGUA_DRAWS.includes(drawName)) return BASIC_BET_TYPES;
  if (ANGUILA_DRAWS.includes(drawName)) return BASIC_BET_TYPES;
  if (KING_LOTTERY_DRAWS.includes(drawName)) return BASIC_BET_TYPES;
  if (USA_DRAWS.includes(drawName)) return USA_BET_TYPES;
  if (SUPER_PALE_DRAWS.includes(drawName)) return SUPER_PALE_BET_TYPES;
  if (PANAMA_DRAWS.includes(drawName)) return PANAMA_BET_TYPES;

  // Default: return null (show all) for unknown draws
  return null;
};

/**
 * PrizesTab Component with Sub-tabs and Draw Tabs (like V1)
 * 3-Level Structure:
 * - Level 1: Main tab "Premios & Comisiones"
 * - Level 2: Sub-tabs (Premios, Comisiones, Comisiones 2)
 * - Level 3: Draw tabs (General + ~70 draws)
 */
const PrizesTab: React.FC<PrizesTabProps> = ({ formData, handleChange, bettingPoolId = null, loadDrawSpecificValues = null, draws: propDraws = [], loadingDraws: propLoadingDraws = false, onSavePrizeConfig = null }) => {
  // ⚡ PERFORMANCE: Draws loaded in parent hook when provided, otherwise load locally (backward compatible)
  const [localDraws, setLocalDraws] = useState<Draw[]>([]);
  const [localLoadingDraws, setLocalLoadingDraws] = useState<boolean>(false);
  const [betTypes, setBetTypes] = useState<BetType[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<number>(0); // 0=Premios, 1=Comisiones, 2=Comisiones 2
  const [activeDraw, setActiveDraw] = useState<string>('general');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const drawTabsRef = useRef<HTMLDivElement>(null);

  // 🔥 NEW: Save state for ACTUALIZAR button
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Use prop draws if provided, otherwise use local draws
  const draws = propDraws.length > 0 ? propDraws : localDraws;
  const loadingDraws = propDraws.length > 0 ? propLoadingDraws : localLoadingDraws;

  // 🔍 DEBUG: Log draws to diagnose issue
  console.log(`[DEBUG] [PrizesTab DEBUG] propDraws.length=${propDraws.length}, localDraws.length=${localDraws.length}, final draws.length=${draws.length}`);

  // 🔥 Filter bet types based on active draw (using betTypeCompatibilityService)
  const activeDrawName = useMemo(() => {
    if (activeDraw === 'general') return 'General';
    return draws.find(d => d.id === activeDraw)?.name || 'General';
  }, [activeDraw, draws]);

  const filteredBetTypes = useMemo(() => {
    return filterBetTypesForDraw(betTypes, activeDrawName);
  }, [betTypes, activeDrawName]);

  // State for valores "general" (usados como fallback)
  const [generalValues, setGeneralValues] = useState<GeneralValues>({});

  // Load draws locally only if not provided by parent
  useEffect(() => {
    if (propDraws.length === 0) {
      const loadLocalDraws = async () => {
        try {
          setLocalLoadingDraws(true);
          const { getAllDraws } = await import('@services/drawService');
          const drawsResponse = await getAllDraws({ isActive: true, loadAll: true }) as DrawsApiResponse;
          if (drawsResponse.success && drawsResponse.data) {
            const apiDraws: Draw[] = drawsResponse.data.map((draw: ApiDraw) => ({
              id: `draw_${draw.drawId}`,
              name: draw.drawName,
              drawId: draw.drawId
            }));
            const sortedDraws = DRAW_ORDER
              .map(orderName => apiDraws.find(draw => draw.name === orderName))
              .filter((draw): draw is Draw => draw !== undefined);
            const unorderedDraws = apiDraws.filter(draw => !DRAW_ORDER.includes(draw.name));
            const formattedDraws: Draw[] = [
              { id: 'general', name: 'General' },
              ...sortedDraws,
              ...unorderedDraws
            ];
            setLocalDraws(formattedDraws);
            console.log(`[SUCCESS] Loaded ${formattedDraws.length} draws locally (PrizesTab fallback)`);
          } else {
            setLocalDraws([{ id: 'general', name: 'General' }]);
          }
        } catch (err) {
          console.error('[ERROR] Error loading draws locally:', err);
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
   * 🎯 Also depends on draws array to filter correctly
   */
  useEffect(() => {
    // Only load when draws are available (for correct filtering)
    if (draws.length > 0) {
      loadBetTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraw, draws.length]);

  /**
   * 🔥 NEW: Load draw-specific values when switching to a draw tab
   */
  useEffect(() => {
    console.log(`[DEBUG] [LOAD CHECK] activeDraw: ${activeDraw}, bettingPoolId: ${bettingPoolId}, hasLoadFn: ${!!loadDrawSpecificValues}`);

    // Only load if:
    // 1. We're editing (bettingPoolId exists)
    // 2. We have the load function
    // 3. We're on a specific draw tab (not general)
    if (bettingPoolId && loadDrawSpecificValues && activeDraw !== 'general' && activeDraw.startsWith('draw_')) {
      const drawId = parseInt(activeDraw.split('_')[1]);
      console.log(`[TARGET] Tab changed to draw ${drawId}, loading specific values...`);

      loadDrawSpecificValues(drawId, bettingPoolId)
        .then(drawValues => {
          if (Object.keys(drawValues).length > 0) {
            console.log(`[SUCCESS] Loaded draw values, updating form data...`);
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
          console.error(`[ERROR] Error loading draw-specific values:`, error);
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
        console.log('[LIST] [FALLBACK] Loading general values for fallback...');
        const allBetTypes = await getAllBetTypesWithFields() as unknown as BetType[];

        if (allBetTypes && Array.isArray(allBetTypes)) {
          const generalVals: GeneralValues = {};

          allBetTypes.forEach((betType: BetType) => {
            const betTypeCode = betType.betTypeCode;
            const prizeFields = betType.prizeFields || [];

            prizeFields.forEach((field: PrizeField) => {
              const fieldCode = field.fieldCode;
              const defaultValue = field.defaultMultiplier;

              if (fieldCode && defaultValue !== undefined && betTypeCode) {
                const key = `general_${betTypeCode}_${fieldCode}`;
                generalVals[key] = defaultValue;
              }
            });
          });

          console.log(`[SUCCESS] [FALLBACK] General values loaded: ${Object.keys(generalVals).length} fields`);
          setGeneralValues(generalVals);
        }
      } catch (error) {
        console.error('[ERROR] [FALLBACK] Error loading general values:', error);
      }
    };

    loadGeneralDefaults();
  }, []);

  // ⚡ PERFORMANCE: loadInitialData removed - draws now loaded once in parent hook

  /**
   * Load bet types based on active draw
   * 🎯 Filters bet types based on draw category (Dominican, USA, Super Pale, Panama)
   */
  const loadBetTypes = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Get the draw name for filtering
      const currentDraw = draws.find(d => d.id === activeDraw);
      const drawName = currentDraw?.name || 'General';

      console.log(`[LIST] Loading bet types for ${activeDraw} (${drawName})`);
      const betTypesData = await getAllBetTypesWithFields();

      console.log(`[SUCCESS] Loaded ${betTypesData.length} total bet types from API`);

      // Map service BetType to local BetType (ensure required fields have defaults)
      let mappedBetTypes: BetType[] = betTypesData.map(bt => ({
        betTypeId: bt.betTypeId,
        betTypeName: bt.betTypeName,
        betTypeCode: bt.betTypeCode || '',
        description: undefined, // Service BetType doesn't have description
        prizeFields: (bt.prizeFields || []).map(pf => ({
          prizeTypeId: pf.prizeTypeId,
          fieldName: pf.fieldName,
          fieldCode: pf.fieldCode,
          defaultMultiplier: pf.defaultValue || 0, // Map defaultValue to defaultMultiplier
          minMultiplier: undefined,
          maxMultiplier: undefined
        }))
      }));

      // 🎯 Filter bet types based on draw category
      const allowedCodes = getAllowedBetTypesForDraw(drawName);
      if (allowedCodes) {
        mappedBetTypes = mappedBetTypes.filter(bt => allowedCodes.includes(bt.betTypeCode));
        console.log(`[FILTER] ${drawName} allows ${allowedCodes.length} bet types: ${allowedCodes.join(', ')}`);
        console.log(`[FILTER] Filtered to ${mappedBetTypes.length} bet types`);
      } else {
        console.log(`[FILTER] ${drawName} shows ALL bet types (${mappedBetTypes.length})`);
      }

      setBetTypes(mappedBetTypes);
    } catch (err) {
      console.error('[ERROR] Error loading bet types:', err);
      const error = err as Error;
      setError(error.message || 'Error al cargar tipos de premios');
      setBetTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // NOTE: Con sistema de fallback, ya NO copiamos valores de "general" a loterías específicas
  // Los valores de "general" se usan automaticmente si no hay valor específico

  /**
   * Handle sub-tab change
   */
  const handleSubTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveSubTab(newValue);
  };

  /**
   * Scroll tabs left
   */
  const scrollLeft = (): void => {
    if (drawTabsRef.current) {
      drawTabsRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Scroll tabs right
   */
  const scrollRight = (): void => {
    if (drawTabsRef.current) {
      drawTabsRef.current.scrollBy({
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
  const getFieldName = (betTypeCode: string, prizeField: PrizeField): string => {
    return `${activeDraw}_${betTypeCode}_${prizeField.fieldCode}`;
  };

  /**
   * Get field value from formData with fallback logic
   */
  const getFieldValue = (betTypeCode: string, prizeField: PrizeField): string | number => {
    const fieldKey = getFieldName(betTypeCode, prizeField);
    const currentValue = formData[fieldKey];

    // Si es "general", usar el valor directamente
    if (activeDraw === 'general') {
      // ✅ FIX: Allow empty strings so users can clear fields
      // Only use default if field doesn't exist yet
      if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
        return currentValue;
      }
      return prizeField.defaultMultiplier || '';
    }

    // Si es sorteo específico: usar fallback
    // 1. Si tiene valor propio, usarlo (even if empty)
    if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
      return currentValue;
    }

    // 2. Si no, usar valor de "general"
    // 🔥 FIX: Priorizar formData (cambios del usuario) sobre generalValues (valores de la API)
    const generalKey = `general_${betTypeCode}_${prizeField.fieldCode}`;
    const formDataGeneralValue = formData[generalKey];
    const generalValue = (formDataGeneralValue !== undefined && formDataGeneralValue !== null && formDataGeneralValue !== '' && typeof formDataGeneralValue !== 'boolean')
      ? formDataGeneralValue
      : generalValues[generalKey];

    if (generalValue !== undefined && generalValue !== null && generalValue !== '' && typeof generalValue !== 'boolean') {
      return generalValue;
    }

    // 3. Último fallback: defaultMultiplier
    return prizeField.defaultMultiplier || '';
  };

  /**
   * Handle field change
   * Validates that only numbers and decimals are entered
   */
  const handleFieldChange = (betTypeCode: string, prizeField: PrizeField) => (event: ChangeEvent<HTMLInputElement>): void => {
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
   * Handle save for current draw
   * 🔥 NEW: Save only the active draw's prize configuration
   */
  const handleSave = async (): Promise<void> => {
    if (!onSavePrizeConfig || !bettingPoolId) {
      console.warn('[ERROR] Cannot save: onSavePrizeConfig or bettingPoolId is missing');
      setSaveError('No se puede guardar: falta configuration');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      console.log(`[SAVE] Saving prize config for draw: ${activeDraw}`);

      await onSavePrizeConfig(activeDraw);

      setSaveSuccess(true);
      console.log(`[SUCCESS] Prize config saved successfully for ${activeDraw}`);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(`[ERROR] Error saving prize config:`, err);
      const error = err as Error;
      setSaveError(error.message || 'Error al guardar configuration de premios');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Render Premios content
   */
  const renderPremiosContent = () => {
    return (
      <>
        {/* Bet Types Accordions - Filtered by active draw */}
        {filteredBetTypes.map((betType, index) => (
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
                    // 🔥 FIX: Priorizar formData (cambios del usuario) sobre generalValues (valores de la API)
                    const formDataGenVal = formData[generalKey];
                    const generalValue = (formDataGenVal !== undefined && formDataGenVal !== null && formDataGenVal !== '' && typeof formDataGenVal !== 'boolean')
                      ? formDataGenVal
                      : generalValues[generalKey];

                    // Determinar si es un valor personalizado
                    const isCustomValue = activeDraw !== 'general' &&
                                         currentValue !== undefined &&
                                         currentValue !== null &&
                                         currentValue !== '';

                    // Create placeholder que muestre el valor de general si aplica
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

        {/* 🔥 NEW: ACTUALIZAR button (like Vue.js original) */}
        {bettingPoolId && onSavePrizeConfig && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {saving ? 'Guardando...' : 'ACTUALIZAR'}
            </Button>
          </Box>
        )}
      </>
    );
  };

  /**
   * Commission field definitions for "Comisiones" tab
   * Based on BettingPoolPrizesCommission model: commission_discount_1 through 4
   */
  const COMMISSION_FIELDS = [
    { id: 'commissionDiscount1', name: 'Comisión Descuento 1', fieldCode: 'COMMISSION_DISCOUNT_1' },
    { id: 'commissionDiscount2', name: 'Comisión Descuento 2', fieldCode: 'COMMISSION_DISCOUNT_2' },
    { id: 'commissionDiscount3', name: 'Comisión Descuento 3', fieldCode: 'COMMISSION_DISCOUNT_3' },
    { id: 'commissionDiscount4', name: 'Comisión Descuento 4', fieldCode: 'COMMISSION_DISCOUNT_4' },
  ];

  /**
   * Generate commission field name for formData
   * Format: {drawId}_COMMISSION_{betTypeCode}_{fieldCode}
   */
  const getCommissionFieldName = (betTypeCode: string, fieldCode: string): string => {
    return `${activeDraw}_COMMISSION_${betTypeCode}_${fieldCode}`;
  };

  /**
   * Get commission field value from formData with fallback logic
   */
  const getCommissionFieldValue = (betTypeCode: string, fieldCode: string): string | number => {
    const fieldKey = getCommissionFieldName(betTypeCode, fieldCode);
    const currentValue = formData[fieldKey];

    // If "general", use the value directly
    if (activeDraw === 'general') {
      if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
        return currentValue;
      }
      return ''; // Default to empty
    }

    // For specific draw: use fallback
    if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
      return currentValue;
    }

    // Fallback to "general" value
    const generalKey = `general_COMMISSION_${betTypeCode}_${fieldCode}`;
    const generalValue = formData[generalKey];

    if (generalValue !== undefined && generalValue !== null && generalValue !== '' && typeof generalValue !== 'boolean') {
      return generalValue;
    }

    return '';
  };

  /**
   * Handle commission field change
   */
  const handleCommissionFieldChange = (betTypeCode: string, fieldCode: string) => (event: ChangeEvent<HTMLInputElement>): void => {
    const fieldKey = getCommissionFieldName(betTypeCode, fieldCode);
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

    // Only allow numbers and one decimal point (percentages 0-100)
    const numberRegex = /^-?\d*\.?\d*$/;
    if (numberRegex.test(value)) {
      handleChange({
        target: {
          name: fieldKey,
          value: value
        }
      });
    }
  };

  /**
   * Render Comisiones content
   * Shows commission discount fields (1-4) per bet type
   */
  const renderComisionesContent = () => {
    return (
      <>
        {/* Bet Types Accordions with Commission Fields - Filtered by active draw */}
        {filteredBetTypes.map((betType, index) => (
          <Accordion key={`commission-${betType.betTypeId}`} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {betType.betTypeName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic', flex: 1 }}
                >
                  Comisiones de descuento
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {COMMISSION_FIELDS.map((field) => {
                  const fieldKey = getCommissionFieldName(betType.betTypeCode, field.fieldCode);
                  const currentValue = formData[fieldKey];
                  const generalKey = `general_COMMISSION_${betType.betTypeCode}_${field.fieldCode}`;
                  const generalValue = formData[generalKey];

                  // Determine if it's a custom value
                  const isCustomValue = activeDraw !== 'general' &&
                                       currentValue !== undefined &&
                                       currentValue !== null &&
                                       currentValue !== '';

                  // Placeholder showing general value
                  const placeholderText = activeDraw === 'general'
                    ? '0'
                    : `${generalValue || 0} (general)`;

                  return (
                    <Grid item xs={12} sm={6} md={3} key={field.id}>
                      <TextField
                        fullWidth
                        type="text"
                        label={field.name}
                        name={fieldKey}
                        value={getCommissionFieldValue(betType.betTypeCode, field.fieldCode)}
                        onChange={handleCommissionFieldChange(betType.betTypeCode, field.fieldCode)}
                        placeholder={placeholderText}
                        InputProps={{
                          endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>%</Typography>
                        }}
                        inputProps={{
                          step: "0.01",
                          min: 0,
                          max: 100,
                          'data-field-code': field.fieldCode,
                        }}
                        helperText={
                          activeDraw === 'general'
                            ? 'Rango: 0 - 100%'
                            : isCustomValue
                              ? '✓ Valor personalizado'
                              : `Usando valor de "General": ${generalValue || 0}%`
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
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* ACTUALIZAR button for Comisiones */}
        {bettingPoolId && onSavePrizeConfig && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {saving ? 'Guardando...' : 'ACTUALIZAR'}
            </Button>
          </Box>
        )}
      </>
    );
  };

  /**
   * Commission 2 field definitions for "Comisiones 2" tab
   * Based on BettingPoolPrizesCommission model: commission_2_discount_1 through 4
   */
  const COMMISSION_2_FIELDS = [
    { id: 'commission2Discount1', name: 'Comisión 2 Descuento 1', fieldCode: 'COMMISSION_2_DISCOUNT_1' },
    { id: 'commission2Discount2', name: 'Comisión 2 Descuento 2', fieldCode: 'COMMISSION_2_DISCOUNT_2' },
    { id: 'commission2Discount3', name: 'Comisión 2 Descuento 3', fieldCode: 'COMMISSION_2_DISCOUNT_3' },
    { id: 'commission2Discount4', name: 'Comisión 2 Descuento 4', fieldCode: 'COMMISSION_2_DISCOUNT_4' },
  ];

  /**
   * Generate commission 2 field name for formData
   * Format: {drawId}_COMMISSION2_{betTypeCode}_{fieldCode}
   */
  const getCommission2FieldName = (betTypeCode: string, fieldCode: string): string => {
    return `${activeDraw}_COMMISSION2_${betTypeCode}_${fieldCode}`;
  };

  /**
   * Get commission 2 field value from formData with fallback logic
   */
  const getCommission2FieldValue = (betTypeCode: string, fieldCode: string): string | number => {
    const fieldKey = getCommission2FieldName(betTypeCode, fieldCode);
    const currentValue = formData[fieldKey];

    // If "general", use the value directly
    if (activeDraw === 'general') {
      if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
        return currentValue;
      }
      return ''; // Default to empty
    }

    // For specific draw: use fallback
    if (currentValue !== undefined && currentValue !== null && typeof currentValue !== 'boolean') {
      return currentValue;
    }

    // Fallback to "general" value
    const generalKey = `general_COMMISSION2_${betTypeCode}_${fieldCode}`;
    const generalValue = formData[generalKey];

    if (generalValue !== undefined && generalValue !== null && generalValue !== '' && typeof generalValue !== 'boolean') {
      return generalValue;
    }

    return '';
  };

  /**
   * Handle commission 2 field change
   */
  const handleCommission2FieldChange = (betTypeCode: string, fieldCode: string) => (event: ChangeEvent<HTMLInputElement>): void => {
    const fieldKey = getCommission2FieldName(betTypeCode, fieldCode);
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

    // Only allow numbers and one decimal point (percentages 0-100)
    const numberRegex = /^-?\d*\.?\d*$/;
    if (numberRegex.test(value)) {
      handleChange({
        target: {
          name: fieldKey,
          value: value
        }
      });
    }
  };

  /**
   * Render Comisiones 2 content
   * Shows commission 2 discount fields (1-4) per bet type
   */
  const renderComisiones2Content = () => {
    return (
      <>
        {/* Bet Types Accordions with Commission 2 Fields - Filtered by active draw */}
        {filteredBetTypes.map((betType, index) => (
          <Accordion key={`commission2-${betType.betTypeId}`} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {betType.betTypeName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic', flex: 1 }}
                >
                  Comisiones 2 de descuento
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {COMMISSION_2_FIELDS.map((field) => {
                  const fieldKey = getCommission2FieldName(betType.betTypeCode, field.fieldCode);
                  const currentValue = formData[fieldKey];
                  const generalKey = `general_COMMISSION2_${betType.betTypeCode}_${field.fieldCode}`;
                  const generalValue = formData[generalKey];

                  // Determine if it's a custom value
                  const isCustomValue = activeDraw !== 'general' &&
                                       currentValue !== undefined &&
                                       currentValue !== null &&
                                       currentValue !== '';

                  // Placeholder showing general value
                  const placeholderText = activeDraw === 'general'
                    ? '0'
                    : `${generalValue || 0} (general)`;

                  return (
                    <Grid item xs={12} sm={6} md={3} key={field.id}>
                      <TextField
                        fullWidth
                        type="text"
                        label={field.name}
                        name={fieldKey}
                        value={getCommission2FieldValue(betType.betTypeCode, field.fieldCode)}
                        onChange={handleCommission2FieldChange(betType.betTypeCode, field.fieldCode)}
                        placeholder={placeholderText}
                        InputProps={{
                          endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>%</Typography>
                        }}
                        inputProps={{
                          step: "0.01",
                          min: 0,
                          max: 100,
                          'data-field-code': field.fieldCode,
                        }}
                        helperText={
                          activeDraw === 'general'
                            ? 'Rango: 0 - 100%'
                            : isCustomValue
                              ? '✓ Valor personalizado'
                              : `Usando valor de "General": ${generalValue || 0}%`
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
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* ACTUALIZAR button for Comisiones 2 */}
        {bettingPoolId && onSavePrizeConfig && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {saving ? 'Guardando...' : 'ACTUALIZAR'}
            </Button>
          </Box>
        )}
      </>
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
          label={`${filteredBetTypes.length} tipos de juegos`}
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
            <strong>Nota:</strong> El tab "General" contiene valores by default que se copian automaticmente
            al seleccionar un sorteo específico por primera vez. Puedes modificar los valores de cada sorteo
            de forma independiente en cada sub-tab (Premios, Comisiones, Comisiones 2).
          </Typography>
        </Alert>
      </Box>

      {/* 🔥 NEW: Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSaveSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
          icon={<CheckCircleIcon />}
        >
          Configuración guardada exitosamente para {draws.find(l => l.id === activeDraw)?.name || activeDraw}
        </Alert>
      </Snackbar>

      {/* 🔥 NEW: Error Snackbar */}
      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSaveError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {saveError || 'Error al guardar configuration'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

/**
 * Custom comparison function for PrizesTab
 */
const arePropsEqual = (prevProps: PrizesTabProps, nextProps: PrizesTabProps): boolean => {
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
