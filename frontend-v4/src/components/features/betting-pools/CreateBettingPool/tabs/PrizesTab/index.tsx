/**
 * PrizesTab Component
 *
 * Refactored component with modular architecture.
 * - Constants extracted to ./constants.ts
 * - Types extracted to ./types.ts
 * - UI components extracted to ./components/
 */

import React, { useState, useEffect, useMemo, type SyntheticEvent } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { getAllBetTypesWithFields } from '@services/prizeService';
import { filterBetTypesForDraw } from '@services/betTypeCompatibilityService';

// Internal imports
import type {
  BetType,
  Draw,
  PrizesTabProps,
  GeneralValues,
  ApiDraw,
  DrawsApiResponse,
  PrizeField,
} from './types';
import {
  DRAW_ORDER,
  BET_TYPE_ORDER,
  getAllowedBetTypesForDraw,
} from './constants';
import { BetTypeFieldGrid, CommissionFieldList, DrawTabSelector } from './components';

/**
 * PrizesTab Component with Sub-tabs and Draw Tabs
 * 3-Level Structure:
 * - Level 1: Main tab "Premios & Comisiones"
 * - Level 2: Sub-tabs (Premios, Comisiones, Comisiones 2)
 * - Level 3: Draw tabs (General + ~70 draws)
 */
const PrizesTab: React.FC<PrizesTabProps> = ({
  formData,
  handleChange,
  bettingPoolId = null,
  loadDrawSpecificValues = null,
  draws: propDraws = [],
  loadingDraws: propLoadingDraws = false,
  onSavePrizeConfig = null,
}) => {
  // State
  const [localDraws, setLocalDraws] = useState<Draw[]>([]);
  const [localLoadingDraws, setLocalLoadingDraws] = useState<boolean>(false);
  const [betTypes, setBetTypes] = useState<BetType[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<number>(0);
  const [activeDraw, setActiveDraw] = useState<string>('general');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Save state
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // General values for fallback
  const [generalValues, setGeneralValues] = useState<GeneralValues>({});

  // Use prop draws if provided, otherwise use local draws
  const draws = propDraws.length > 0 ? propDraws : localDraws;
  const loadingDraws = propDraws.length > 0 ? propLoadingDraws : localLoadingDraws;

  // Active draw name for filtering
  const activeDrawName = useMemo(() => {
    if (activeDraw === 'general') return 'General';
    return draws.find(d => d.id === activeDraw)?.name || 'General';
  }, [activeDraw, draws]);

  // Filtered and sorted bet types
  const filteredBetTypes = useMemo(() => {
    const filtered = filterBetTypesForDraw(betTypes, activeDrawName);
    return [...filtered].sort((a, b) => {
      const indexA = BET_TYPE_ORDER.indexOf(a.betTypeCode);
      const indexB = BET_TYPE_ORDER.indexOf(b.betTypeCode);
      const posA = indexA === -1 ? 999 : indexA;
      const posB = indexB === -1 ? 999 : indexB;
      return posA - posB;
    });
  }, [betTypes, activeDrawName]);

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

  // Load bet types when draw changes
  useEffect(() => {
    if (draws.length > 0) {
      loadBetTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraw, draws.length]);

  // Load draw-specific values when switching to a draw tab
  useEffect(() => {
    if (bettingPoolId && loadDrawSpecificValues && activeDraw !== 'general' && activeDraw.startsWith('draw_')) {
      const drawId = parseInt(activeDraw.split('_')[1]);
      loadDrawSpecificValues(drawId, bettingPoolId)
        .then(drawValues => {
          if (Object.keys(drawValues).length > 0) {
            Object.keys(drawValues).forEach(key => {
              handleChange({
                target: { name: key, value: drawValues[key] }
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

  // Load general values once for fallback
  useEffect(() => {
    const loadGeneralDefaults = async () => {
      try {
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
          setGeneralValues(generalVals);
        }
      } catch (error) {
        console.error('[ERROR] [FALLBACK] Error loading general values:', error);
      }
    };
    loadGeneralDefaults();
  }, []);

  /**
   * Load bet types based on active draw
   */
  const loadBetTypes = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const currentDraw = draws.find(d => d.id === activeDraw);
      const drawName = currentDraw?.name || 'General';

      const betTypesData = await getAllBetTypesWithFields();

      let mappedBetTypes: BetType[] = betTypesData.map(bt => ({
        betTypeId: bt.betTypeId,
        betTypeName: bt.betTypeName,
        betTypeCode: bt.betTypeCode || '',
        description: undefined,
        prizeFields: (bt.prizeFields || []).map(pf => ({
          prizeTypeId: pf.prizeTypeId,
          fieldName: pf.fieldName,
          fieldCode: pf.fieldCode,
          defaultMultiplier: pf.defaultValue || 0,
          minMultiplier: undefined,
          maxMultiplier: undefined
        }))
      }));

      const allowedCodes = getAllowedBetTypesForDraw(drawName);
      if (allowedCodes) {
        mappedBetTypes = mappedBetTypes.filter(bt => allowedCodes.includes(bt.betTypeCode));
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

  /**
   * Handle sub-tab change
   */
  const handleSubTabChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveSubTab(newValue);
  };

  /**
   * Handle field change from grid
   */
  const handleFieldChange = (fieldKey: string, value: string): void => {
    handleChange({
      target: { name: fieldKey, value }
    });
  };

  /**
   * Handle save for current draw
   */
  const handleSave = async (): Promise<void> => {
    if (!onSavePrizeConfig || !bettingPoolId) {
      setSaveError('No se puede guardar: falta configuration');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      await onSavePrizeConfig(activeDraw);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(`[ERROR] Error saving prize config:`, err);
      const error = err as Error;
      setSaveError(error.message || 'Error al guardar configuration de premios');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="body2" color="text.secondary">
          No se pudieron cargar los tipos de premios. Por favor, verifica que el backend esté corriendo y vuelve a intentar.
        </Typography>
      </Box>
    );
  }

  // Empty state
  if (betTypes.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No hay tipos de premios configurados en el sistema.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Premios y Comisiones
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configura los pagos de premios y comisiones para cada tipo de juego de lotería.
      </Typography>

      {/* Level 2: Sub-tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeSubTab}
          onChange={handleSubTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { fontWeight: 'bold', fontSize: '0.95rem' }
          }}
        >
          <Tab label="Premios" />
          <Tab label="Comisiones" />
          <Tab label="Comisiones 2" />
        </Tabs>
      </Box>

      {/* Level 3: Draw Tabs */}
      <DrawTabSelector
        draws={draws}
        activeDraw={activeDraw}
        loadingDraws={loadingDraws}
        onDrawSelect={setActiveDraw}
      />

      {/* Sub-tab Content */}
      <Box>
        {activeSubTab === 0 ? (
          <BetTypeFieldGrid
            betTypes={filteredBetTypes}
            activeDraw={activeDraw}
            formData={formData}
            generalValues={generalValues}
            fieldType="prize"
            onFieldChange={handleFieldChange}
            bettingPoolId={bettingPoolId}
            saving={saving}
            onSave={onSavePrizeConfig ? handleSave : undefined}
          />
        ) : (
          <CommissionFieldList
            betTypes={filteredBetTypes}
            activeDraw={activeDraw}
            formData={formData}
            generalValues={generalValues}
            fieldType={activeSubTab === 1 ? 'commission' : 'commission2'}
            onFieldChange={handleFieldChange}
            bettingPoolId={bettingPoolId}
            saving={saving}
            onSave={onSavePrizeConfig ? handleSave : undefined}
          />
        )}
      </Box>

      {/* Info box */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Nota:</strong> Los valores del tab "General" se propagan automáticamente a todos los sorteos.
            Si deseas configurar un valor diferente para un sorteo específico, selecciona ese sorteo y haz clic
            en "ACTUALIZAR" para guardar solo ese sorteo (esto creará un override que no se verá afectado por
            cambios futuros en "General").
          </Typography>
        </Alert>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }} icon={<CheckCircleIcon />}>
          Configuración guardada exitosamente para {draws.find(l => l.id === activeDraw)?.name || activeDraw}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSaveError(null)} severity="error" sx={{ width: '100%' }}>
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
  if (prevProps.handleChange !== nextProps.handleChange) return false;
  if (prevProps.bettingPoolId !== nextProps.bettingPoolId) return false;

  const prevKeys = Object.keys(prevProps.formData || {}).filter(key => key.includes('_'));
  const nextKeys = Object.keys(nextProps.formData || {}).filter(key => key.includes('_'));

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of nextKeys) {
    if (prevProps.formData[key] !== nextProps.formData[key]) return false;
  }

  return true;
};

export default React.memo(PrizesTab, arePropsEqual);
